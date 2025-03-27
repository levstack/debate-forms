import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TeamType } from "@prisma/client";

// Schema for team creation
const teamFormSchema = z.object({
  name: z.string().min(2),
  members: z
    .array(
      z.object({
        name: z.string().min(2),
        rolesAF: z
          .array(z.enum(["INTRO", "R1", "R2", "CONCLU", "CAPITAN"]))
          .min(1)
          .max(2),
        rolesEC: z
          .array(z.enum(["INTRO", "R1", "R2", "CONCLU", "CAPITAN"]))
          .min(1)
          .max(2),
      })
    )
    .min(3)
    .max(5),
});

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      teams,
    });
  } catch (error) {
    console.error("Error fetching teams:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = teamFormSchema.parse(body);

    // Create team with members and roles
    const team = await prisma.team.create({
      data: {
        name: validatedData.name,
      },
    });

    // Create team members and their roles
    for (const member of validatedData.members) {
      // Create the team member
      // @ts-ignore - Property exists at runtime but TypeScript doesn't recognize it
      const teamMember = await prisma.teamMember.create({
        data: {
          name: member.name,
          teamId: team.id,
        },
      });

      // Create roles for AF position
      const afRoles = member.rolesAF.map((role) => ({
        role,
        teamType: TeamType.AF,
        memberId: teamMember.id,
      }));

      // Create roles for EC position
      const ecRoles = member.rolesEC.map((role) => ({
        role,
        teamType: TeamType.EC,
        memberId: teamMember.id,
      }));

      // Create all roles at once
      // @ts-ignore - Property exists at runtime but TypeScript doesn't recognize it
      await prisma.teamRole.createMany({
        data: [...afRoles, ...ecRoles],
      });
    }

    return NextResponse.json(
      {
        success: true,
        team,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in teams API route:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.format(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
