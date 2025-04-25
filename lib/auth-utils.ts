import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// Using auth() without request param works in server components and route handlers
export async function isAdminAuthenticated() {
  const session = await auth();
  return !!session?.user && session.user.email === "admin@example.com";
}

export async function withAdminAuth(
  handler: (req: NextRequest) => Promise<NextResponse>,
  req: NextRequest
) {
  const isAdmin = await isAdminAuthenticated();

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 401 }
    );
  }

  return handler(req);
}
