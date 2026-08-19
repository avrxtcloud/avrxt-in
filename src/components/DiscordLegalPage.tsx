import Link from 'next/link';
import Reveal from '@/components/Reveal';

type Section = {
  title: string;
  content: React.ReactNode;
};

export default function DiscordLegalPage({
  label,
  title,
  summary,
  sections,
  counterpartHref,
  counterpartLabel,
}: {
  label: string;
  title: string;
  summary: string;
  sections: Section[];
  counterpartHref: string;
  counterpartLabel: string;
}) {
  return (
    <main className="max-w-4xl mx-auto px-5 sm:px-8 pt-36 sm:pt-40 pb-28">
      <Reveal className="active">
        <header className="border border-white/10 bg-black/45 p-6 sm:p-10 mb-10 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400" />
          <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/70 mb-4 font-mono">{label}</p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-5">{title}</h1>
          <p className="max-w-2xl text-sm sm:text-base text-zinc-400 leading-relaxed">{summary}</p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-widest text-zinc-600">
            <span>Effective: August 19, 2026</span>
            <span>Operator: AVRXT</span>
            <span>Application: AVRXT Discord App</span>
          </div>
        </header>

        <div className="space-y-5">
          {sections.map((section, index) => (
            <section key={section.title} className="legal-section p-6 sm:p-8">
              <h2 className="text-white font-mono text-sm sm:text-base font-bold uppercase tracking-widest border-l-2 border-cyan-300/60 pl-4 mb-5">
                {String(index + 1).padStart(2, '0')}. {section.title}
              </h2>
              <div className="text-zinc-400 leading-7 text-sm space-y-4 [&_a]:text-cyan-300 [&_a]:underline [&_a]:underline-offset-4 [&_strong]:text-zinc-100 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-10 border-t border-white/10 pt-7 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-xs font-mono uppercase tracking-widest">
          <Link href={counterpartHref} className="text-blue-300 hover:text-white transition-colors">
            {counterpartLabel} →
          </Link>
          <a href="mailto:connect@elvnx.org" className="text-zinc-500 hover:text-white transition-colors">
            connect@elvnx.org
          </a>
        </footer>
      </Reveal>
    </main>
  );
}
