import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// Using auth() without request param works in server components and route handlers
export async function isAdminOrJudgeAuthenticated() {
  const session = await auth();
  return (
    !!session?.user &&
    (session.user.role === "admin" || session.user.role === "judge")
  );
}

// Using auth() to check specifically for admin role
export async function isAdminAuthenticated() {
  const session = await auth();
  return !!session?.user && session.user.role === "admin";
}

export async function withAdminOrJudgeAuth(
  handler: (req: NextRequest) => Promise<NextResponse>,
  req: NextRequest
) {
  const isAuthorized = await isAdminOrJudgeAuthenticated();

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Unauthorized: Admin or Judge access required" },
      { status: 401 }
    );
  }

  return handler(req);
}

export async function withAdminAuth(
  handler: (req: NextRequest) => Promise<NextResponse>,
  req: NextRequest
) {
  const isAuthorized = await isAdminAuthenticated();

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 401 }
    );
  }

  return handler(req);
}
