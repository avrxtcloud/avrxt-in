import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { getGooglePrivateKey } from '@/lib/google-key';

export async function POST(request: NextRequest) {
    try {
        const { name, email, message } = await request.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // --- 1. GOOGLE SHEETS AUTH ---
        let sheetSuccess = false;
        try {
            const privateKey = getGooglePrivateKey(process.env.GOOGLE_PRIVATE_KEY);
            const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
            const sheetId = process.env.GOOGLE_SHEET_ID;

            if (!privateKey || !clientEmail || !sheetId) {
                console.error('Missing Google Sheets credentials');
                // We don't return here, we just skip sheet logging so email can still be sent
            } else {
                const auth = new google.auth.GoogleAuth({
                    credentials: {
                        client_email: clientEmail,
                        private_key: privateKey,
                    },
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });

                const sheets = google.sheets({ version: 'v4', auth });
                await sheets.spreadsheets.values.append({
                    spreadsheetId: sheetId,
                    range: 'Sheet1!A:D',
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: [[new Date().toLocaleString('en-IN'), name, email, message]],
                    },
                });
                sheetSuccess = true;
            }
        } catch (sheetError: unknown) {
            console.error('GOOGLE_SHEETS_ERROR:', sheetError);
            // Continue to email even if sheet fails
        }

        // --- 2. GMAIL SMTP NOTIFICATION ---
        if (process.env.GMAIL_APP_PASSWORD) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'aviorxtaero@gmail.com',
                    pass: process.env.GMAIL_APP_PASSWORD,
                },
            });

            await transporter.sendMail({
                from: `"avrxt Terminal" <aviorxtaero@gmail.com>`,
                to: 'irgtxpc@gmail.com',
                replyTo: email,
                subject: `🚨 NEW_SIGNAL: ${name}`,
                html: `
                    <div style="background:#000; color:#fff; font-family:monospace; padding:30px; border:1px solid #333;">
                        <h2 style="color:#666; font-size:14px; border-bottom:1px solid #222; padding-bottom:10px;">// INCOMING_PAYLOAD</h2>
                        <p style="margin:20px 0;"><strong>SENDER:</strong> ${name}</p>
                        <p style="margin:20px 0;"><strong>ADDRESS:</strong> ${email}</p>
                        <div style="background:#050505; border:1px solid #222; padding:15px; margin-top:20px; white-space:pre-wrap; color:#ccc; line-height:1.6;">
                            ${message}
                        </div>
                    </div>
                `,
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Signal stored and transmitted.'
        });

    } catch (error: unknown) {
        console.error('CONTACT_API_ERROR:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'SYSTEM_FAILURE', details: errorMessage },
            { status: 500 }
        );
    }
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}

