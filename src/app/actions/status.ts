'use server';

export async function getBetterstackStatus() {
    try {
        const res = await fetch('https://status.avrxt.in/badge?theme=dark', {
            next: { revalidate: 300 } // Cache for 5 minutes
        });
        const html = await res.text();

        if (html.includes('All systems operational')) {
            return { status: 'operational', label: 'All Systems Operational' };
        } else if (html.includes('Some services are down') || html.includes('Partial outage') || html.includes('Major outage')) {
            return { status: 'down', label: 'Systems Under Distress' };
        } else if (html.includes('Maintenance')) {
            return { status: 'maintenance', label: 'Scheduled Maintenance' };
        }

        return { status: 'operational', label: 'Systems Active' };
    } catch (error) {
        console.error('Failed to fetch status:', error);
        return { status: 'unknown', label: 'Status Unavailable' };
    }
}
