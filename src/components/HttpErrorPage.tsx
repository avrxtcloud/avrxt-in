import MinimalErrorPage from '@/components/MinimalErrorPage';
import { errorPages, type ErrorCode } from '@/lib/error-pages';

export default function HttpErrorPage({ code }: { code: ErrorCode }) {
    const page = errorPages[code];
    return <MinimalErrorPage code={code} title={page.title} message={page.message} />;
}
