import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TeamType } from "@prisma/client";
import { withAdminOrJudgeAuth } from "@/lib/auth-utils";

// Schema for team creation
const teamFormSchema = z.object({
  name: z.string().min(2).max(18),
  members: z
    .array(
      z.object({
        name: z.string().min(2).max(18),
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

// GET doesn't need to be admin protected as it just returns team names
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

// POST needs to be admin protected
export async function POST(request: NextRequest) {
  return withAdminOrJudgeAuth(async (req) => {
    try {
      const body = await req.json();

      // Validate request body
      const validatedData = teamFormSchema.parse(body);

      // Check if a team with the same name already exists
      const existingTeam = await prisma.team.findUnique({
        where: { name: validatedData.name },
      });

      if (existingTeam) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation error",
            message: "Ya existe un equipo con este nombre",
          },
          { status: 400 }
        );
      }

      // Validate that roles aren't duplicated within the team
      const rolesAF = new Set();
      const rolesEC = new Set();

      for (const member of validatedData.members) {
        for (const role of member.rolesAF) {
          if (rolesAF.has(role)) {
            return NextResponse.json(
              {
                success: false,
                error: "Validation error",
                message: `El rol '${role}' en AF ya está asignado a otro miembro del equipo`,
              },
              { status: 400 }
            );
          }
          rolesAF.add(role);
        }

        for (const role of member.rolesEC) {
          if (rolesEC.has(role)) {
            return NextResponse.json(
              {
                success: false,
                error: "Validation error",
                message: `El rol '${role}' en EC ya está asignado a otro miembro del equipo`,
              },
              { status: 400 }
            );
          }
          rolesEC.add(role);
        }
      }

      // Check that all required roles are assigned for both AF and EC
      const requiredRoles = ["INTRO", "R1", "R2", "CONCLU"];

      // Check AF roles
      for (const role of requiredRoles) {
        if (!rolesAF.has(role)) {
          return NextResponse.json(
            {
              success: false,
              error: "Validation error",
              message: `Falta el rol '${role}' en la posición AF. Todos los equipos deben tener INTRO, R1, R2 y CONCLU.`,
            },
            { status: 400 }
          );
        }
      }

      // Check EC roles
      for (const role of requiredRoles) {
        if (!rolesEC.has(role)) {
          return NextResponse.json(
            {
              success: false,
              error: "Validation error",
              message: `Falta el rol '${role}' en la posición EC. Todos los equipos deben tener INTRO, R1, R2 y CONCLU.`,
            },
            { status: 400 }
          );
        }
      }

      // Create team with members and roles
      const team = await prisma.team.create({
        data: {
          name: validatedData.name,
        },
      });

      // Create team members and their roles
      for (const member of validatedData.members) {
        // Create the team member

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
          teamId: team.id,
        }));

        // Create roles for EC position
        const ecRoles = member.rolesEC.map((role) => ({
          role,
          teamType: TeamType.EC,
          memberId: teamMember.id,
          teamId: team.id,
        }));

        // Create all roles at once

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
  }, request);
}
