import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBaseUrl(requestUrl: string): string {
  try {
    if (process.env.NODE_ENV === 'production') {
      return process.env.NEXT_PUBLIC_PROD_URL || new URL(requestUrl).origin;
    }
    // For development, always use localhost:3001
    return 'http://localhost:3001';
  } catch (error) {
    console.error('Error in getBaseUrl:', error);
    // Fallback to request URL origin
    return new URL(requestUrl).origin;
  }
}
