'use server';

import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';
import { Resend } from 'resend';
import { createClient } from '@/utils/supabase/server';
import { getCloudVariantById } from '@/lib/cloud-services';

type RazorpayOrderSummary = {
  id: string;
  amount: number;
  currency: string;
};

type RazorpayPaymentPayload = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type BookingDetails = {
  serviceId: string;
  variantId: string;
  userName: string;
  userEmail: string;
  requirements: string;
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

function getExpectedVariant(serviceId: string, variantId: string) {
  const found = getCloudVariantById(serviceId, variantId);
  if (!found) {
    throw new Error('Invalid service or tier');
  }
  return found;
}

async function sendPaidBookingEmails(
  userEmail: string,
  userName: string,
  serviceName: string,
  requirements: string,
  amount: number,
  paymentId: string
) {
  const safeUserName = escapeHtml(userName);
  const safeServiceName = escapeHtml(serviceName);
  const safeRequirements = escapeHtml(requirements);

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'support@avrxt.in',
      to: userEmail,
      subject: `Booking Confirmed: ${serviceName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #10b981;">Order Confirmed</h2>
          <p>Hi ${safeUserName},</p>
          <p>Thank you for choosing <strong>avrxt.in</strong> for your ${safeServiceName} project.</p>
          <p>Your production slot has been reserved. I will reach out shortly.</p>
          <hr />
          <p><strong>Order Summary:</strong></p>
          <ul>
            <li><strong>Service:</strong> ${safeServiceName}</li>
            <li><strong>Amount Paid:</strong> INR ${amount.toLocaleString()}</li>
            <li><strong>Payment ID:</strong> ${escapeHtml(paymentId)}</li>
          </ul>
          <p>Best regards,<br />avrxt</p>
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
      from: '"avrxt Cloud Alerts" <aviorxtaero@gmail.com>',
      to: process.env.ADMIN_EMAIL,
      subject: `New Project Received: ${safeUserName}`,
      html: `
        <div style="font-family: monospace; background: #000; color: #fff; padding: 30px;">
          <h2 style="color: #ff0000; border-bottom: 1px solid #333; padding-bottom: 10px;">[NEW_PROJECT_INBOUND]</h2>
          <p><strong>CLIENT:</strong> ${safeUserName} (${escapeHtml(userEmail)})</p>
          <p><strong>SERVICE:</strong> ${safeServiceName}</p>
          <p><strong>AMOUNT:</strong> INR ${amount.toLocaleString()}</p>
          <p><strong>REQUIREMENTS:</strong></p>
          <pre style="background: #111; padding: 15px; border-radius: 5px;">${safeRequirements}</pre>
          <p style="color: #666; font-size: 10px; margin-top: 30px;">Transaction verified via Razorpay.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Nodemailer Error:', error);
  }
}

