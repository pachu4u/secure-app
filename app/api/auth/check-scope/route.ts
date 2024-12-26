import { NextResponse } from "next/server";
import { isAdmin, isUser, verifyToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authToken = request.headers.get('cookie')?.split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    if (!authToken) {
      return new NextResponse(null, { status: 401 });
    }

    const user = await verifyToken(authToken);
    if (!user) {
      return new NextResponse(null, { status: 401 });
    }

    const { requireAdmin } = await request.json();

    if (requireAdmin && !isAdmin(user)) {
      return new NextResponse(null, { status: 403 });
    }

    if (!isUser(user)) {
      return new NextResponse(null, { status: 403 });
    }

    return NextResponse.json({ authorized: true });
  } catch (error) {
    console.error('Scope check failed:', error);
    return new NextResponse(null, { status: 500 });
  }
} 