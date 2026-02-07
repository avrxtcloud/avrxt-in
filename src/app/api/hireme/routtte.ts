import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
    try {
        const { name, email, projectType, budget, timeline, description } = await request.json();

        if (!name || !email || !projectType || !budget || !timeline || !description) {
            return NextResponse.json(
                { message: 'Missing required payload fields.' },
                { status: 400 }
            );
        }

        // --- STEP 1: SAVE TO GOOGLE SHEET ---
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (privateKey && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.INTAKE_SHEET_ID) {
            const auth = new (google.auth.JWT as any)(
                process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                undefined,
                privateKey,
                ['https://www.googleapis.com/auth/spreadsheets']
            );

            const sheets = google.sheets({ version: 'v4', auth });

            await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.INTAKE_SHEET_ID,
                range: 'Sheet1!A:G',
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [[
                        new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                        name,
                        email,
                        projectType,
                        budget,
                        timeline,
                        description
                    ]],
                },
            });
        }

        // --- STEP 2: NOTIFY ADMIN VIA GMAIL (NODEMAILER) ---
        if (process.env.GMAIL_APP_PASSWORD && process.env.ADMIN_GMAIL_ID) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'aviorxtaero@gmail.com',
                    pass: process.env.GMAIL_APP_PASSWORD,
                },
            });

            await transporter.sendMail({
                from: `"avrxt_intake" <aviorxtaero@gmail.com>`,
                to: process.env.ADMIN_GMAIL_ID,
                replyTo: email,
                subject: `💼 NEW_PROJECT: ${projectType} - ${name}`,
                html: `
                    <div style="background:#000; color:#fff; font-family:monospace; padding:30px; border:1px solid #333; max-width:600px; margin:auto;">
                        <h2 style="color:#666; font-size:14px; border-bottom:1px solid #222; padding-bottom:10px;">// INTAKE_LOGGED_TO_SHEET</h2>
                        <p><strong>CLIENT:</strong> ${name}</p>
                        <p><strong>EMAIL:</strong> ${email}</p>
                        <p><strong>TYPE:</strong> ${projectType}</p>
                        <p><strong>BUDGET:</strong> ${budget}</p>
                        <p><strong>TIMELINE:</strong> ${timeline}</p>
                        <div style="background:#050505; border:1px solid #222; padding:15px; margin-top:20px; white-space:pre-wrap; color:#ccc; line-height:1.6;">
                            ${description}
                        </div>
                        <p style="font-size:10px; color:#444; margin-top:20px;">System: Google Sheet Updated Successfully.</p>
                    </div>
                `
            });
        }

        return NextResponse.json({ message: 'Intake successful.' });

    } catch (error: unknown) {
        console.error('HireMe API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { message: 'SYSTEM_FAILURE', details: errorMessage },
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
