'use client';

import Link from 'next/link';

type MinimalErrorPageProps = {
    code: string;
    title: string;
    message: string;
    onRetry?: () => void;
    primaryHref?: string;
    primaryLabel?: string;
    secondaryHref?: string;
    secondaryLabel?: string;
};

export default function MinimalErrorPage({
    code,
    title,
    message,
    onRetry,
    primaryHref = '/',
    primaryLabel = 'Return home',
    secondaryHref,
    secondaryLabel,
}: MinimalErrorPageProps) {
    return (
        <>
            <style>{`
                html:has(.minimal-error), body:has(.minimal-error) { overflow: hidden; }
                body:has(.minimal-error) > *:not(main) { display: none !important; }
                .minimal-error {
                    min-height: 100dvh;
                    padding: max(1.25rem, env(safe-area-inset-top)) max(1.25rem, env(safe-area-inset-right)) max(1.25rem, env(safe-area-inset-bottom)) max(1.25rem, env(safe-area-inset-left));
                }
                .error-code { font-size: clamp(5rem, 22vw, 15rem); }
                @media (max-height: 580px) {
                    .error-code { font-size: min(18vw, 34vh); }
                    .error-panel { padding-top: 1rem; padding-bottom: 1rem; }
                }
            `}</style>
            <div className="minimal-error fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#050505] text-white">
                <section className="error-panel relative w-full max-w-5xl border-l border-white/20 py-8 pl-5 sm:py-12 sm:pl-10">
                    <span className="absolute -left-[3px] top-0 h-1.5 w-1.5 rounded-full bg-white" />
                    <span className="absolute -left-[3px] bottom-0 h-1.5 w-1.5 rounded-full bg-white" />

                    <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-600">System response</p>
                    <h1 className="mt-3 flex flex-col uppercase leading-[0.78]">
                        <span className="error-code font-[family-name:var(--font-outfit)] font-black tracking-[-0.09em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.7)]">
                            {code}
                        </span>
                        <span className="mt-5 font-[family-name:var(--font-outfit)] text-[clamp(1.8rem,5vw,4.5rem)] font-black tracking-[-0.06em] text-zinc-100">
                            {title}
                        </span>
                    </h1>

                    <p className="mt-5 max-w-lg font-mono text-xs leading-6 text-zinc-500 sm:text-sm">{message}</p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href={primaryHref} className="border border-blue-400/30 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-blue-400 transition-colors hover:border-blue-300 hover:text-blue-300">
                            {primaryLabel}
                        </Link>
                        {secondaryHref && secondaryLabel && (
                            <a href={secondaryHref} className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 transition-colors hover:text-white">
                                {secondaryLabel}
                            </a>
                        )}
                        {onRetry && (
                            <button type="button" onClick={onRetry} className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 transition-colors hover:text-white">
                                Try again
                            </button>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}
