import { NextResponse, type NextRequest } from "next/server";
import { getBaseUrl } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get the correct base URL for the environment
    const baseUrl = getBaseUrl(request.url);
    console.log('Base URL:', baseUrl);
    
    // Construct the redirect URL
    const redirectUri = `${baseUrl}/login/callback`;
    console.log('Redirect URI:', redirectUri);
    
    // Build the SAP login URL
    const loginUrl = new URL('/oauth/authorize', process.env.NEXT_PUBLIC_SAP_BTP_URL);
    loginUrl.searchParams.append('response_type', 'code');
    loginUrl.searchParams.append('client_id', process.env.XSUAA_CLIENT_ID!);
    loginUrl.searchParams.append('redirect_uri', redirectUri);
    
    // For XSUAA in SAP BTP, we need these scopes
    const xsappname = process.env.XSUAA_XSAPPNAME || 'secure-app';
    const scopes = ['openid', `${xsappname}.User`, `${xsappname}.Admin`].join(' ');
    loginUrl.searchParams.append('scope', scopes);
    
    // Force fresh authentication
    loginUrl.searchParams.append('prompt', 'login');
    
    // Add state parameter for security
    const state = Math.random().toString(36).substring(7);
    loginUrl.searchParams.append('state', state);
    
    // Log the client ID being used
    console.log('Using client ID:', process.env.XSUAA_CLIENT_ID);
    console.log('Full login URL:', loginUrl.toString());
    
    // Clear any existing auth cookies
    const response = NextResponse.redirect(loginUrl.toString());
    response.cookies.delete('auth_token');
    response.cookies.delete('oauth_state');
    
    // Store new state in a cookie for verification
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 5 // 5 minutes
    });
    
    return response;
  } catch (error) {
    console.error('Login redirect error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
} 