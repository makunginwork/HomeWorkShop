import { PrismaClient } from "@prisma/client";

// Fallback if DATABASE_URL is not set in environment
const fallbackDbUrl =
  "postgresql://neondb_owner:npg_1hcZf4ptaTYL@ep-frosty-fire-ayfgc4d4-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = fallbackDbUrl;
}

declare global {
  var prisma: PrismaClient | undefined;
}

const activeDbUrl = process.env.DATABASE_URL || fallbackDbUrl;

const prisma =
  globalThis.prisma ??
  new PrismaClient({
    datasourceUrl: activeDbUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
