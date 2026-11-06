import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import type { Metadata } from "next";
import PortfolioGallery from "@/components/PortfolioGallery";

// Dynamic SEO Metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true },
  });

  if (!category) return { title: "ไม่พบประเภทงาน" };

  return {
    title: `ผลงาน ${category.name} | James Workspace`,
    description: `ตัวอย่างผลงานประเภท ${category.name}`,
  };
}

// Pre-render ทุก slug ที่มี
export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true },
    });
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

// ดึงข้อมูลประเภทงาน + ผลงานทั้งหมด พร้อมรูปภาพประกอบ (สำหรับ IG-style Lightbox)
async function getCategoryWithPortfolios(slug: string) {
  try {
    return await prisma.category.findUnique({
      where: { slug },
      include: {
        portfolios: {
          where: { published: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
          include: {
            images: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export default async function CategoryPortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryWithPortfolios(slug);

  if (!category) {
    notFound();
  }

  // Format portfolios with images
  const formattedPortfolios = category.portfolios.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    images: p.images.map((img) => ({
      ...img,
      createdAt: img.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          {category.icon && <p className="text-5xl">{category.icon}</p>}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            ผลงาน{category.name}
          </h1>
          <p className="text-gray-600">
            {category.portfolios.length} ผลงานตัวอย่าง · คลิกที่การ์ดเพื่อดูรูปภาพสไลด์และรายละเอียด
          </p>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition hover:underline"
          >
            ← ดูประเภทงานทั้งหมด
          </Link>
        </div>
      </section>

      {/* Interactive Portfolio Grid & Instagram-Style Lightbox */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <PortfolioGallery
            portfolios={formattedPortfolios}
            categoryName={category.name}
            categoryIcon={category.icon}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">
            ต้องการสั่งทำงาน {category.name}?
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            ติดต่อสอบถาม ประเมินราคาฟรี ไม่มีข้อผูกมัด คุยง่าย เป็นกันเอง พร้อมรับประกันความพอใจ
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3.5 rounded-full transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              ติดต่อสั่งงานผ่าน LINE OA
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        <p>
          © {new Date().getFullYear()} James Workspace. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

