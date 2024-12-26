import { handlers } from "@/auth"
import { NextRequest } from "next/server"

export const GET = (request: NextRequest) => {
  return handlers.GET(request)
}

export const POST = (request: NextRequest) => {
  return handlers.POST(request)
}

// Needed for CSRF token generation
export const dynamic = "force-dynamic" 