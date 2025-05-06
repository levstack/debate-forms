import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { NextResponse } from "next/server";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function POST() {
  try {
    console.log("Starting database purge of debates data...");

    // First delete all evaluations (they depend on results)
    console.log("Deleting evaluations...");
    await prisma.evaluation.deleteMany({});

    // Then delete all results (they depend on debates)
    console.log("Deleting results...");
    await prisma.result.deleteMany({});

    // Finally delete all debates
    console.log("Deleting debates...");
    await prisma.debate.deleteMany({});

    console.log("Purge completed successfully!");

    return NextResponse.json({
      success: true,
      message: "All debates, results, and evaluations purged successfully",
    });
  } catch (error) {
    console.error("Error during purge:", error);
    return NextResponse.json(
      { success: false, error: "Failed to purge debates data" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
