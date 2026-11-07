const { PrismaClient } = require('@prisma/client');

const fallbackDbUrl =
  'postgresql://neondb_owner:npg_1hcZf4ptaTYL@ep-frosty-fire-ayfgc4d4-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL || fallbackDbUrl,
});

async function main() {
  const pCount = await prisma.portfolio.count();
  const imgCount = await prisma.portfolioImage.count();
  const cCount = await prisma.category.count();
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, slug: true, sortOrder: true },
  });
  const reviewsCount = await prisma.review.count();

  console.log('--- DATABASE STATUS ---');
  console.log(`Portfolios: ${pCount}`);
  console.log(`Portfolio Images: ${imgCount}`);
  console.log(`Reviews: ${reviewsCount}`);
  console.log(`Categories (${cCount}):`);
  categories.forEach((c) => console.log(`  [${c.sortOrder}] ${c.name} (${c.slug})`));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
