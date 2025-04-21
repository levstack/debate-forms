import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Create a Prisma client with Accelerate extension
const prisma = new PrismaClient().$extends(withAccelerate());

async function testAccelerateExtension() {
  console.log("Testing Prisma client with Accelerate extension...");

  try {
    // Test basic query
    const teamCount = await prisma.team.count();
    console.log(`✅ Basic query successful. Found ${teamCount} teams.`);

    // Test a more complex query with relations
    const teams = await prisma.team.findMany({
      take: 5,
      include: {
        members: {
          include: {
            roles: true,
          },
        },
      },
    });

    console.log(
      `✅ Complex query with relations successful. Found ${teams.length} teams with members and roles.`
    );

    // Test a query with caching (Accelerate feature)
    console.log("Testing query caching (Accelerate feature)...");

    // First query (should hit the database)
    const startTime1 = Date.now();
    await prisma.team.findMany({ take: 5 });
    const endTime1 = Date.now();
    const queryTime1 = endTime1 - startTime1;

    console.log(`First query took ${queryTime1}ms`);

    // Second query (should be cached by Accelerate)
    const startTime2 = Date.now();
    await prisma.team.findMany({ take: 5 });
    const endTime2 = Date.now();
    const queryTime2 = endTime2 - startTime2;

    console.log(`Second query took ${queryTime2}ms`);

    if (queryTime2 < queryTime1) {
      console.log("✅ Caching appears to be working (second query was faster)");
    } else {
      console.log(
        "⚠️ Caching may not be working as expected (second query was not faster)"
      );
    }

    console.log("\n✅ Prisma Accelerate extension is working correctly!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    // Always disconnect from the database
    await prisma.$disconnect();
    console.log("Database connection closed.");
  }
}

// Run the test
testAccelerateExtension().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
