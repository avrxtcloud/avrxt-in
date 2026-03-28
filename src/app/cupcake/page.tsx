import { buildPageMetadata } from '@/lib/page-metadata';
import { Heart, User, Clock, ShieldCheck, Zap, Coffee } from 'lucide-react';
import { getRecentTips } from '@/app/actions/cupcake';
import Reveal from '@/components/Reveal';
import SpotlightBox from '@/components/SpotlightBox';
import CupcakeForm from './CupcakeForm';
import { cn } from '@/lib/utils';
import Magnetic from '@/components/Magnetic';

export const metadata = buildPageMetadata({
  title: 'Support avrxt | Buy Me a Cupcake',
  description:
    'Support the development of open-source projects and digital frontiers. Buy a cupcake to fuel innovation and creative engineering.',
  keywords: ['support developer', 'buy me a coffee', 'buy me a cupcake', 'avrxt support', 'tech innovation funding'],
  path: '/cupcake',
});

type Tip = {
  user_name: string;
  created_at: string;
  amount: number;
  note?: string;
};

export default async function CupcakePage() {
  const recentTips = (await getRecentTips()) as Tip[];

  return (
    <main className="min-h-screen bg-black text-white relative flex flex-col items-center overflow-x-hidden pb-32">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a1a1a_0%,#000_70%)] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Profile Header section - BMC Style */}
      <div className="relative z-10 w-full pt-40 pb-20 flex flex-col items-center">
        <Reveal direction="down" delay={0.1}>
          <div className="mb-6 relative">
            <div className="absolute inset-0 animate-pulse bg-emerald-500/20 blur-2xl rounded-full scale-110 opacity-30" />
            <img
              src="/logo.png"
              alt="avrxt"
              className="w-24 h-24 rounded-3xl object-cover border border-white/10 shadow-2xl relative z-10 p-4 bg-zinc-900"
            />
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.2} className="text-center px-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 italic uppercase">
            Support avrxt<span className="text-emerald-500">_</span>
          </h1>
          <p className="max-w-xl mx-auto text-zinc-500 text-sm md:text-base font-mono uppercase tracking-widest leading-relaxed">
            Fueling the next iteration of <span className="text-white">Digital Obsidian</span> and open-source frontiers.
          </p>
        </Reveal>
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Support Card */}
        <div className="lg:col-span-7">
          <SpotlightBox className="rounded-[2.5rem] p-px bg-white/5 overflow-hidden">
            <div className="bg-[#050505] rounded-[2.5rem] p-8 md:p-12">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white uppercase">Buy a Cupcake</h2>
                  <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Select your fuel intensity</p>
                </div>
              </div>

              <CupcakeForm />
            </div>
          </SpotlightBox>
        </div>

        {/* Sidebar Info & Supporters */}
        <div className="lg:col-span-5 space-y-8">
          {/* Why Support? Card */}
          <Reveal direction="up" delay={0.3}>
            <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-400">Mission_Directive</h3>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed mb-6 italic">
                &quot;Every contribution directly sustains the infrastructure and development of premium digital experiences that are open, secure, and accessible.&quot;
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-xl font-bold text-white mb-1">2k+</div>
                  <div className="text-[9px] font-mono text-zinc-600 uppercase">Commits_Made</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-xl font-bold text-white mb-1">0.6s</div>
                  <div className="text-[9px] font-mono text-zinc-600 uppercase">Avg_Latency</div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Supporters Feed */}
          <Reveal direction="up" delay={0.4}>
            <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-400">Patron_Feed</h3>
                </div>
                <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-mono text-emerald-500 uppercase tracking-tighter">
                  Verifying_Live
                </div>
              </div>

              <div className="space-y-6">
                {recentTips.length > 0 ? (
                  recentTips.map((tip, idx: number) => {
                    const maxAmount = Math.max(...recentTips.map((t) => t.amount), 0);
                    const isTop = tip.amount === maxAmount && maxAmount > 0;

                    return (
                      <div key={idx} className="flex items-start gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-700 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 group-hover:border-emerald-500/20 transition-all duration-300">
                          <User size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={cn(
                              'text-sm font-bold uppercase tracking-tight truncate',
                              isTop ? 'text-emerald-500' : 'text-zinc-200'
                            )}>
                              {tip.user_name}
                            </span>
                            <span className="text-[10px] font-mono font-black text-white ml-2 shrink-0">
                              INR {tip.amount}
                            </span>
                          </div>
                          {tip.note && (
                            <p className="text-[11px] text-zinc-500 italic mb-1 line-clamp-2">&quot;{tip.note}&quot;</p>
                          )}
                          <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest">
                            {new Date(tip.created_at).toLocaleDateString()} // TRANSMISSION_SUCCESS
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/5 rounded-2xl group">
                    <Heart className="w-8 h-8 text-zinc-900 mb-4 group-hover:text-red-500/20 transition-colors" />
                    <p className="text-[10px] font-mono uppercase text-zinc-700 tracking-widest">Awaiting primary signal_</p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          {/* Secure Badge */}
          <Reveal direction="up" delay={0.5}>
            <div className="px-8 py-6 rounded-3xl border border-white/5 bg-white/[0.01] flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <ShieldCheck className="w-8 h-8 text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                <div>
                  <h4 className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-widest mb-0.5">Secure_Gateway</h4>
                  <p className="text-[8px] text-zinc-700 uppercase tracking-tighter">TLS 1.3 // Razorpay PCI-DSS</p>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
