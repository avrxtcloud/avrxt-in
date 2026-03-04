'use server';

import { createClient } from '@/utils/supabase/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Removed top-level instantiation to prevent build errors
// const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingDetails {
    serviceId: string;
    serviceName: string;
    userName: string;
    userEmail: string;
    requirements: string;
    amount: number;
}

export async function createRazorpayOrder(amount: number) {
    try {
        const instance = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });

        const options = {
            amount: amount * 100, // in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await instance.orders.create(options);
        return { success: true, order };
    } catch (error: any) {
        console.error('Razorpay Order Error:', error);
        return { success: false, error: error.message };
    }
}

export async function verifyPaymentAndBook(
    paymentDetails: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    },
    bookingDetails: BookingDetails
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
        .from('cloud_bookings')
        .insert([{
            service_id: bookingDetails.serviceId,
            service_name: bookingDetails.serviceName,
            user_name: bookingDetails.userName,
            user_email: bookingDetails.userEmail,
            requirements: bookingDetails.requirements,
            amount: bookingDetails.amount,
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id,
            status: 'paid'
        }]);

    if (dbError) {
        console.error('Supabase Insert Error:', dbError);
        // We still proceed with emails since payment is verified
    }

    // 3. Send Confirmation Email to User via Resend
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'support@avrxt.in',
            to: bookingDetails.userEmail,
            subject: `Booking Confirmed: ${bookingDetails.serviceName}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #10b981;">Order Confirmed!</h2>
                    <p>Hi ${bookingDetails.userName},</p>
                    <p>Thank you for choosing <strong>avrxt.in</strong> for your ${bookingDetails.serviceName} project.</p>
                    <p>Your production slot has been reserved. I will reach out to you shortly at this email address to discuss the next steps.</p>
                    <hr />
                    <p><strong>Order Summary:</strong></p>
                    <ul>
                        <li><strong>Service:</strong> ${bookingDetails.serviceName}</li>
                        <li><strong>Amount Paid:</strong> ₹${bookingDetails.amount}</li>
                        <li><strong>Payment ID:</strong> ${razorpay_payment_id}</li>
                    </ul>
                    <p>Best regards,<br />avrxt</p>
                </div>
            `
        });
    } catch (e) {
        console.error('Resend Error:', e);
    }

    // 4. Send Notification to Admin via Nodemailer (Gmail)
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'aviorxtaero@gmail.com',
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: '"avrxt Cloud Alerts" <aviorxtaero@gmail.com>',
            to: process.env.ADMIN_EMAIL,
            subject: `🚀 New Project Received: ${bookingDetails.userName}`,
            html: `
                <div style="font-family: mono; background: #000; color: #fff; padding: 30px;">
                    <h2 style="color: #ff0000; border-bottom: 1px solid #333; padding-bottom: 10px;">[NEW_PROJECT_INBOUND]</h2>
                    <p><strong>CLIENT:</strong> ${bookingDetails.userName} (${bookingDetails.userEmail})</p>
                    <p><strong>SERVICE:</strong> ${bookingDetails.serviceName}</p>
                    <p><strong>AMOUNT:</strong> ₹${bookingDetails.amount}</p>
                    <p><strong>REQUIREMENTS:</strong></p>
                    <pre style="background: #111; padding: 15px; border-radius: 5px;">${bookingDetails.requirements}</pre>
                    <p style="color: #666; font-size: 10px; margin-top: 30px;">Transaction verified via Razorpay.</p>
                </div>
            `
        });
    } catch (e) {
        console.error('Nodemailer Error:', e);
    }

    return { success: true };
}
