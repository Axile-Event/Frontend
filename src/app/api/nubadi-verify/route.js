import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // never cache account verification

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const account_number = searchParams.get('account_number');
  const bank_code = searchParams.get('bank_code');

  if (!account_number || !bank_code) {
    return NextResponse.json({ error: 'Missing account_number or bank_code' }, { status: 400 });
  }

  try {
    const nubadiToken = process.env.NUBADI_TOKEN;
    if (!nubadiToken) {
      console.error('NUBADI_TOKEN environment variable is not set');
      return NextResponse.json(
        { error: 'Nubadi configuration error: missing NUBADI_TOKEN server environment variable.' },
        { status: 500 },
      );
    }

    // Nubadi API URL from their documentation: https://nubapi.com/api
    const baseUrl = process.env.NUBADI_API_URL || 'https://nubapi.com/api';
    const url = `${baseUrl}/verify?account_number=${account_number}&bank_code=${bank_code}`;
    
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${nubadiToken}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('Nubadi verify API error:', res.status, data);
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Nubadi verify fetch error:', error);
    return NextResponse.json({ error: 'Failed to verify account' }, { status: 500 });
  }
}
