import nodemailer from 'nodemailer';
import * as aws from '@aws-sdk/client-sesv2';

const ses = new aws.SESv2Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Using SESv2Client as explicitly requested by the build error
const transporter = nodemailer.createTransport({
  SES: { ses, aws },
} as any);

export const FROM_EMAIL = 'Avior ( avrxt.in ) <dispatch@notify.avrxt.in>';

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
    to: to,
    subject: subject,
    html: html,
  };

  if (unsubscribeToken) {
    mailOptions.headers = {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    };
  }

  return transporter.sendMail(mailOptions);
}
