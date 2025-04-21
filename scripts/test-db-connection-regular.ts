import { PrismaClient } from "@prisma/client";

// Create a regular Prisma client (not the edge version)
const prisma = new PrismaClient();

// Define types for the query results
type TimeResult = { current_time: Date };
type TableCountResult = { count: number };
type TableNameResult = { table_name: string };

async function testDatabaseConnection() {
  console.log("Testing database connection with regular Prisma client...");

  try {
    // Get the current timestamp from the database
    // This is a simple query that doesn't depend on any tables
    const result = await prisma.$queryRaw<
      TimeResult[]
    >`SELECT NOW() as current_time`;

    console.log("✅ Database connection successful!");
    console.log("Current database time:", result[0].current_time);

    // Test if we can access the database schema
    const tableCount = await prisma.$queryRaw<
      TableCountResult[]
    >`SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'`;

    console.log(
      `✅ Database schema accessible. Found ${tableCount[0].count} tables.`
    );

    // List all tables in the database
    const tables = await prisma.$queryRaw<TableNameResult[]>`SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name`;

    console.log("Available tables:");
    tables.forEach((table) => {
      console.log(`- ${table.table_name}`);
    });

    // Test if we can access the Team model
    try {
      const teamCount = await prisma.team.count();
      console.log(`✅ Team model accessible. Found ${teamCount} teams.`);

      if (teamCount > 0) {
        const sampleTeam = await prisma.team.findFirst({
          include: {
            members: true,
          },
        });

        console.log("✅ Sample team:", sampleTeam);
      }
    } catch (error) {
      console.log("⚠️ Team model test skipped (model may not exist)");
    }

    console.log("\n✅ All tests completed successfully!");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    // Always disconnect from the database
    await prisma.$disconnect();
    console.log("Database connection closed.");
  }
}

// Run the test
testDatabaseConnection().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
