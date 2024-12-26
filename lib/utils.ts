import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBaseUrl(requestUrl: string): string {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_PROD_URL || new URL(requestUrl).origin
  }
  return process.env.NEXT_PUBLIC_APP_URL || new URL(requestUrl).origin
}
