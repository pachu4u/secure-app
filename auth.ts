import NextAuth, { type DefaultSession } from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { jwtDecode } from "jwt-decode";

interface XSUAAProfile {
  sub: string;
  user_name?: string;
  email?: string;
  given_name?: string;
  scope?: string[];
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    error?: string;
    user: {
      id: string;
      roles: string[];
      emailVerified?: Date | null;
    } & DefaultSession["user"];
  }
}

export const config = {
  providers: [
    {
      id: "xsuaa",
      name: "XSUAA",
      type: "oauth",
      issuer: "https://coe-asset-b9jxgzf0.authentication.eu10.hana.ondemand.com/oauth/token",
      allowDangerousEmailAccountLinking: false,
      authorization: {
        url: "https://coe-asset-b9jxgzf0.authentication.eu10.hana.ondemand.com/oauth/authorize",
        params: {
          scope: "openid",
          response_type: "code",
        },
      },
      token: {
        url: "https://coe-asset-b9jxgzf0.authentication.eu10.hana.ondemand.com/oauth/token",
        async request({ provider, params }) {
          console.log("[DEBUG] Token Exchange - Starting with params:", {
            code: params.code ? `${params.code.substring(0, 10)}...` : 'no code',
            redirect_uri: params.redirect_uri,
          })

          const tokenRequest = {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code: params.code,
              redirect_uri: params.redirect_uri,
              client_id: "sb-secure-app!t501469",
              client_secret: "7d1b1323-bb64-47d6-a0e9-4eda8d2a653b$Nqy7MV29Cp-n0ibGC6v67qMZGMQmJa9sLse05_0zxrQ=",
            }),
          }

          console.log("[DEBUG] Token Exchange - Request details:", {
            url: provider.token?.url,
            method: tokenRequest.method,
            headers: Object.keys(tokenRequest.headers),
            bodyParams: Array.from(new URLSearchParams(tokenRequest.body).keys()),
          })

          try {
            console.log("[DEBUG] Token Exchange - Sending request...")
            const response = await fetch(provider.token.url!, tokenRequest)
            const responseText = await response.text()

            console.log("[DEBUG] Token Exchange - Response received:", {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers),
              body: responseText.substring(0, 100) + (responseText.length > 100 ? '...' : ''),
            })

            if (!response.ok) {
              console.error("[ERROR] Token Exchange - Failed:", {
                status: response.status,
                statusText: response.statusText,
                body: responseText,
                headers: Object.fromEntries(response.headers),
              })
              throw new Error(
                `Token exchange failed: ${response.status} ${response.statusText} - ${responseText}`
              )
            }

            const tokens = JSON.parse(responseText)
            console.log("[DEBUG] Token Exchange - Success:", {
              hasAccessToken: !!tokens.access_token,
              hasIdToken: !!tokens.id_token,
              tokenType: tokens.token_type,
              expiresIn: tokens.expires_in,
            })

            return { tokens }
          } catch (error) {
            console.error("[ERROR] Token Exchange - Request error:", error)
            throw error
          }
        },
      },
      userinfo: {
        request: async ({ tokens }) => {
          if (!tokens.id_token) {
            throw new Error("No ID token available")
          }
          return jwtDecode(tokens.id_token)
        },
      },
      profile(profile: XSUAAProfile) {
        return {
          id: profile.sub,
          name: profile.user_name || "Unknown User",
          email: null,
          emailVerified: null,
          roles: Array.isArray(profile.scope) ? profile.scope : [],
        }
      },
      clientId: "sb-secure-app!t501469",
      clientSecret: "7d1b1323-bb64-47d6-a0e9-4eda8d2a653b$Nqy7MV29Cp-n0ibGC6v67qMZGMQmJa9sLse05_0zxrQ=",
      checks: ["state"],
      client: {
        token_endpoint_auth_method: "client_secret_post",
        response_types: ["code"],
        grant_types: ["authorization_code"],
      },
      style: {
        logo: "",
        logoDark: "",
        bg: "",
        bgDark: "",
        text: "",
        textDark: "",
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      console.log("[DEBUG] JWT Callback - Input:", {
        hasToken: !!token,
        hasAccount: !!account,
        hasProfile: !!profile,
        tokenKeys: token ? Object.keys(token) : [],
        accountKeys: account ? Object.keys(account) : [],
        profileKeys: profile ? Object.keys(profile) : [],
      })

      if (account) {
        console.log("[DEBUG] JWT Callback - Updating token with account data")
        token.accessToken = account.access_token
        if (profile) {
          console.log("[DEBUG] JWT Callback - Adding roles from profile")
          token.roles = Array.isArray(profile.scope) ? profile.scope : []
        }
      }

      console.log("[DEBUG] JWT Callback - Final token:", {
        hasAccessToken: !!token.accessToken,
        hasRoles: Array.isArray(token.roles),
        numberOfRoles: Array.isArray(token.roles) ? token.roles.length : 0,
      })

      return token
    },
    async session({ session, token }) {
      console.log("[DEBUG] Session Callback - Input:", {
        hasSession: !!session,
        hasToken: !!token,
        sessionKeys: session ? Object.keys(session) : [],
        tokenKeys: token ? Object.keys(token) : [],
      })

      if (token) {
        session.accessToken = token.accessToken as string
        session.user.roles = (token.roles as string[]) || []
        session.user.id = (token.sub as string) || "unknown"

        console.log("[DEBUG] Session Callback - Updated session:", {
          hasAccessToken: !!session.accessToken,
          userId: session.user.id,
          hasRoles: Array.isArray(session.user.roles),
          numberOfRoles: session.user.roles.length,
        })
      }

      return session
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  debug: true,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
