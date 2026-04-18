import { sendEmail } from '@/lib/resend';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { to, subject, html } = await req.json();

    const result = await sendEmail({
      to,
      subject,
      html,
      from: 'Axile <contact@axile.ng>',
    });

    if (result.success) {
      return NextResponse.json({ message: 'Email sent successfully', data: result.data });
    } else {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
