const { execSync } = require('child_process');

const fallbackDbUrl =
  'postgresql://neondb_owner:npg_1hcZf4ptaTYL@ep-frosty-fire-ayfgc4d4-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = fallbackDbUrl;
}
if (!process.env.ADMIN_PASSWORD) {
  process.env.ADMIN_PASSWORD = '12345678';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'supersecretjwtkey_homework_shop_2026_secured';
}

const masked = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
console.log('=== PREPARE DATABASE ===');
console.log('Using DB URL:', masked);

try {
  console.log('1. Generating Prisma client...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('2. Pushing schema to database...');
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('✓ Schema pushed successfully.');
} catch (e) {
  console.warn('⚠️ Warning during db setup:', e.message);
}

try {
  console.log('2. Seeding portfolios and images...');
  execSync('node scripts/seed-all-detailed-portfolios.js', {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('✓ Seed finished successfully.');
} catch (e) {
  console.warn('⚠️ Warning during seed:', e.message);
}

console.log('=== DATABASE READY ===');
