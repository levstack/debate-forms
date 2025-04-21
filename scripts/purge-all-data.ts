import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

async function main() {
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
}

main()
  .catch((e) => {
    console.error("Error during database purge:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
