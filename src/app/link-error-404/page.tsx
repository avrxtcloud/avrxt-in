import type { Metadata } from 'next';
import MinimalErrorPage from '@/components/MinimalErrorPage';

export const metadata: Metadata = {
    title: 'Short Link Not Found — avrxt',
    description: 'The requested go.avrxt.dev short link is unavailable.',
    robots: { index: false, follow: false },
};

export default function LinkError404Page() {
    return (
        <MinimalErrorPage
            code="404"
            title="Short Link Missing"
            message="It seems like you’re trying to open a go.avrxt.dev link. It may have been removed, expired, or the path may be incorrect."
            primaryHref="https://www.avrxt.dev/me"
            primaryLabel="Visit avrxt.dev/me"
            secondaryHref="mailto:connect@elvnx.org"
            secondaryLabel="connect@elvnx.org"
        />
    );
}
