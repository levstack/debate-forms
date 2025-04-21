import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

// Create a Prisma client with Accelerate extension
const prisma = new PrismaClient().$extends(withAccelerate());

// Define types for the query results
type TimeResult = { current_time: Date };
type TableCountResult = { count: number };
type TableNameResult = { table_name: string };

async function testDatabaseConnection() {
  console.log("Testing database connection with Prisma Accelerate...");

  try {
    // Get the current timestamp from the database
    // This is a simple query that doesn't depend on any tables
    const result = await prisma.$queryRaw<
      TimeResult[]
    >`SELECT NOW() as current_time`;

    console.log("✅ Database connection successful!");
    console.log("Current database time:", result[0].current_time);

    // Test if we can access the database schema
    const tableCount = await prisma.$queryRaw<TableCountResult[]>`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    console.log(
      `✅ Database schema accessible. Found ${tableCount[0].count} tables.`
    );

    // List all tables in the database
    const tables = await prisma.$queryRaw<TableNameResult[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log("Available tables:");
    tables.forEach((table) => {
      console.log(`- ${table.table_name}`);
    });

    console.log("\n✅ Prisma Accelerate extension is working correctly!");
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