async function sendLeadEmails(userEmail: string, userName: string, serviceName: string, requirements: string) {
  const safeUserName = escapeHtml(userName);
  const safeServiceName = escapeHtml(serviceName);
  const safeRequirements = escapeHtml(requirements);

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'support@avrxt.in',
      to: userEmail,
      subject: `Quote Request Received: ${serviceName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #10b981;">Request Received</h2>
          <p>Hi ${safeUserName},</p>
          <p>Your quote request for <strong>${safeServiceName}</strong> has been received.</p>
          <p>I will review your requirements and reach out to you soon.</p>
          <p>Best regards,<br />avrxt</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Resend Lead Email Error:', error);
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
      from: '"avrxt Cloud Alerts" <aviorxtaero@gmail.com>',
      to: process.env.ADMIN_EMAIL,
      subject: `New Quote Request: ${safeUserName}`,
      html: `
        <div style="font-family: monospace; background: #000; color: #fff; padding: 30px;">
          <h2 style="color: #10b981; border-bottom: 1px solid #333; padding-bottom: 10px;">[NEW_QUOTE_REQUEST]</h2>
          <p><strong>CLIENT:</strong> ${safeUserName} (${escapeHtml(userEmail)})</p>
          <p><strong>SERVICE:</strong> ${safeServiceName}</p>
          <p><strong>REQUIREMENTS:</strong></p>
          <pre style="background: #111; padding: 15px; border-radius: 5px;">${safeRequirements}</pre>
        </div>
      `,
    });
  } catch (error) {
    console.error('Lead Nodemailer Error:', error);
  }
}

export async function createRazorpayOrder(input: { serviceId: string; variantId: string }) {
  try {
    const { variant } = getExpectedVariant(input.serviceId, input.variantId);
    if (variant.price <= 0) {
      return { success: false, error: 'Selected tier requires a quote request, not payment.' };
    }

    const instance = getRazorpayClient();
    const order = await instance.orders.create({
      amount: variant.price * 100,
      currency: 'INR',
      receipt: `cloud_${input.serviceId}_${input.variantId}_${Date.now()}`,
      notes: {
        serviceId: input.serviceId,
        variantId: input.variantId,
      },
    });

    const orderSummary: RazorpayOrderSummary = {
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
    };

    return { success: true, order: orderSummary };
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    return { success: false, error: toErrorMessage(error) };
  }
}

export async function verifyPaymentAndBook(paymentDetails: RazorpayPaymentPayload, bookingDetails: BookingDetails) {
  try {
    const { service, variant } = getExpectedVariant(bookingDetails.serviceId, bookingDetails.variantId);
    if (variant.price <= 0) {
      return { success: false, error: 'Selected tier is quote-only and cannot be paid directly.' };
    }

    const userEmail = bookingDetails.userEmail.trim().toLowerCase();
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
      instance.orders.fetch(razorpay_order_id) as Promise<{ amount: number; id: string; currency: string }>,
      instance.payments.fetch(razorpay_payment_id) as Promise<{ order_id: string; status: string }>,
    ]);

    if (payment.order_id !== razorpay_order_id) {
      return { success: false, error: 'Payment/order mismatch detected.' };
    }

    if (order.amount !== variant.price * 100) {
      return { success: false, error: 'Payment amount mismatch detected.' };
    }

    if (!['captured', 'authorized'].includes(payment.status)) {
      return { success: false, error: `Unexpected payment status: ${payment.status}` };
    }

    const serviceName = `${service.title} (${variant.name})`;
    const supabase = await createClient();

    const { error: dbError } = await supabase.from('cloud_bookings').insert([
      {
        service_id: service.id,
        service_name: serviceName,
        user_name: bookingDetails.userName,
        user_email: userEmail,
        requirements: bookingDetails.requirements,
        amount: variant.price,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        status: 'paid',
      },
    ]);

    if (dbError) {
      console.error('Supabase Insert Error:', dbError);
    }

    await sendPaidBookingEmails(userEmail, bookingDetails.userName, serviceName, bookingDetails.requirements, variant.price, razorpay_payment_id);

    return { success: true };
  } catch (error) {
    console.error('Cloud booking verification error:', error);
    return { success: false, error: toErrorMessage(error) };
  }
}

export async function createLeadBooking(details: BookingDetails) {
  try {
    const { service, variant } = getExpectedVariant(details.serviceId, details.variantId);
    if (variant.price > 0) {
      return { success: false, error: 'Paid tiers must use the payment flow.' };
    }

    const userEmail = details.userEmail.trim().toLowerCase();
    if (!isValidEmail(userEmail)) {
      return { success: false, error: 'Invalid email address.' };
    }

    const serviceName = `${service.title} (${variant.name})`;
    const supabase = await createClient();

    const { error: dbError } = await supabase.from('cloud_bookings').insert([
      {
        service_id: service.id,
        service_name: serviceName,
        user_name: details.userName,
        user_email: userEmail,
        requirements: details.requirements,
        amount: 0,
        status: 'lead',
      },
    ]);

    if (dbError) {
      console.error('Lead capture insert warning:', dbError);
    }

    await sendLeadEmails(userEmail, details.userName, serviceName, details.requirements);

    return { success: true };
  } catch (error) {
    console.error('Lead booking error:', error);
    return { success: false, error: toErrorMessage(error) };
  }
}
