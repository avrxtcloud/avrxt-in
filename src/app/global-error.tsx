'use client';

import { useEffect } from 'react';
import MinimalErrorPage from '@/components/MinimalErrorPage';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="en">
            <body className="bg-[#050505] font-sans">
                <MinimalErrorPage
                    code="500"
                    title="System Failure"
                    message="The site encountered a critical error. Try restoring the page or return home."
                    onRetry={reset}
                />
            </body>
        </html>
    );
}
