import { buildPageMetadata } from '@/lib/page-metadata';

export const metadata = buildPageMetadata({
    title: 'Hire Me',
    description:
        'Start your technical journey with avrxt. Use the project intake terminal to estimate budgets and timelines for your next big idea.',
    keywords: ['hire developer', 'project intake', 'software development quote', 'full stack engineer hire', 'avrxt cloud hiring'],
});

export default function HireMeLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
