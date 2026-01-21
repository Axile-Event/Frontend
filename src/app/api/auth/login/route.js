import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getBackendBaseUrl() {
  // Prefer a server-only var if you later add one.
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://radar-ufvb.onrender.com/"
  );
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));

  const baseUrl = getBackendBaseUrl();
  const url = new URL("/login/", baseUrl);

  try {
    const upstreamRes = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await upstreamRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text };
    }

    return NextResponse.json(data, { status: upstreamRes.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to reach authentication server. Please try again." },
      { status: 502 }
    );
  }
}
