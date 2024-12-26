"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Welcome to Secure App</h1>
          <p className="text-sm text-muted-foreground">
            Please log in with your SAP credentials
          </p>
        </div>

        {error === 'auth_failed' && (
          <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 rounded-md">
            Authentication failed. Please try again.
          </div>
        )}

        <a
          href="/api/auth/login"
          className="w-full flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Login with SAP
        </a>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
} 