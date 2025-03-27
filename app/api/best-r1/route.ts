import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Query to find top 5 team members most mentioned as "MejorR1"
    const topR1 = await prisma.teamMember.findMany({
      where: {
        mejorR1In: {
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
            mejorR1In: true,
          },
        },
      },
      orderBy: {
        mejorR1In: {
          _count: "desc",
        },
      },
      take: 5,
    });

    // Transform the results to a more convenient format
    const formattedResults = topR1.map((r1) => ({
      id: r1.id,
      name: r1.name,
      team: r1.team.name,
      count: r1._count.mejorR1In,
    }));

    return NextResponse.json({
      success: true,
      r1: formattedResults,
    });
  } catch (error) {
    console.error("Error fetching top R1 speakers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
