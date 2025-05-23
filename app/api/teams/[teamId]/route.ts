import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { withAdminAuth } from "@/lib/auth-utils";

export async function DELETE(request: NextRequest) {
  return withAdminAuth(async (req) => {
    try {
      // Extract the teamId from the URL
      const url = new URL(req.url);
      const pathSegments = url.pathname.split("/");
      const teamId = pathSegments[pathSegments.indexOf("teams") + 1];

      // Start a transaction to ensure all deletions are atomic
      await prisma.$transaction(async (prismaClient) => {
        // Find all member IDs associated with the team
        const members: { id: string }[] = await prismaClient.$queryRaw`
          SELECT id FROM "TeamMember" WHERE "teamId" = ${teamId}
        `;

        const memberIds = members.map((m) => m.id);

        // Delete all roles for these members
        if (memberIds.length > 0) {
          await prismaClient.$executeRaw`
            DELETE FROM "TeamRole" WHERE "memberId" IN (${Prisma.join(
              memberIds
            )})
          `;
        }

        // Delete the team members
        await prismaClient.$executeRaw`
          DELETE FROM "TeamMember" WHERE "teamId" = ${teamId}
        `;

        // Delete the team itself
        await prismaClient.$executeRaw`
          DELETE FROM "Team" WHERE id = ${teamId}
        `;
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting team:", error);
      return NextResponse.json(
        { error: "Failed to delete team" },
        { status: 500 }
      );
    }
  }, request);
}
