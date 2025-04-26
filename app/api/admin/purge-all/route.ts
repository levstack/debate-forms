import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextResponse } from "next/server";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function POST() {
  try {
    console.log("Starting complete database purge...");

    // Delete in order of dependencies

    // First delete all evaluations (they depend on results)
    console.log("Deleting evaluations...");
    await prisma.evaluation.deleteMany({});

    // Then delete all results (they depend on debates)
    console.log("Deleting results...");
    await prisma.result.deleteMany({});

    // Delete debates
    console.log("Deleting debates...");
    await prisma.debate.deleteMany({});

    // Delete team roles
    console.log("Deleting team roles...");
    await prisma.teamRole.deleteMany({});

    // Delete team members
    console.log("Deleting team members...");
    await prisma.teamMember.deleteMany({});

    // Finally delete teams
    console.log("Deleting teams...");
    await prisma.team.deleteMany({});

    console.log("Complete database purge completed successfully!");

    return NextResponse.json({
      success: true,
      message: "All database data purged successfully",
    });
  } catch (error) {
    console.error("Error during complete database purge:", error);
    return NextResponse.json(
      { success: false, error: "Failed to purge all database data" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
