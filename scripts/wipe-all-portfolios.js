const { PrismaClient } = require('@prisma/client');

const fallbackDbUrl =
  'postgresql://neondb_owner:npg_1hcZf4ptaTYL@ep-frosty-fire-ayfgc4d4-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL || fallbackDbUrl,
});

async function main() {
  console.log('=== WIPING ALL PORTFOLIO DATA ===');
  
  // 1. Delete all portfolio images
  const deletedImages = await prisma.portfolioImage.deleteMany({});
  console.log(`✓ Deleted ${deletedImages.count} portfolio images.`);

  // 2. Delete all portfolios
  const deletedPortfolios = await prisma.portfolio.deleteMany({});
  console.log(`✓ Deleted ${deletedPortfolios.count} portfolios.`);

  // 3. Verify counts
  const remainingP = await prisma.portfolio.count();
  const remainingImg = await prisma.portfolioImage.count();
  console.log(`Verification: Portfolios remaining = ${remainingP}, Images remaining = ${remainingImg}`);
  console.log('✓ All portfolio data completely cleared.');
}

main()
  .catch((e) => {
    console.error('Error during portfolio wipe:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
