const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

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

// 3. Ensure base categories exist (never wipe or seed portfolios)
async function syncCategories() {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || fallbackDbUrl,
  });

  try {
    console.log('3. Checking standard categories...');
    const standardCategories = [
      { name: 'งานคำนวณและแบบจำลอง Excel', slug: 'excel-models', icon: '📗', sortOrder: 1 },
      { name: 'การบัญชีและการเงิน', slug: 'accounting', icon: '📊', sortOrder: 2 },
      { name: 'แผนธุรกิจและการตลาด', slug: 'business-plan', icon: '📑', sortOrder: 3 },
      { name: 'สถิติและการวิจัย SPSS', slug: 'spss-research', icon: '📈', sortOrder: 4 },
      { name: 'รายงานและสารสนเทศ', slug: 'reports', icon: '📄', sortOrder: 5 },
      { name: 'งานนำเสนอ & Canva', slug: 'presentation', icon: '🎨', sortOrder: 6 },
      { name: 'วิศวกรรมและวิชาคำนวณ', slug: 'engineering', icon: '⚙️', sortOrder: 7 },
      { name: 'กฎหมายธุรกิจและการบัญชี', slug: 'law', icon: '⚖️', sortOrder: 8 },
      { name: 'แบบฝึกหัดและใบงาน', slug: 'assignments', icon: '✏️', sortOrder: 9 },
    ];

    for (const cat of standardCategories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {}, // ไม่ทับข้อมูลหากมีอยู่แล้ว
        create: cat,
      });
    }

    console.log('✓ Categories are ready.');
  } catch (err) {
    console.warn('⚠️ Warning syncing categories:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

syncCategories().then(() => {
  console.log('=== DATABASE READY ===');
});
