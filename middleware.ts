import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // We'll use this middleware to catch any uncaught errors in API routes
  const { pathname } = request.nextUrl

  // Only apply to API routes
  if (pathname.startsWith("/api/") || pathname === "/agents") {
    // For API routes, we'll just log the request and continue
    console.log(`API Request: ${request.method} ${pathname}`)

    // We won't try to catch errors here as it might interfere with the response
    // Instead, we'll rely on the error handling in the route handlers
    return NextResponse.next()
  }

  // For non-API routes, just continue
  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*", "/agents"],
}
