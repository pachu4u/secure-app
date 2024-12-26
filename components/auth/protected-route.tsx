"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        if (!isLoading) {
          if (!user) {
            router.push('/login')
            return
          }

          const response = await fetch('/api/auth/check-scope', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ requireAdmin }),
          });

          if (!response.ok) {
            router.push('/unauthorized')
            return
          }

          setIsAuthorized(true)
        }
      } catch (error) {
        console.error('Authorization check failed:', error)
        router.push('/unauthorized')
      }
    }

    checkAuthorization()
  }, [user, isLoading, requireAdmin, router])

  if (isLoading) {
    return (
      <div className="p-4 bg-card rounded-lg shadow animate-pulse">
        <div className="h-6 w-1/4 bg-muted rounded mb-4"></div>
        <div className="h-4 w-3/4 bg-muted rounded"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
} 