import { buildPageMetadata } from '@/lib/page-metadata';
import { Heart, User, Clock } from 'lucide-react';
import { getRecentTips } from '@/app/actions/cupcake';
import Reveal from '@/components/Reveal';
import SpotlightBox from '@/components/SpotlightBox';
import CupcakeForm from './CupcakeForm';
import { cn } from '@/lib/utils';

export const metadata = buildPageMetadata({
  title: 'Buy Me a Cupcake',
  description:
    'Fuel the next iteration of open digital frontiers. Support avrxt by buying a cupcake and contributing to innovative tech projects.',
  keywords: ['support developer', 'buy me a coffee', 'buy me a cupcake', 'avrxt support', 'tech innovation funding'],
});

type Tip = {
  user_name: string;
  created_at: string;
  amount: number;
};

export default async function CupcakePage() {
  const recentTips = (await getRecentTips()) as Tip[];

  return (
    <main className="max-w-4xl mx-auto px-6 py-32 min-h-screen">
      <Reveal className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 mb-8">
          <Heart className="w-3 h-3 text-red-500" /> Support_Creative_Work
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 gradient-heading">Buy Me a Cupcake.</h1>
        <p className="max-w-xl mx-auto text-zinc-400 text-lg leading-relaxed">
          If my work has helped you, consider fueling the next iteration.
          Every cupcake counts towards building a more open digital frontier.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start">
        <div className="md:col-span-3">
          <SpotlightBox className="p-1">
            <div className="p-8 md:p-10 bg-black/40 rounded-[inherit]">
              <CupcakeForm />
            </div>
          </SpotlightBox>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Reveal className="p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
            <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Recent_Patrons
            </h3>

            <div className="space-y-6">
              {recentTips.length > 0 ? (
                recentTips.map((tip, idx: number) => {
                  const maxAmount = Math.max(...recentTips.map((t) => t.amount), 0);
                  const isTop = tip.amount === maxAmount && maxAmount > 0;

                  return (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 group-hover:border-white/20 transition-all">
                        <User size={16} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={cn('text-sm font-bold uppercase tracking-tight', isTop ? 'bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent' : 'text-white')}>
                            {tip.user_name}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-xs font-bold text-purple-300">INR {tip.amount}</span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-600 uppercase">{new Date(tip.created_at).toLocaleDateString()} VERIFIED</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl">
                  <p className="text-[10px] font-mono uppercase text-zinc-700 tracking-widest">No transmissions yet_</p>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-all" />
            <h4 className="text-sm font-bold text-white mb-2">Secure Gateway</h4>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">
              Processing via Razorpay. <br />
              SSL/TLS Encrypted Endpoint.
            </p>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
