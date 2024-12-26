'use client'

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

export default function SignInPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Use your SAP credentials to access the application
          </p>
        </div>

        <div className="mt-8">
          <Button 
            onClick={() => signIn('xsuaa', { 
              callbackUrl: '/',
              redirect: true,
            })}
            className="w-full"
          >
            Sign in with XSUAA
          </Button>
        </div>
      </div>
    </div>
  )
} 