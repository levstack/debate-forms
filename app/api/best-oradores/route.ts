import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Query to find top 5 team members most mentioned as "MejorOrador"
    // Count how many times each team member is referenced
    const topOradores = await prisma.teamMember.findMany({
      where: {
        mejorOradorIn: {
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
            mejorOradorIn: true,
          },
        },
      },
      orderBy: {
        mejorOradorIn: {
          _count: "desc",
        },
      },
      take: 5,
    });

    // Transform the results to a more convenient format
    const formattedResults = topOradores.map((orador) => ({
      id: orador.id,
      name: orador.name,
      team: orador.team.name,
      count: orador._count.mejorOradorIn,
    }));

    return NextResponse.json({
      success: true,
      oradores: formattedResults,
    });
  } catch (error) {
    console.error("Error fetching top oradores:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
