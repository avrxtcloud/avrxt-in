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
        next: { revalidate: 60 } // Cache for 1 minute for faster sync
    });

    if (!res.ok) {
        const error = await res.text();
        console.error(`Betterstack API Error (${endpoint}):`, error);
        throw new Error(`Betterstack API responded with ${res.status}`);
    }

    return res.json();
}

// Map Betterstack aggregate_state values to our internal status
// Possible aggregate_state values per Betterstack API docs:
// "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance"
function mapAggregateState(state: string): { status: string; label: string } {
    switch (state) {
        case 'operational':
            return { status: 'operational', label: 'Systems Active' };
        case 'degraded':
        case 'degraded_performance':
            return { status: 'degraded', label: 'Performance Degraded' };
        case 'partial_outage':
            return { status: 'down', label: 'Partial Outage' };
        case 'major_outage':
            return { status: 'down', label: 'Major Outage' };
        case 'maintenance':
        case 'under_maintenance':
            return { status: 'maintenance', label: 'Ongoing Maintenance' };
        default:
            console.warn(`Unknown aggregate_state from Betterstack: "${state}"`);
            return { status: 'unknown', label: 'Status Unknown' };
    }
}

export async function getStatusOverview() {
    try {
        if (!STATUS_PAGE_ID) return { status: 'unknown', components: [] };

        // Fetch the status page itself — it contains "aggregate_state" which is
        // the official single source of truth for the overall page status.
        const page = await fetchBetterstack(`/status-pages/${STATUS_PAGE_ID}`);
        const aggregateState: string = page.data?.attributes?.aggregate_state ?? 'unknown';

        console.log(`[StatusBadge] Betterstack aggregate_state: "${aggregateState}"`);

        // Also fetch individual components for detail
        const resources = await fetchBetterstack(`/status-pages/${STATUS_PAGE_ID}/status-page-resources`);

        // Betterstack component status values are STRINGS:
        // "operational" | "degraded_performance" | "partial_outage" | "major_outage" | "under_maintenance"
        const components = resources.data.map((r: any) => ({
            name: r.attributes.public_name,
            status: r.attributes.status, // string value
            id: r.id
        }));

        const { status: globalStatus } = mapAggregateState(aggregateState);

        return {
            status: globalStatus,
            aggregateState,
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

        const schedule = await fetchBetterstack(`/status-pages/${STATUS_PAGE_ID}/status-page-scheduled-maintenances`);

        return {
            maintenance: schedule.data.map((m: any) => ({
                id: m.id,
                title: m.attributes.title,
                status: m.attributes.status, // "upcoming" | "in_progress" | "completed" | "canceled"
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

        const history = await fetchBetterstack(`/status-pages/${STATUS_PAGE_ID}/status-page-reports`);

        return {
            incidents: history.data.map((i: any) => ({
                id: i.id,
                title: i.attributes.title,
                status: i.attributes.status,
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

// Simple scraper fallback when no API key is configured
export async function getPublicStatus() {
    try {
        const res = await fetch('https://status.avrxt.in/badge?theme=dark', {
            next: { revalidate: 300 }
        });
        const html = await res.text();

        if (html.includes('Major outage')) {
            return { status: 'down', label: 'Major Outage' };
        } else if (html.includes('Partial outage') || html.includes('Some services are down')) {
            return { status: 'down', label: 'Partial Outage' };
        } else if (html.includes('Degraded') || html.includes('performance')) {
            return { status: 'degraded', label: 'Performance Degraded' };
        } else if (html.includes('Maintenance')) {
            return { status: 'maintenance', label: 'Ongoing Maintenance' };
        } else if (html.includes('All systems operational') || html.includes('operational')) {
            return { status: 'operational', label: 'Systems Active' };
        }

        return { status: 'operational', label: 'Systems Active' };
    } catch (error) {
        return { status: 'unknown', label: 'Status Unavailable' };
    }
}

// Primary function called by StatusBadge component
export async function getBetterstackStatus() {
    try {
        if (API_KEY && STATUS_PAGE_ID) {
            // Use the status page aggregate_state — the official Betterstack source of truth
            const page = await fetchBetterstack(`/status-pages/${STATUS_PAGE_ID}`);
            const aggregateState: string = page.data?.attributes?.aggregate_state ?? 'unknown';

            console.log(`[getBetterstackStatus] aggregate_state = "${aggregateState}"`);

            return mapAggregateState(aggregateState);
        }

        // Fallback to public scraping if no API credentials
        return getPublicStatus();
    } catch (error) {
        console.error('[getBetterstackStatus] Error:', error);
        return { status: 'unknown', label: 'Status Offline' };
    }
}
