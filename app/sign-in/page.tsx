import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your SAP account
          </p>
        </div>
        <Button
          onClick={() => signIn("xsuaa", { callbackUrl: "/" })}
          className="w-full"
        >
          Sign In with SAP
        </Button>
      </div>
    </div>
  )
} 