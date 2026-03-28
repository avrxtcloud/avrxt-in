import PortfolioClient from './PortfolioClient';
import { buildPageMetadata } from '@/lib/page-metadata';

export const metadata = buildPageMetadata({
    title: 'Portfolio',
    description: 'A showcase of my recent projects, engineering feats, and digital infrastructure builds.',
    keywords: ['portfolio', 'avrxt', 'web design', 'software engineering', 'ai automation'],
    path: '/portfolio',
});

export default function PortfolioPage() {
    return <PortfolioClient />;
}
