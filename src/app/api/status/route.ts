import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_KEY = process.env.BETTERSTACK_API_KEY;
const STATUS_PAGE_ID = process.env.BETTERSTACK_STATUS_PAGE_ID;
const BASE_URL = 'https://uptime.betterstack.com/api/v2';

type StatusPayload = {
    status: 'operational' | 'down' | 'maintenance' | 'unknown' | 'degraded';
    label: string;
};

function mapAggregateState(state: string): StatusPayload {
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
            return { status: 'unknown', label: 'Status Unknown' };
    }
}

async function fetchBetterstackStatus(): Promise<StatusPayload> {
    if (!API_KEY || !STATUS_PAGE_ID) {
        return { status: 'unknown', label: 'Status Offline' };
    }

    const response = await fetch(`${BASE_URL}/status-pages/${STATUS_PAGE_ID}`, {
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        },
        cache: 'no-store'
    });

    if (!response.ok) {
        return { status: 'unknown', label: 'Status Offline' };
    }

    const page = await response.json();
    const aggregateState: string = page?.data?.attributes?.aggregate_state ?? 'unknown';
    return mapAggregateState(aggregateState);
}

async function fetchPublicStatus(): Promise<StatusPayload> {
    try {
        const response = await fetch('https://status.avrxt.in/badge?theme=dark', {
            cache: 'no-store'
        });
        const html = await response.text();

        if (html.includes('Major outage')) return { status: 'down', label: 'Major Outage' };
        if (html.includes('Partial outage') || html.includes('Some services are down')) return { status: 'down', label: 'Partial Outage' };
        if (html.includes('Degraded') || html.includes('performance')) return { status: 'degraded', label: 'Performance Degraded' };
        if (html.includes('Maintenance')) return { status: 'maintenance', label: 'Ongoing Maintenance' };
        if (html.includes('All systems operational') || html.includes('operational')) return { status: 'operational', label: 'Systems Active' };

        return { status: 'unknown', label: 'Status Unknown' };
    } catch {
        return { status: 'unknown', label: 'Status Offline' };
    }
}

export async function GET() {
    const result = API_KEY && STATUS_PAGE_ID
        ? await fetchBetterstackStatus()
        : await fetchPublicStatus();

    return NextResponse.json(result, {
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
    });
}
