'use server';

const API_KEY = process.env.BETTERSTACK_API_KEY;
const STATUS_PAGE_ID = process.env.BETTERSTACK_STATUS_PAGE_ID;
const BASE_URL = 'https://uptime.betterstack.com/api/v2';

async function fetchBetterstack(endpoint: string) {
    if (!API_KEY) {
        throw new Error('BETTERSTACK_API_KEY is not configured');
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
        next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!res.ok) {
        const error = await res.text();
        console.error(`Betterstack API Error (${endpoint}):`, error);
        throw new Error(`Betterstack API responded with ${res.status}`);
    }

    return res.json();
}

export async function getStatusOverview() {
    try {
        if (!STATUS_PAGE_ID) return { status: 'unknown', components: [] };

        // Fetch components and scheduled maintenances in parallel
        const [resources, schedule] = await Promise.all([
            fetchBetterstack(`/status-pages/${STATUS_PAGE_ID}/status-page-resources`),
            fetchBetterstack(`/status-pages/${STATUS_PAGE_ID}/status-page-scheduled-maintenances`)
        ]);

        // Check if any scheduled maintenance is currently in progress
        const hasActiveMaintenance = schedule.data.some((m: any) =>
            m.attributes.status === 'in_progress' || m.attributes.status === 'ongoing'
        );

        // Betterstack component statuses: 
        // 0: operational, 1: degraded performance, 2: partial outage, 3: major outage, 4: maintenance
        const components = resources.data.map((r: any) => ({
            name: r.attributes.public_name,
            status: r.attributes.status,
            id: r.id
        }));

        const isDown = components.some((c: any) => c.status === 2 || c.status === 3);
        const isDegraded = components.some((c: any) => c.status === 1);
        const isMaintenance = components.some((c: any) => c.status === 4) || hasActiveMaintenance;

        let globalStatus = 'operational';
        if (isDown) globalStatus = 'down';
        else if (isMaintenance) globalStatus = 'maintenance';
        else if (isDegraded) globalStatus = 'degraded';

        return {
            status: globalStatus,
            components,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Failed to fetch status overview:', error);
        return { status: 'error', components: [], message: 'Connectivity failure to telemetry node' };
    }
}

export async function getMaintenanceSchedule() {
    try {
        if (!STATUS_PAGE_ID) return { maintenance: [] };

        // Fetch scheduled maintenances
        const schedule = await fetchBetterstack(`/status-pages/${STATUS_PAGE_ID}/status-page-scheduled-maintenances`);

        return {
            maintenance: schedule.data.map((m: any) => ({
                id: m.id,
                title: m.attributes.title,
                status: m.attributes.status, // scheduled, in_progress, completed
                startsAt: m.attributes.starts_at,
                endsAt: m.attributes.ends_at,
                description: m.attributes.description
            }))
        };
    } catch (error) {
        console.error('Failed to fetch maintenance schedule:', error);
        return { maintenance: [] };
    }
}

export async function getStatusHistory() {
    try {
        if (!STATUS_PAGE_ID) return { incidents: [] };

        // Fetch status page history (incidents/maintenance)
        // Endpoints vary, let's use the reports or general history if available
        // Betterstack API for incidents: GET /incidents
        const history = await fetchBetterstack(`/status-pages/${STATUS_PAGE_ID}/status-page-reports`);

        return {
            incidents: history.data.map((i: any) => ({
                id: i.id,
                title: i.attributes.title,
                status: i.attributes.status, // resolved, investigating, etc.
                startedAt: i.attributes.starts_at,
                resolvedAt: i.attributes.ends_at,
                updates: i.attributes.updates || []
            }))
        };
    } catch (error) {
        console.error('Failed to fetch history:', error);
        return { incidents: [] };
    }
}

// Simple scraper fallback if API Key is missing (Legacy support)
export async function getPublicStatus() {
    try {
        const res = await fetch('https://status.avrxt.in/badge?theme=dark', {
            next: { revalidate: 300 }
        });
        const html = await res.text();

        if (html.includes('All systems operational')) {
            return { status: 'operational', label: 'Systems Active' };
        } else if (html.includes('Major outage')) {
            return { status: 'down', label: 'Major Outage' };
        } else if (html.includes('Partial outage') || html.includes('Some services are down')) {
            return { status: 'down', label: 'Partial Outage' };
        } else if (html.includes('Degraded') || html.includes('performance issues')) {
            return { status: 'degraded', label: 'Performance Degraded' };
        } else if (html.includes('Maintenance')) {
            return { status: 'maintenance', label: 'Ongoing Maintenance' };
        }

        return { status: 'operational', label: 'Systems Active' };
    } catch (error) {
        return { status: 'unknown', label: 'Status Unavailable' };
    }
}

// Unified function for components
export async function getBetterstackStatus() {
    try {
        if (API_KEY && STATUS_PAGE_ID) {
            const overview = await getStatusOverview();
            const status = (overview as any).status;

            let label = 'Systems Active';
            if (status === 'operational') label = 'Systems Active';
            else if (status === 'maintenance') label = 'Ongoing Maintenance';
            else if (status === 'degraded') label = 'Performance Degraded';
            else if (status === 'down') label = 'System Distress';

            return { status, label };
        }
        return getPublicStatus();
    } catch (error) {
        return { status: 'unknown', label: 'Status Offline' };
    }
}
