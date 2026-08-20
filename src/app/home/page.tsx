export default function HomePage() {
    return (
        <>
            <style>{`
                html:has(.plain-home),
                body:has(.plain-home) {
                    overflow: hidden;
                }

                body:has(.plain-home) > *:not(main) {
                    display: none !important;
                }

                .home-display-word {
                    font-size: clamp(3.25rem, 16vw, 13rem);
                }

                .plain-home {
                    padding-top: max(1.25rem, env(safe-area-inset-top));
                    padding-right: max(1.25rem, env(safe-area-inset-right));
                    padding-bottom: max(5rem, env(safe-area-inset-bottom));
                    padding-left: max(1.25rem, env(safe-area-inset-left));
                }

                .home-signature {
                    bottom: max(1.5rem, env(safe-area-inset-bottom));
                }

                @media (max-width: 380px) {
                    .home-display-word {
                        font-size: clamp(2.8rem, 15.5vw, 4rem);
                    }
                }

                @media (max-height: 620px) {
                    .home-display-word {
                        font-size: min(13vw, 19vh);
                    }

                    .home-panel {
                        padding-top: 1rem;
                        padding-bottom: 1rem;
                    }

                    .home-tagline {
                        margin-top: 1.25rem;
                        padding-top: 0.5rem;
                        padding-bottom: 0.5rem;
                    }

                    .home-signature {
                        bottom: max(0.75rem, env(safe-area-inset-bottom));
                    }
                }
            `}</style>
            <div className="plain-home fixed inset-0 z-[9999] flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#050505] text-white sm:px-10">
                <section className="home-panel relative w-full max-w-6xl border-l border-white/20 py-8 pl-4 sm:py-12 sm:pl-10">
                    <span className="absolute -left-[3px] top-0 h-1.5 w-1.5 rounded-full bg-white" />
                    <span className="absolute -left-[3px] bottom-0 h-1.5 w-1.5 rounded-full bg-white" />
                    <h1 className="flex flex-col uppercase leading-[0.78]">
                        <span className="home-display-word font-[family-name:var(--font-outfit)] font-black tracking-[-0.075em] sm:tracking-[-0.09em]">
                            Nothing
                        </span>
                        <span className="home-display-word ml-[clamp(0rem,6vw,5rem)] font-[family-name:var(--font-outfit)] font-black tracking-[-0.075em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.7)] sm:tracking-[-0.09em]">
                            Special
                        </span>
                        <span className="home-tagline mt-7 self-end whitespace-nowrap border border-violet-400/30 bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text px-3 py-2.5 font-mono text-[clamp(0.56rem,1.3vw,0.9rem)] font-normal tracking-[0.25em] text-transparent shadow-[0_0_30px_rgba(99,102,241,0.08)] min-[390px]:tracking-[0.38em] sm:mt-9 sm:px-6 sm:py-3 sm:tracking-[0.45em]">
                            Just Leave IT
                        </span>
                    </h1>
                </section>
                <footer className="home-signature absolute inset-x-0 flex justify-center px-6">
                    <a
                        href="sites-project://appgprj_6a83f97e75688191a6c353debd1ee5cd"
                        className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]"
                    >
                        <span className="text-zinc-600">with</span>
                        <span className="text-sm grayscale transition duration-300 group-hover:grayscale-0">🩶</span>
                        <span className="border-b border-blue-500/50 pb-0.5 text-blue-400 transition-colors group-hover:border-blue-300 group-hover:text-blue-300">
                            @avrxt
                        </span>
                    </a>
                </footer>
            </div>
        </>
    );
}
