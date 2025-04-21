import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function runTests() {
  console.log("=== RUNNING DATABASE TESTS ===\n");

  try {
    // Run the connection test
    console.log("Running database connection test...");
    const { stdout: connectionOutput } = await execAsync(
      "npx ts-node scripts/test-db-connection.ts"
    );
    console.log(connectionOutput);

    console.log("\n---\n");

    // Run the Prisma models test
    console.log("Running Prisma models test...");
    const { stdout: modelsOutput } = await execAsync(
      "npx ts-node scripts/test-prisma-models.ts"
    );
    console.log(modelsOutput);

    console.log("\n=== ALL TESTS COMPLETED ===");
  } catch (error) {
    console.error("Error running tests:", error);
    process.exit(1);
  }
}

runTests();
