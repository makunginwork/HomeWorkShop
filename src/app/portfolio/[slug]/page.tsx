import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import type { Metadata } from "next";

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
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });
  return categories.map((c) => ({ slug: c.slug }));
}

// ดึงข้อมูลประเภทงาน + ผลงานทั้งหมด
async function getCategoryWithPortfolios(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      portfolios: {
        where: { published: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      },
    },
  });
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          {category.icon && <p className="text-5xl">{category.icon}</p>}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            ผลงาน{category.name}
          </h1>
          <p className="text-gray-600">{category.portfolios.length} ผลงาน</p>
          <Link
            href="/portfolio"
            className="inline-block text-sm text-blue-600 hover:underline"
          >
            ← ดูประเภทงานทั้งหมด
          </Link>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {category.portfolios.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">📂</p>
              <p className="text-gray-500">ยังไม่มีผลงานในประเภทนี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.portfolios.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-xl font-bold text-gray-800">
            สนใจสั่งงานประเภทนี้?
          </h2>
          <p className="text-gray-500 text-sm">
            ติดต่อเราผ่าน LINE เพื่อสอบถามรายละเอียดและราคา
          </p>
          <Link
            href="/contact"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-full transition shadow-lg"
          >
            ติดต่อสั่งงาน
          </Link>
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
