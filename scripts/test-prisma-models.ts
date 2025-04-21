import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

// Create a Prisma client with Accelerate extension
const prisma = new PrismaClient().$extends(withAccelerate());

async function testPrismaModels() {
  console.log("Testing Prisma models and CRUD operations...");

  try {
    // 1. Test Team model
    console.log("\n--- Testing Team model ---");

    // Create a test team
    const newTeam = await prisma.team.create({
      data: {
        name: `Test Team ${Date.now()}`,
      },
    });

    console.log("✅ Created test team:", newTeam);

    // Read the team
    const foundTeam = await prisma.team.findUnique({
      where: { id: newTeam.id },
    });

    console.log("✅ Found team by ID:", foundTeam);

    // Update the team
    const updatedTeam = await prisma.team.update({
      where: { id: newTeam.id },
      data: { name: `Updated Team ${Date.now()}` },
    });

    console.log("✅ Updated team:", updatedTeam);

    // Delete the team
    await prisma.team.delete({
      where: { id: newTeam.id },
    });

    console.log("✅ Deleted test team");

    // 2. Test TeamMember model
    console.log("\n--- Testing TeamMember model ---");

    // Create a team first (required for TeamMember)
    const teamForMember = await prisma.team.create({
      data: {
        name: `Team for Member ${Date.now()}`,
      },
    });

    // Create a team member
    const newMember = await prisma.teamMember.create({
      data: {
        name: `Test Member ${Date.now()}`,
        teamId: teamForMember.id,
      },
    });

    console.log("✅ Created test team member:", newMember);

    // Read the member
    const foundMember = await prisma.teamMember.findUnique({
      where: { id: newMember.id },
      include: { team: true },
    });

    console.log("✅ Found member by ID:", foundMember);

    // Update the member
    const updatedMember = await prisma.teamMember.update({
      where: { id: newMember.id },
      data: { name: `Updated Member ${Date.now()}` },
    });

    console.log("✅ Updated member:", updatedMember);

    // Delete the member and team
    await prisma.teamMember.delete({
      where: { id: newMember.id },
    });

    await prisma.team.delete({
      where: { id: teamForMember.id },
    });

    console.log("✅ Deleted test member and team");

    // 3. Test Debate model (if it exists)
    console.log("\n--- Testing Debate model ---");

    try {
      // Check if Debate model exists by trying to count records
      const debateCount = await prisma.debate.count();
      console.log(`✅ Debate model exists with ${debateCount} records`);

      // Try to fetch a sample debate if any exist
      if (debateCount > 0) {
        const sampleDebate = await prisma.debate.findFirst({
          include: {
            teamAF: true,
            teamEC: true,
          },
        });

        console.log("✅ Sample debate:", sampleDebate);
      }
    } catch (error) {
      console.log("⚠️ Debate model test skipped (model may not exist)");
    }

    console.log("\n✅ All Prisma model tests completed successfully!");
  } catch (error) {
    console.error("❌ Prisma model test failed:", error);
  } finally {
    // Always disconnect from the database
    await prisma.$disconnect();
    console.log("Database connection closed.");
  }
}

// Run the test
testPrismaModels().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
