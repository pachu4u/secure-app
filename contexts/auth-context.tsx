"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import type { UserInfo } from '@/lib/auth'

interface AuthContextType {
  user: UserInfo | null
  isLoading: boolean
  error: Error | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else if (response.status === 401) {
          setUser(null)
        } else {
          throw new Error('Failed to check authentication status')
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 