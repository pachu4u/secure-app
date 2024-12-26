import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-destructive/5 rounded-lg text-center">
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to access this page.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
} 