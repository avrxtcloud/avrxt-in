'use server';

import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';
import { Resend } from 'resend';
import { createClient } from '@/utils/supabase/server';

type RazorpayOrderSummary = {
  id: string;
  amount: number;
  currency: string;
};

type PaymentDetails = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type TipDetails = {
  userName: string;
  userEmail: string;
  note?: string;
};

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getRazorpayClient(): Razorpay {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay is not configured');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function createTipOrder(amount: number) {
  try {
    if (!Number.isFinite(amount) || amount < 1 || amount > 500000) {
      return { success: false, error: 'Invalid amount.' };
    }

    const normalized = Math.round(amount);
    const instance = getRazorpayClient();

    const order = await instance.orders.create({
      amount: normalized * 100,
      currency: 'INR',
      receipt: `tip_${Date.now()}`,
    });

    const orderSummary: RazorpayOrderSummary = {
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
    };

    return { success: true, order: orderSummary };
  } catch (error) {
    console.error('Razorpay Tip Order Error:', error);
    return { success: false, error: toErrorMessage(error) };
  }
}

export async function verifyTipAndSave(paymentDetails: PaymentDetails, tipDetails: TipDetails) {
  try {
    const userEmail = tipDetails.userEmail.trim().toLowerCase();
    if (!isValidEmail(userEmail)) {
      return { success: false, error: 'Invalid email address.' };
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentDetails;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return { success: false, error: 'Invalid payment signature' };
    }

    const instance = getRazorpayClient();
    const [order, payment] = await Promise.all([
      instance.orders.fetch(razorpay_order_id) as Promise<{ amount: number; id: string }>,
      instance.payments.fetch(razorpay_payment_id) as Promise<{ order_id: string; status: string }>,
    ]);

    if (payment.order_id !== razorpay_order_id) {
      return { success: false, error: 'Payment/order mismatch detected.' };
    }

    if (!['captured', 'authorized'].includes(payment.status)) {
      return { success: false, error: `Unexpected payment status: ${payment.status}` };
    }

    const amount = Math.round(Number(order.amount) / 100);

    const supabase = await createClient();
    const { error: dbError } = await supabase.from('cupcake_tips').insert([
      {
        user_name: tipDetails.userName,
        user_email: userEmail,
        amount,
        note: tipDetails.note || null,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      },
    ]);

    if (dbError) {
      console.error('Supabase Insert Error:', dbError);
    }

    const safeName = escapeHtml(tipDetails.userName);
    const safeEmail = escapeHtml(userEmail);
    const safeNote = escapeHtml(tipDetails.note || 'No note attached');

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'support@avrxt.dev',
        to: userEmail,
        subject: 'A sweet note from avrxt',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #000; color: #fff; border: 1px solid #333; border-radius: 20px; text-align: center;">
            <h1 style="font-size: 28px; font-weight: 900; margin-bottom: 16px;">Thank You, ${safeName}</h1>
            <p style="color: #aaa; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Your support keeps the creative engine running. I have received your contribution of <strong>INR ${amount.toLocaleString()}</strong>.
            </p>
            <p style="color: #444; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Verified Transaction: ${escapeHtml(razorpay_payment_id)}</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Resend Error:', error);
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'aviorxtaero@gmail.com',
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: '"avrxt Cupcake" <aviorxtaero@gmail.com>',
        to: process.env.ADMIN_EMAIL,
        subject: `New Cupcake Received: INR ${amount.toLocaleString()} from ${safeName}`,
        html: `
          <div style="font-family: monospace; background: #0a0a0a; color: #fff; padding: 30px; border-left: 4px solid #ff4785;">
            <h2 style="color: #ff4785;">[CUPCAKE_ALIMENTATION_RECEIVED]</h2>
            <p><strong>NAME:</strong> ${safeName}</p>
            <p><strong>EMAIL:</strong> ${safeEmail}</p>
            <p><strong>AMOUNT:</strong> INR ${amount.toLocaleString()}</p>
            <p><strong>NOTE:</strong></p>
            <div style="background: #111; padding: 15px; border-radius: 8px; color: #ff4785;">${safeNote}</div>
            <p style="font-size: 10px; color: #444; margin-top: 20px;">SYSTEM_LOG: TX_${escapeHtml(razorpay_payment_id)}</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Nodemailer Error:', error);
    }

    return { success: true };
  } catch (error) {
    console.error('Tip verification error:', error);
    return { success: false, error: toErrorMessage(error) };
  }
}

export async function getRecentTips() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('cupcake_tips')
    .select('user_name, created_at, amount')
    .order('created_at', { ascending: false })
    .limit(5);

  return data || [];
}
