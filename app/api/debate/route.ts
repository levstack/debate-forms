import { NextRequest, NextResponse } from "next/server";
import { saveDebateResult } from "@/lib/services/debate-service";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withAdminAuth, isAdminAuthenticated } from "@/lib/auth-utils";

// Form validation schema
const formSchema = z.object({
  ronda: z.number(),
  aula: z.number(),
  equipoAF: z.string(),
  equipoEC: z.string(),
  mejorOradorId: z.string().optional(),
  mejorIntroductorId: z.string().optional(),
  mejorR1Id: z.string().optional(),
  mejorR2Id: z.string().optional(),
  mejorConcluId: z.string().optional(),
  fondo: z.object({
    AF: z.array(z.number().min(0).max(1)),
    EC: z.array(z.number().min(0).max(1)),
  }),
  forma: z.object({
    AF: z.array(z.number().min(0).max(1)),
    EC: z.array(z.number().min(0).max(1)),
  }),
  otros: z.object({
    AF: z.array(z.number().min(0).max(1)),
    EC: z.array(z.number().min(0).max(1)),
  }),
});

export async function GET() {
  try {
    // Check if the request is from an admin
    const isAdmin = await isAdminAuthenticated();

    // For public access (non-admin), return limited debate information
    // For admin access, return complete debate information including results
    const debates = await prisma.debate.findMany({
      include: {
        teamAF: true,
        teamEC: true,
        // Only include detailed results for admin users
        ...(isAdmin
          ? {
              results: {
                include: {
                  evaluations: true,
                  mejorOrador: true,
                  mejorIntroductor: true,
                  mejorR1: true,
                  mejorR2: true,
                  mejorConclu: true,
                },
              },
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      debates,
    });
  } catch (error) {
    console.error("Error fetching debates:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Protect the POST method to ensure only admins can create debates
export async function POST(request: NextRequest) {
  return withAdminAuth(async (req) => {
    try {
      const body = await req.json();
      const validatedData = formSchema.parse(body);

      const result = await saveDebateResult(validatedData);

      return NextResponse.json({
        success: true,
        result,
      });
    } catch (error) {
      console.error("Error saving debate result:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        },
        { status: 500 }
      );
    }
  }, request);
}
