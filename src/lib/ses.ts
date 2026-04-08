import nodemailer from 'nodemailer';

export const FROM_EMAIL = 'Avior ( avrxt.in ) <dispatch@notify.avrxt.in>';

// Lazy-initialized transporter — avoids build-time SES client creation
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (_transporter) return _transporter;

  // Dynamic require at runtime only, never during build
  const { SESClient, SendRawEmailCommand } = require('@aws-sdk/client-ses');

  const ses = new SESClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  _transporter = nodemailer.createTransport({
    SES: { ses, aws: { SendRawEmailCommand } },
  } as any);

  return _transporter;
}

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  unsubscribeToken?: string;
}

export async function sendMail({ to, subject, html, unsubscribeToken }: SendMailOptions) {
  const unsubscribeUrl = `https://unsubscribe.avrxt.in/mail?token=${unsubscribeToken}`;

  const mailOptions: any = {
    from: FROM_EMAIL,
    to,
    subject,
    html,
  };

  if (unsubscribeToken) {
    mailOptions.headers = {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    };
  }

  return getTransporter().sendMail(mailOptions);
}
