import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Query to find top 5 team members most mentioned as "MejorR2"
    const topR2 = await prisma.teamMember.findMany({
      where: {
        mejorR2In: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        team: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            mejorR2In: true,
          },
        },
      },
      orderBy: {
        mejorR2In: {
          _count: "desc",
        },
      },
      take: 5,
    });

    // Transform the results to a more convenient format
    const formattedResults = topR2.map((r2) => ({
      id: r2.id,
      name: r2.name,
      team: r2.team.name,
      count: r2._count.mejorR2In,
    }));

    return NextResponse.json({
      success: true,
      r2: formattedResults,
    });
  } catch (error) {
    console.error("Error fetching top R2 speakers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
