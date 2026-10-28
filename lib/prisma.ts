import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { paceboardPrisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");
export const prisma = globalForPrisma.paceboardPrisma ?? new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});
globalForPrisma.paceboardPrisma = prisma;