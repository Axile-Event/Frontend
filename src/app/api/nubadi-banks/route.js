import { NextResponse } from "next/server";

export const revalidate = 43200; // cache bank list for 12 hours

export async function GET() {
  try {
    // Nubadi API URL from their documentation: https://nubapi.com/api
    const baseUrl = process.env.NUBADI_API_URL || "https://nubapi.com/api";
    const apiUrl = `${baseUrl}/banks`;

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${process.env.NUBADI_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error("Nubadi banks API error:", res.status, await res.text());
      return NextResponse.json(
        { error: "Failed to fetch banks" },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Nubadi returns an object like: { "090386": "INTERLAND BANK", "044": "Access Bank", ... }
    // Convert to array of { code, name } objects
    let banksArray = [];

    if (typeof data === "object" && !Array.isArray(data)) {
      banksArray = Object.entries(data).map(([code, name]) => ({
        code: code,
        name: name,
      }));
    } else if (Array.isArray(data)) {
      // Fallback: already an array
      banksArray = data;
    } else if (Array.isArray(data?.data)) {
      // Fallback: nested array
      banksArray = data.data;
    }

    return NextResponse.json(banksArray);
  } catch (error) {
    console.error("Nubadi banks fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch banks" },
      { status: 500 }
    );
  }
}
