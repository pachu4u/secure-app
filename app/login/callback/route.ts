import { NextResponse, type NextRequest } from "next/server";
import { getBaseUrl } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log('Callback params:', {
      code: code ? '[PRESENT]' : 'missing',
      state: state ? '[PRESENT]' : 'missing',
      error,
      errorDescription
    });

    // Check for OAuth error response
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }

    if (!code) {
      console.error('No authorization code received');
      throw new Error('No authorization code received');
    }

    // Verify state parameter
    const storedState = request.cookies.get('oauth_state')?.value;
    console.log('State verification:', {
      received: state ? '[PRESENT]' : 'missing',
      stored: storedState ? '[PRESENT]' : 'missing',
      matches: state === storedState
    });

    if (!state || !storedState || state !== storedState) {
      console.error('State mismatch or missing');
      throw new Error('Invalid state parameter');
    }

    // Get the correct base URL for the environment
    const baseUrl = getBaseUrl(request.url);
    const redirectUri = `${baseUrl}/login/callback`;
    console.log('Callback redirect URI:', redirectUri);

    // Get the token using the authorization code
    const tokenResponse = await getToken(code, redirectUri);
    console.log('Token received:', tokenResponse.access_token ? 'yes' : 'no');
    
    // Create the response with redirect
    const response = NextResponse.redirect(new URL('/', request.url));
    
    // Set the token in a secure HTTP-only cookie
    response.cookies.set('auth_token', tokenResponse.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 // 1 hour
    });

    // Clear the state cookie
    response.cookies.delete('oauth_state');

    return response;
  } catch (error) {
    console.error('Authentication callback error:', error);
    // Clear any existing cookies on error
    const response = NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    response.cookies.delete('auth_token');
    response.cookies.delete('oauth_state');
    return response;
  }
}

async function getToken(code: string, redirectUri: string) {
  const tokenUrl = new URL('/oauth/token', process.env.NEXT_PUBLIC_SAP_BTP_URL);
  
  // Include credentials in the request body
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: process.env.XSUAA_CLIENT_ID!,
    client_secret: process.env.XSUAA_CLIENT_SECRET!
  });

  console.log('Token request URL:', tokenUrl.toString());
  console.log('Using client ID:', process.env.XSUAA_CLIENT_ID);
  console.log('Request body params:', Array.from(params.keys()));

  const response = await fetch(tokenUrl.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(`${process.env.XSUAA_CLIENT_ID}:${process.env.XSUAA_CLIENT_SECRET}`).toString('base64')
    },
    body: params.toString(),
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Token exchange failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
      headers: Object.fromEntries(response.headers.entries())
    });
    throw new Error('Failed to get access token');
  }

  const data = await response.json();
  console.log('Token response received with keys:', Object.keys(data));
  return data;
} 