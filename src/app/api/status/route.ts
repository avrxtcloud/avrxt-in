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
    const normalized = (state || '').toLowerCase().replace(/[-\s]/g, '_');

    switch (normalized) {
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

    try {
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
    } catch {
        return { status: 'unknown', label: 'Status Offline' };
    }
}

async function fetchPublicStatus(): Promise<StatusPayload> {
    try {
        const response = await fetch('https://status.avrxt.in/badge?theme=dark', {
            cache: 'no-store'
        });

        if (!response.ok) {
            return { status: 'unknown', label: 'Status Offline' };
        }

        const html = (await response.text()).toLowerCase();

        if (html.includes('major outage')) return { status: 'down', label: 'Major Outage' };
        if (html.includes('partial outage') || html.includes('some services are down')) return { status: 'down', label: 'Partial Outage' };
        if (html.includes('degraded') || html.includes('performance')) return { status: 'degraded', label: 'Performance Degraded' };
        if (html.includes('maintenance')) return { status: 'maintenance', label: 'Ongoing Maintenance' };
        if (html.includes('all systems operational') || html.includes('operational')) return { status: 'operational', label: 'Systems Active' };

        return { status: 'unknown', label: 'Status Unknown' };
    } catch {
        return { status: 'unknown', label: 'Status Offline' };
    }
}

export async function GET() {
    let result: StatusPayload = { status: 'unknown', label: 'Status Offline' };

    if (API_KEY && STATUS_PAGE_ID) {
        result = await fetchBetterstackStatus();
    }

    // Fallback when Betterstack env is missing/unavailable/unmapped
    if (result.status === 'unknown') {
        const publicResult = await fetchPublicStatus();
        if (publicResult.status !== 'unknown') {
            result = publicResult;
        }
    }

    return NextResponse.json(result, {
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
    });
}
