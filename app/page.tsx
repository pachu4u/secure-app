"use client"

import { UserNav } from "@/components/auth/user-nav"
import { useSession } from "next-auth/react"

export default function HomePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Secure App</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="bg-card p-4 rounded-lg shadow animate-pulse">
              <div className="h-6 w-1/4 bg-muted rounded mb-4"></div>
              <div className="h-4 w-3/4 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!session) {
    return null // Will be redirected by middleware
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Secure App</h1>
          <UserNav />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* User Welcome Section */}
          <div className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">
              Welcome, {session.user.name}!
            </h2>
            <p className="text-muted-foreground">
              You are logged in with {session.user.email}
            </p>
            {session.user.roles && session.user.roles.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Your Roles:</h3>
                <div className="flex flex-wrap gap-2">
                  {session.user.roles.map((role, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
