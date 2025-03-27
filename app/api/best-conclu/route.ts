import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Query to find top 5 team members most mentioned as "MejorConclu"
    const topConclu = await prisma.teamMember.findMany({
      where: {
        mejorConcluIn: {
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
            mejorConcluIn: true,
          },
        },
      },
      orderBy: {
        mejorConcluIn: {
          _count: "desc",
        },
      },
      take: 5,
    });

    // Transform the results to a more convenient format
    const formattedResults = topConclu.map((conclu) => ({
      id: conclu.id,
      name: conclu.name,
      team: conclu.team.name,
      count: conclu._count.mejorConcluIn,
    }));

    return NextResponse.json({
      success: true,
      conclu: formattedResults,
    });
  } catch (error) {
    console.error("Error fetching top concluding speakers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
