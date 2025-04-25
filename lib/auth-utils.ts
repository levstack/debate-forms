import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function isAdminAuthenticated(request: NextRequest) {
  const session = await auth();
  return !!session?.user && session.user.email === "admin@example.com";
}

export async function withAdminAuth(
  handler: (req: NextRequest) => Promise<NextResponse>,
  req: NextRequest
) {
  const isAdmin = await isAdminAuthenticated(req);

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 401 }
    );
  }

  return handler(req);
}
