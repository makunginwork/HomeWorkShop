const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const d = await prisma.category.deleteMany({
    where: {
      slug: { in: ['word', 'excel', 'pdf', '3d', 'เว็บไซต์ / โค้ด', 'powerpoint/canva'] }
    }
  });
  console.log('Deleted old empty categories:', d.count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
