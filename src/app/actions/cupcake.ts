'use server';

import { createClient } from '@/utils/supabase/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Removed top-level instantiation to prevent build errors
// const resend = new Resend(process.env.RESEND_API_KEY);

export async function createTipOrder(amount: number) {
    try {
        const instance = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `tip_${Date.now()}`,
        };

        const order = await instance.orders.create(options);
        return { success: true, order };
    } catch (error: any) {
        console.error('Razorpay Tip Order Error:', error);
        return { success: false, error: error.message };
    }
}

export async function verifyTipAndSave(
    paymentDetails: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    },
    tipDetails: {
        userName: string;
        userEmail: string;
        amount: number;
        note?: string;
    }
) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentDetails;

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(body.toString())
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        return { success: false, error: 'Invalid payment signature' };
    }

    // 2. Save to Supabase
    const supabase = await createClient();
    const { error: dbError } = await supabase
        .from('cupcake_tips')
        .insert([{
            user_name: tipDetails.userName,
            user_email: tipDetails.userEmail,
            amount: tipDetails.amount,
            note: tipDetails.note,
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id
        }]);

    if (dbError) console.error('Supabase Insert Error:', dbError);

    // 3. Send Thank You Email to User via Resend
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'support@avrxt.in',
            to: tipDetails.userEmail,
            subject: `A sweet note from avrxt 🧁`,
            html: `
                <div style="font-family: 'Outfit', sans-serif; max-width: 600px; margin: auto; padding: 40px; background: #000; color: #fff; border: 1px solid #333; border-radius: 20px; text-align: center;">
                    <div style="font-size: 50px; margin-bottom: 20px;">🧁</div>
                    <h1 style="background: linear-gradient(to right, #fff, #666); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; font-weight: 900; margin-bottom: 20px;">Thank You, ${tipDetails.userName}!</h1>
                    <p style="color: #aaa; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                        Your support means the world to me. It's people like you who keep the creative engine running. 
                        I've received your sweet gesture of <strong>₹${tipDetails.amount}</strong>. 
                    </p>
                    <div style="padding: 20px; background: rgba(255,255,255,0.05); border-radius: 12px; font-style: italic; color: #fff; margin-bottom: 30px;">
                        "Architecture is built on support, and today, you are part of the foundation."
                    </div>
                    <p style="color: #444; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Verified Transaction: ${razorpay_payment_id}</p>
                    <hr style="border: 0; border-top: 1px solid #222; margin: 30px 0;" />
                    <p style="font-weight: bold; color: #fff;">With 🖤 from avrxt</p>
                </div>
            `
        });
    } catch (e) { console.error('Resend Error:', e); }

    // 4. Send Notification to Admin via Nodemailer
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: 'aviorxtaero@gmail.com', pass: process.env.GMAIL_APP_PASSWORD },
        });

        await transporter.sendMail({
            from: '"avrxt Cupcake" <aviorxtaero@gmail.com>',
            to: process.env.ADMIN_EMAIL,
            subject: `🧁 New Cupcake Received: ₹${tipDetails.amount} from ${tipDetails.userName}`,
            html: `
                <div style="font-family: monospace; background: #0a0a0a; color: #fff; padding: 30px; border-left: 4px solid #ff4785;">
                    <h2 style="color: #ff4785;">[CUPCAKE_ALIMENTATION_RECEIVED]</h2>
                    <p><strong>NAME:</strong> ${tipDetails.userName}</p>
                    <p><strong>EMAIL:</strong> ${tipDetails.userEmail}</p>
                    <p><strong>AMOUNT:</strong> ₹${tipDetails.amount}</p>
                    <p><strong>NOTE:</strong></p>
                    <div style="background: #111; padding: 15px; border-radius: 8px; color: #ff4785;">${tipDetails.note || "No note attached"}</div>
                    <p style="font-size: 10px; color: #444; margin-top: 20px;">SYSTEM_LOG: TX_${razorpay_payment_id}</p>
                </div>
            `
        });
    } catch (e) { console.error('Nodemailer Error:', e); }

    return { success: true };
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
