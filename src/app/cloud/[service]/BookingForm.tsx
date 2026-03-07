'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import { Loader2, ArrowRight, ShieldCheck, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CloudService } from '@/lib/cloud-services';
import { createLeadBooking, createRazorpayOrder, verifyPaymentAndBook } from '@/app/actions/cloud';

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

function getRequirements(serviceId: string, formData: FormData): string {
  let details = '';
  if (serviceId === 'bot-dev') {
    details += `Features: ${String(formData.get('bot-features') || '')}, Hosting: ${String(formData.get('bot-hosting') || '')}\n`;
  }
  if (serviceId === 'api-dev') {
    details += `Auth: ${String(formData.get('api-auth') || '')}, DB: ${String(formData.get('api-db') || '')}\n`;
  }
  if (serviceId === 'n8n-auto') {
    details += `Workflow: ${String(formData.get('workflow-details') || '')}\n`;
  }

  return `${details}Requirements: ${String(formData.get('requirements') || '')}`;
}

export default function BookingForm({ service }: { service: CloudService }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(service.variants[0]?.id || '');
  const [status, setStatus] = useState<FormStatus>({ type: null, message: '' });

  const selectedVariant = useMemo(
    () => service.variants.find((v) => v.id === selectedVariantId) || service.variants[0],
    [selectedVariantId, service.variants]
  );

  const isPriceOnRequest = selectedVariant.price === 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedVariant) return;

    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    const formData = new FormData(e.currentTarget);
    const userName = String(formData.get('name') || '');
    const userEmail = String(formData.get('email') || '');
    const requirements = getRequirements(service.id, formData);

    if (isPriceOnRequest) {
      try {
        const result = await createLeadBooking({
          serviceId: service.id,
          variantId: selectedVariant.id,
          userName,
          userEmail,
          requirements,
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to submit request');
        }

        setStatus({ type: 'success', message: 'Request sent. I will contact you with a quote.' });
        setTimeout(() => router.push('/cloud/success'), 1500);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to submit request';
        setStatus({ type: 'error', message });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      const orderResult = await createRazorpayOrder({
        serviceId: service.id,
        variantId: selectedVariant.id,
      });

      if (!orderResult.success || !orderResult.order) {
        throw new Error(orderResult.error || 'Failed to initiate order');
      }

      const RazorpayCtor = (
        window as typeof window & { Razorpay: new (options: RazorpayOptions) => { open: () => void } }
      ).Razorpay;

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Number(orderResult.order.amount),
        currency: orderResult.order.currency,
        name: 'avrxt Cloud',
        description: `Booking: ${service.title} - ${selectedVariant.name}`,
        order_id: orderResult.order.id,
        handler: async (response) => {
          try {
            setStatus({ type: 'success', message: 'Payment successful. Finalizing booking...' });
            const verifyResult = await verifyPaymentAndBook(
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                serviceId: service.id,
                variantId: selectedVariant.id,
                userName,
                userEmail,
                requirements,
              }
            );

            if (!verifyResult.success) {
              throw new Error(verifyResult.error || 'Verification failed');
            }

            setStatus({ type: 'success', message: 'Project booked successfully. Redirecting...' });
            setTimeout(() => router.push('/cloud/success'), 1500);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Verification failed';
            setStatus({ type: 'error', message });
            setIsSubmitting(false);
          }
        },
        prefill: { name: userName, email: userEmail },
        theme: { color: '#000000' },
        modal: { ondismiss: () => setIsSubmitting(false) },
      };

      const rzp = new RazorpayCtor(options);
      rzp.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      setStatus({ type: 'error', message });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 block">Service_Tier</label>
            <div className="relative group">
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-all font-mono appearance-none"
              >
                {service.variants.map((variant) => (
                  <option key={variant.id} value={variant.id} className="bg-zinc-900">
                    {variant.name} - {variant.price === 0 ? 'Price on Request' : `INR ${variant.price.toLocaleString()}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none group-hover:text-white transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 block">Full_Name</label>
              <input type="text" name="name" required placeholder="John Doe" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-all font-mono" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 block">Email_Endpoint</label>
              <input type="email" name="email" required placeholder="john@example.com" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-all font-mono" />
            </div>
          </div>

          {service.id === 'bot-dev' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 block">Features_Package</label>
                <input name="bot-features" placeholder="Moderation, AI, etc." className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-zinc-300 outline-none focus:border-white/20 font-mono" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 block">Hosting_Req</label>
                <input name="bot-hosting" placeholder="24/7, Region, etc." className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-zinc-300 outline-none focus:border-white/20 font-mono" />
              </div>
            </div>
          )}

          {service.id === 'api-dev' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 block">Auth_System</label>
                <input name="api-auth" placeholder="JWT, OAuth2, etc." className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-zinc-300 outline-none focus:border-white/20 font-mono" />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 block">DB_Requirements</label>
                <input name="api-db" placeholder="PostgreSQL, Redis, etc." className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-zinc-300 outline-none focus:border-white/20 font-mono" />
              </div>
            </div>
          )}

          {service.id === 'n8n-auto' && (
            <div className="animate-fade-in">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 block">Workflow_Detail</label>
              <input name="workflow-details" placeholder="Integration requirements, Webhooks, etc." className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-zinc-300 outline-none focus:border-white/20 font-mono" />
            </div>
          )}

          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 block">Project_Requirements</label>
            <textarea
              name="requirements"
              required
              placeholder="Briefly describe your goals..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-all font-mono h-32"
            />
          </div>
        </div>

        {status.message && (
          <div
            className={cn(
              'p-4 rounded-xl text-[10px] font-mono uppercase tracking-widest text-center',
              status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            )}
          >
            {status.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-white text-black font-black py-4 rounded-xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Processing_
            </>
          ) : (
            <>
              {isPriceOnRequest ? 'Request Quotation' : `Pay INR ${selectedVariant.price.toLocaleString()}`}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-zinc-600 text-[9px] uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" /> Secure Transaction SSL/TLS
          </div>
          <p className="text-[9px] text-zinc-700 uppercase tracking-widest leading-relaxed text-center px-4">
            By proceeding, you agree to our{' '}
            <Link href="/terms" className="text-zinc-500 hover:text-white underline underline-offset-4">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/refund" className="text-zinc-500 hover:text-white underline underline-offset-4">
              Refund Policy
            </Link>
            . <br />
            Payments are non-refundable after project initiation.
          </p>
        </div>
      </form>
    </>
  );
}
