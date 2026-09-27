import { prisma as prismaInstance, PrismaClient, Prisma } from "./prisma-client";

export * from "./prisma-client";
export { PrismaClient, Prisma };

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
