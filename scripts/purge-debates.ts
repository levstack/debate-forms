import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

async function main() {
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
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error during purge:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
