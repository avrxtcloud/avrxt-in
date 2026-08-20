'use client';

import { useEffect } from 'react';
import MinimalErrorPage from '@/components/MinimalErrorPage';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <MinimalErrorPage
            code="500"
            title="Something Broke"
            message="The request could not be completed. You can try again or return to the homepage."
            onRetry={reset}
        />
    );
}
