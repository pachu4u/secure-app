"use client"

import { UserNav } from "@/components/auth/user-nav";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/auth-context";
import { Suspense } from "react";

function AdminContent() {
  return (
    <div className="bg-muted p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Admin Dashboard</h2>
      <p className="text-sm text-muted-foreground">
        This content is only visible to administrators.
      </p>
    </div>
  );
}

function UserContent() {
  const { user } = useAuth();

  return (
    <div className="bg-card p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">
        Welcome, {user?.given_name}!
      </h2>
      <p className="text-sm text-muted-foreground">
        You are logged in as a user.
      </p>
    </div>
  );
}

function PageContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Secure App</h1>
          <UserNav />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Protected User Content */}
          <ProtectedRoute>
            <UserContent />
          </ProtectedRoute>

          {/* Protected Admin Content */}
          <ProtectedRoute requireAdmin>
            <AdminContent />
          </ProtectedRoute>
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
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
    }>
      <PageContent />
    </Suspense>
  );
}
