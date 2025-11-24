import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

let prisma: PrismaClient;

try {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL || "",
  });
  prisma = new PrismaClient({ adapter });
} catch (error) {
  console.error("Something went wrong");
}

export { prisma };
