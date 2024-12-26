import { jwtVerify } from 'jose'

export interface UserInfo {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
  scopes: string[];
}

export async function verifyToken(token: string): Promise<UserInfo | null> {
  try {
    // Get JWT verification key from environment in development
    const verificationKey = process.env.NODE_ENV === 'development'
      ? process.env.XSUAA_VERIFICATION_KEY
      : await fetch('/api/auth/key').then(res => res.text());

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(verificationKey)
    )
    
    return {
      id: payload.sub as string,
      email: payload.email as string,
      given_name: payload.given_name as string,
      family_name: payload.family_name as string,
      scopes: (payload.scope as string).split(' ')
    }
  } catch (error) {
    console.error('Token verification failed:', error);
    return null
  }
}

export function hasScope(userInfo: UserInfo | null, requiredScope: string): boolean {
  if (!userInfo) return false
  return userInfo.scopes.includes(requiredScope)
}

export function getXsuaaAppName(): string {
  return process.env.XSUAA_XSAPPNAME || '';
}

export function isAdmin(userInfo: UserInfo | null): boolean {
  const xsappname = getXsuaaAppName();
  return hasScope(userInfo, `${xsappname}.Admin`)
}

export function isUser(userInfo: UserInfo | null): boolean {
  const xsappname = getXsuaaAppName();
  return hasScope(userInfo, `${xsappname}.User`)
} 