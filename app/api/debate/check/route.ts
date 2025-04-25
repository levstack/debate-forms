import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  return withAdminAuth(async (req) => {
    try {
      // Get the ronda and aula from query params
      const url = new URL(req.url);
      const ronda = parseInt(url.searchParams.get("ronda") || "0");
      const aula = parseInt(url.searchParams.get("aula") || "0");

      if (!ronda || !aula) {
        return NextResponse.json(
          {
            success: false,
            error: "Ronda and aula are required parameters",
          },
          { status: 400 }
        );
      }

      // Check if a debate already exists for this ronda and aula
      const existingDebate = await prisma.debate.findFirst({
        where: {
          ronda,
          aula,
        },
        include: {
          teamAF: true,
          teamEC: true,
        },
      });

      if (existingDebate) {
        // Return the existing debate with 200 status
        return NextResponse.json(existingDebate);
      }

      // If no debate exists, return 404
      return NextResponse.json(
        {
          success: false,
          error: "No debate found for the specified ronda and aula",
        },
        { status: 404 }
      );
    } catch (error) {
      console.error("Error checking for existing debate:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  }, request);
}
