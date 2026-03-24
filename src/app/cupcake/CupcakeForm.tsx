'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import { Loader2, Heart, Sparkles, User, Mail, MessageSquareText, CreditCard } from 'lucide-react';
import { createTipOrder, verifyTipAndSave } from '@/app/actions/cupcake';
import { cn } from '@/lib/utils';
import Reveal from '@/components/Reveal';
import Magnetic from '@/components/Magnetic';

type FormStatus = { type: 'success' | 'error' | null; message: string };

type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key?: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayHandlerResponse) => Promise<void>;
  prefill: { name: string; email: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
};

const BASE_PRICE = 200;
const PRESETS = [
  { label: '1_Cupcake', count: 1, amount: BASE_PRICE, icon: '🧁' },
  { label: '3_Cupcakes', count: 3, amount: BASE_PRICE * 3, icon: '🧁' },
  { label: '5_Cupcakes', count: 5, amount: BASE_PRICE * 5, icon: '🧁' },
];

export default function CupcakeForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCount, setSelectedCount] = useState<number | null>(1);
  const [customAmount, setCustomAmount] = useState('');
  const [status, setStatus] = useState<FormStatus>({ type: null, message: '' });

  const finalAmount = selectedCount !== null ? (selectedCount * BASE_PRICE) : (Number.parseInt(customAmount, 10) || 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (finalAmount < 1) {
      setStatus({ type: 'error', message: 'Amount must be at least INR 1' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    const formData = new FormData(e.currentTarget);
    const userName = String(formData.get('name') || '');
    const userEmail = String(formData.get('email') || '');
    const note = String(formData.get('note') || '');

    try {
      const orderResult = await createTipOrder(finalAmount);
      if (!orderResult.success || !orderResult.order) {
        throw new Error(orderResult.error || 'Gateway error');
      }

      const RazorpayCtor = (
        window as typeof window & { Razorpay: new (options: RazorpayOptions) => { open: () => void } }
      ).Razorpay;

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Number(orderResult.order.amount),
        currency: orderResult.order.currency,
        name: 'avrxt Cupcake',
        description: 'Fueling Digital Frontiers',
        order_id: orderResult.order.id,
        handler: async (response) => {
          try {
            const verifyResult = await verifyTipAndSave(
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { userName, userEmail, note }
            );

            if (!verifyResult.success) {
              throw new Error(verifyResult.error || 'Verification failed');
            }

            setStatus({ type: 'success', message: 'TRANSMISSION COMPLETE: THANK YOU PATRON' });
            setTimeout(() => {
              router.refresh();
              setIsSubmitting(false);
            }, 1200);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Verification failed';
            setStatus({ type: 'error', message: `// ERROR: ${message}` });
            setIsSubmitting(false);
          }
        },
        prefill: { name: userName, email: userEmail },
        theme: { color: '#10b981' }, // Emerald theme
        modal: { ondismiss: () => setIsSubmitting(false) },
      };

      const rzp = new RazorpayCtor(options);
      rzp.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gateway error';
      setStatus({ type: 'error', message: `// ERROR: ${message}` });
      setIsSubmitting(false);
    }
  };

  return (
    <Reveal className="w-full">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quantity Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest leading-none">Quantity_Matrix</span>
          </div>

          <div className="flex flex-wrap gap-4">
            {PRESETS.map((preset) => (
              <Magnetic key={preset.count}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCount(preset.count);
                    setCustomAmount('');
                  }}
                  className={cn(
                    'group relative w-20 h-20 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5',
                    selectedCount === preset.count
                      ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                      : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/[0.08] hover:border-white/10'
                  )}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform select-none">{preset.icon}</span>
                  <span className="text-[11px] font-black select-none tracking-tighter">x {preset.count}</span>
                </button>
              </Magnetic>
            ))}

            <div className="relative flex-1 min-w-[140px]">
              <input
                type="number"
                placeholder="Custom Amount (INR)"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedCount(null);
                }}
                className={cn(
                  "w-full h-20 bg-white/5 border rounded-2xl px-6 text-sm text-white focus:border-emerald-500/50 outline-none transition-all font-mono",
                  customAmount ? "border-emerald-500/30" : "border-white/5"
                )}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                <span className="text-[10px] font-mono uppercase">INR</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center py-2 px-1">
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Selected_Total:</span>
            <span className="text-lg font-black italic tracking-tighter text-emerald-500">INR {finalAmount}</span>
          </div>
        </div>

        {/* Identity Inputs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-3 h-3 text-zinc-700" />
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest leading-none">Identity_Protocol</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-white transition-colors" />
              <input
                name="name"
                required
                placeholder="YOUR_HANDLE"
                className="w-full bg-white/5 border border-white/5 rounded-[1.25rem] pl-12 pr-5 py-4 text-sm text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all font-mono placeholder:text-zinc-800"
              />
            </div>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-white transition-colors" />
              <input
                name="email"
                type="email"
                required
                placeholder="UPLINK_EMAIL"
                className="w-full bg-white/5 border border-white/5 rounded-[1.25rem] pl-12 pr-5 py-4 text-sm text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all font-mono placeholder:text-zinc-800"
              />
            </div>
          </div>

          <div className="relative group">
            <MessageSquareText className="absolute left-5 top-5 w-4 h-4 text-zinc-600 group-focus-within:text-white transition-colors" />
            <textarea
              name="note"
              placeholder="ENCRYPTED_NOTE (OPTIONAL)"
              className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] pl-12 pr-5 py-5 text-sm text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all font-mono h-24 resize-none placeholder:text-zinc-800"
            />
          </div>
        </div>

        {status.message && (
          <div
            className={cn(
              'p-5 rounded-2xl text-[10px] font-mono uppercase tracking-[0.2em] text-center backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-2',
              status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            )}
          >
            {status.message}
          </div>
        )}

        {/* Submit Execution */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full h-16 rounded-[1.5rem] bg-emerald-500 text-black font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Execute_Payment
              <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                <CreditCard size={14} />
              </div>
            </>
          )}
        </button>

        <p className="mt-8 text-[8px] text-zinc-700 uppercase tracking-widest leading-relaxed text-center font-mono">
          Finalizing this transmission confirms agreement with our{' '}
          <Link href="/terms" className="text-zinc-500 hover:text-zinc-300 underline underline-offset-4">Terms</Link> &{' '}
          <Link href="/refund" className="text-zinc-500 hover:text-zinc-300 underline underline-offset-4">Refund Policy</Link>.<br />
          No reverse-handshake available on digital cupcakes.
        </p>
      </form>
    </Reveal>
  );
}
