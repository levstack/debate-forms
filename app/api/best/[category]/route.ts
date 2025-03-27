import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Define valid categories and their corresponding Prisma relations
const validCategories = {
  oradores: "mejorOradorIn",
  introductores: "mejorIntroductorIn",
  r1: "mejorR1In",
  r2: "mejorR2In",
  conclu: "mejorConcluIn",
} as const;

type Category = keyof typeof validCategories;

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    // Await params as required by Next.js
    const category = (await params).category as Category;

    // Validate category
    if (!validCategories[category]) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category",
        },
        { status: 400 }
      );
    }

    // Query to find top 5 team members for the specified category
    const topMembers = await prisma.teamMember.findMany({
      where: {
        [validCategories[category]]: {
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
            [validCategories[category]]: true,
          },
        },
      },
      orderBy: {
        [validCategories[category]]: {
          _count: "desc",
        },
      },
      take: 5,
    });

    // Transform the results to a more convenient format
    const formattedResults = topMembers.map((member) => ({
      id: member.id,
      name: member.name,
      team: member.team.name,
      count: member._count[validCategories[category]],
    }));

    return NextResponse.json({
      success: true,
      [category]: formattedResults,
    });
  } catch (error) {
    console.error(`Error fetching top ${(await params).category}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
