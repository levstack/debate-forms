import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

type PrismaClientWithAccelerate = ReturnType<typeof prismaClientWithExtensions>;

const prismaClientWithExtensions = () =>
  new PrismaClient().$extends(withAccelerate());

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientWithAccelerate | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientWithExtensions();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
