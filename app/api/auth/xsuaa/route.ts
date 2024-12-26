import { NextResponse } from "next/server";
import { getServices } from "@/lib/xsuaa";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // This code runs on the server where fs is available
    const { xsuaa } = getServices({ xsuaa: { label: 'xsuaa' } });
    
    // Only return necessary public information
    return NextResponse.json({
      url: xsuaa.credentials.url,
      uaadomain: xsuaa.credentials.uaadomain,
      xsappname: xsuaa.credentials.xsappname,
    });
  } catch (error) {
    // Fallback to environment variables
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        url: process.env.NEXT_PUBLIC_SAP_BTP_URL,
        uaadomain: process.env.XSUAA_UAA_DOMAIN,
        xsappname: process.env.XSUAA_XSAPPNAME,
      });
    }
    console.error('Error getting XSUAA credentials:', error);
    return new NextResponse(null, { status: 500 });
  }
} 