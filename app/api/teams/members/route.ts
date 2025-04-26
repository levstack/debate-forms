import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminOrJudgeAuth } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  return withAdminOrJudgeAuth(async (req) => {
    try {
      const searchParams = req.nextUrl.searchParams;
      const teamsParam = searchParams.get("teams");
      const roleParam = searchParams.get("role");

      if (!teamsParam) {
        return NextResponse.json(
          { success: false, error: "Teams parameter is required" },
          { status: 400 }
        );
      }

      const teamNames = teamsParam.split(",");
      if (teamNames.length !== 2) {
        return NextResponse.json(
          { success: false, error: "Exactly two teams must be specified" },
          { status: 400 }
        );
      }

      const [teamAF, teamEC] = await Promise.all([
        prisma.team.findUnique({
          where: { name: teamNames[0] },
          include: {
            members: {
              include: {
                roles: true,
              },
            },
          },
        }),
        prisma.team.findUnique({
          where: { name: teamNames[1] },
          include: {
            members: {
              include: {
                roles: true,
              },
            },
          },
        }),
      ]);

      if (!teamAF || !teamEC) {
        return NextResponse.json(
          { success: false, error: "One or both teams not found" },
          { status: 404 }
        );
      }

      let allMembers = [...teamAF.members, ...teamEC.members];

      // Filter by role if provided
      if (roleParam) {
        allMembers = allMembers.filter((member) =>
          member.roles.some((role) => role.role === roleParam)
        );
      }

      return NextResponse.json({
        success: true,
        members: allMembers,
      });
    } catch (error) {
      console.error("Error fetching team members:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  }, request);
}
