// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
// If using Next.js 15.2.0+, you might be able to use the Node.js runtime
// and import your auth instance directly for more complex checks,
// but checking the cookie is generally recommended for performance.
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for an admin route
  if (pathname.startsWith("/admin")) {
    // Check for the existence of the session cookie
    // This is the recommended approach in middleware for performance.
    const sessionCookie = getSessionCookie(request);

    // If there's no session cookie, redirect to the login page
    if (!sessionCookie) {
      // Adjust '/login' to your actual login page URL
      const loginUrl = new URL("/login", request.url);
      // Optional: Add a callbackUrl query parameter to redirect back after login
      loginUrl.searchParams.set("callbackUrl", pathname);
      console.log("Cookie not found");
      console.log("Redirecting to login", loginUrl);
      return NextResponse.redirect(loginUrl);
    }
    console.log("Session cookie found", sessionCookie);
  }

  // If it's not an admin route or the user is authenticated, continue
  return NextResponse.next();
}

// Configure the matcher to run the middleware only on admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
