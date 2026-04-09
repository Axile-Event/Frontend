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
    const fincraKey = process.env.FINCRA_API_KEY || "pk_test_Njk3MmRmZjMyZDgyZTgwMDExZTQwMWNmOjoxMzc5MDY=";
    if (!fincraKey) {
      console.error('FINCRA_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Fincra configuration error: missing FINCRA_API_KEY server environment variable.' },
        { status: 500 },
      );
    }

    // Fincra API - resolve account endpoint
    const baseUrl = process.env.FINCRA_API_URL || 'https://sandboxapi.fincra.com';
    const url = `${baseUrl}/core/accounts/resolve`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': fincraKey,
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountNumber: account_number,
        bankCode: bank_code,
        type: 'nuban'
      }),
    });
    
    const data = await res.json().catch(() => ({}));
    
    console.log('Fincra API Response:', { status: res.status, data });
    
    if (!res.ok) {
      console.error('Fincra verify API error:', res.status, data);
      return NextResponse.json({ 
        error: data?.message || 'Verification failed',
        details: data 
      }, { status: res.status });
    }
    
    // Fincra returns: { status: true, message: "...", data: { accountName, accountNumber, ... } }
    // Normalize to match expected format
    const normalizedData = {
      account_name: data?.data?.accountName || data?.accountName || '',
      account_number: data?.data?.accountNumber || data?.accountNumber || account_number,
      bank_code: bank_code,
    };
    
    console.log('Normalized response:', normalizedData);
    
    if (!normalizedData.account_name) {
      return NextResponse.json({ 
        error: 'Could not retrieve account name',
        details: data 
      }, { status: 400 });
    }
    
    return NextResponse.json(normalizedData);
  } catch (error) {
    console.error('Fincra verify fetch error:', error);
    return NextResponse.json({ error: 'Failed to verify account' }, { status: 500 });
  }
}
