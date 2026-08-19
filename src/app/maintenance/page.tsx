import type { Metadata } from 'next';
import MinimalErrorPage from '@/components/MinimalErrorPage';

export const metadata: Metadata = {
    title: 'Under Maintenance — avrxt',
    description: 'avrxt.dev is temporarily unavailable while scheduled maintenance is completed.',
    robots: { index: false, follow: false },
};

export default function MaintenancePage() {
    return (
        <MinimalErrorPage
            code="503"
            title="Quietly Rebuilding"
            message="avrxt.dev is undergoing scheduled maintenance. We’re making a few improvements and will be back shortly."
            primaryHref="https://status.avrxt.dev"
            primaryLabel="Check status"
            secondaryHref="mailto:connect@elvnx.org"
            secondaryLabel="Contact support"
        />
    );
}
