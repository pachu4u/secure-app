import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      roles?: string[]
    } & DefaultSession["user"]
    accessToken?: string
  }

  interface JWT {
    roles?: string[]
    accessToken?: string
    idToken?: string
  }
} 