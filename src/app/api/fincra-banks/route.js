import { NextResponse } from "next/server";

export const revalidate = 43200; // cache bank list for 12 hours

export async function GET() {
  try {
    const fincraKey = process.env.FINCRA_API_KEY || "pk_test_Njk3MmRmZjMyZDgyZTgwMDExZTQwMWNmOjoxMzc5MDY=";
    const baseUrl = process.env.FINCRA_API_URL || "https://sandboxapi.fincra.com";
    const apiUrl = `${baseUrl}/core/banks`;

    console.log('Fetching banks from Fincra:', apiUrl);

    const res = await fetch(apiUrl, {
      headers: {
        "api-key": fincraKey,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error("Fincra banks API error:", res.status, await res.text());
      return NextResponse.json(
        { error: "Failed to fetch banks" },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log('Fincra banks response:', data);

    // Fincra returns: { data: [{ code, name, ... }] } or similar
    let banksArray = [];

    if (Array.isArray(data?.data)) {
      banksArray = data.data.map((bank) => ({
        code: bank.code || bank.bankCode,
        name: bank.name || bank.bankName,
      }));
    } else if (Array.isArray(data)) {
      banksArray = data.map((bank) => ({
        code: bank.code || bank.bankCode,
        name: bank.name || bank.bankName,
      }));
    }

    console.log('Banks array length:', banksArray.length);
    return NextResponse.json(banksArray);
  } catch (error) {
    console.error("Fincra banks fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch banks" },
      { status: 500 }
    );
  }
}
