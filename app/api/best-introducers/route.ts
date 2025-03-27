import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Query to find top 5 team members most mentioned as "MejorIntoductor"
    const topIntroducers = await prisma.teamMember.findMany({
      where: {
        mejorIntoductorIn: {
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
            mejorIntoductorIn: true,
          },
        },
      },
      orderBy: {
        mejorIntoductorIn: {
          _count: "desc",
        },
      },
      take: 5,
    });

    // Transform the results to a more convenient format
    const formattedResults = topIntroducers.map((introducer) => ({
      id: introducer.id,
      name: introducer.name,
      team: introducer.team.name,
      count: introducer._count.mejorIntoductorIn,
    }));

    return NextResponse.json({
      success: true,
      introducers: formattedResults,
    });
  } catch (error) {
    console.error("Error fetching top introducers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
