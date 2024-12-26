import { NextResponse } from "next/server";
import { getServices } from "@/lib/xsuaa";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { xsuaa } = getServices({ xsuaa: { label: 'xsuaa' } });
    return new NextResponse(xsuaa.credentials.verificationkey);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      return new NextResponse(process.env.XSUAA_VERIFICATION_KEY);
    }
    console.error('Error getting verification key:', error);
    return new NextResponse(null, { status: 500 });
  }
} 