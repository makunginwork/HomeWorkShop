const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { portfolios: true } },
      portfolios: true
    }
  });
  console.log('Categories count:', categories.length);
  for (const c of categories) {
    console.log(`- [${c.slug}] ${c.icon || ''} ${c.name} (${c._count.portfolios} items)`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
