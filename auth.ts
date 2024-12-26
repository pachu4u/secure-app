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
      wellKnown: null,
      authorization: {
        url: `${process.env.NEXT_PUBLIC_SAP_BTP_URL}/oauth/authorize`,
        params: {
          scope: "openid",
          response_type: "code",
        },
      },
      token: {
        url: `${process.env.NEXT_PUBLIC_SAP_BTP_URL}/oauth/token`,
        params: { grant_type: "authorization_code" },
        async request({ provider, params, client }) {
          const credentials = Buffer.from(
            `${client.client_id}:${client.client_secret}`
          ).toString("base64")

          console.log("[DEBUG] Making token request:", {
            url: provider.token?.url,
            code_length: params.code?.length,
            redirect_uri: params.redirect_uri,
          })

          const response = await fetch(provider.token.url!, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${credentials}`,
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code: params.code,
              redirect_uri: params.redirect_uri,
              client_id: client.client_id,
            }),
          })

          const responseText = await response.text()
          console.log("[DEBUG] Token response:", {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers),
            body: responseText,
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const tokens = JSON.parse(responseText)
          return { tokens }
        },
      },
      userinfo: {
        request: async ({ tokens }) => {
          // Skip userinfo request and use ID token
          if (!tokens.id_token) {
            throw new Error("No ID token available")
          }
          return jwtDecode(tokens.id_token)
        },
      },
      profile(profile: XSUAAProfile) {
        console.log("[DEBUG] Processing profile:", {
          sub: profile.sub,
          hasEmail: !!profile.email,
          hasUserName: !!profile.user_name,
        })

        return {
          id: profile.sub,
          name: profile.user_name || profile.email || profile.given_name || "Unknown User",
          email: profile.email || "",
          emailVerified: null,
          roles: Array.isArray(profile.scope) ? profile.scope : [],
        }
      },
      clientId: process.env.XSUAA_CLIENT_ID,
      clientSecret: process.env.XSUAA_CLIENT_SECRET,
      checks: ["state", "pkce"],
      client: {
        token_endpoint_auth_method: "client_secret_basic",
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      console.log("[DEBUG] JWT Callback:", {
        hasToken: !!token,
        hasAccount: !!account,
        hasProfile: !!profile,
      })

      if (account) {
        token.accessToken = account.access_token
        if (profile) {
          token.roles = Array.isArray(profile.scope) ? profile.scope : []
        }
      }
      return token
    },
    async session({ session, token }) {
      console.log("[DEBUG] Session Callback:", {
        hasSession: !!session,
        hasToken: !!token,
      })

      if (token) {
        session.accessToken = token.accessToken as string
        session.user.roles = (token.roles as string[]) || []
        session.user.id = (token.sub as string) || "unknown"
      }
      return session
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  debug: true,
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
