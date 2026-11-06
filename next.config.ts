import type { NextConfig } from "next";

// Fallback environment variables if not set in Vercel UI
const defaultDbUrl =
  "postgresql://neondb_owner:npg_1hcZf4ptaTYL@ep-frosty-fire-ayfgc4d4-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = defaultDbUrl;
}
if (!process.env.ADMIN_PASSWORD) {
  process.env.ADMIN_PASSWORD = "12345678";
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "supersecretjwtkey_homework_shop_2026_secured";
}

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL || defaultDbUrl,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "12345678",
    JWT_SECRET:
      process.env.JWT_SECRET || "supersecretjwtkey_homework_shop_2026_secured",
  },
};

export default nextConfig;
