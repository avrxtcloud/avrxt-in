import { Metadata } from 'next';
import PortfolioClient from './PortfolioClient';

export const metadata: Metadata = {
    title: 'Portfolio | avrxt',
    description: 'A showcase of my recent projects, engineering feats, and digital infrastructure builds.',
    keywords: ['portfolio', 'avrxt', 'web design', 'software engineering', 'ai automation'],
};

export default function PortfolioPage() {
    return <PortfolioClient />;
}
