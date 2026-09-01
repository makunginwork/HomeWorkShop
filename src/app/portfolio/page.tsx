import Link from "next/link";
import prisma from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ผลงานของเรา | James Workspace",
  description:
    "รวมตัวอย่างผลงานทุกประเภท — Word, Excel, PDF, เว็บไซต์, Canva และอื่นๆ",
};

async function getCategoriesWithPortfolios() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { portfolios: { where: { published: true } } } },
      portfolios: {
        where: { published: true },
        take: 1,
        orderBy: { sortOrder: "asc" },
        select: { imageUrl: true },
      },
    },
  });
}

export default async function PortfolioPage() {
  const categories = await getCategoriesWithPortfolios();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            ผลงาน<span className="text-blue-600">ของเรา</span>
          </h1>
          <p className="text-lg text-gray-600">
            ตัวอย่างผลงานที่ผ่านมา เลือกดูตามประเภทงานที่สนใจ
          </p>
          <Link
            href="/"
            className="inline-block text-sm text-blue-600 hover:underline"
          >
            ← กลับหน้าหลัก
          </Link>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          {categories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">📂</p>
              <p className="text-gray-500 text-lg">ยังไม่มีผลงานในขณะนี้</p>
              <p className="text-gray-400 text-sm mt-2">
                กลับมาใหม่เร็วๆ นี้นะครับ!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/portfolio/${cat.slug}`}
                  className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition overflow-hidden"
                >
                  {/* Preview Image */}
                  {cat.portfolios[0]?.imageUrl ? (
                    <div className="aspect-video overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cat.portfolios[0].imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <span className="text-4xl">{cat.icon || "📁"}</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-1">
                      {cat.icon && <span className="text-lg">{cat.icon}</span>}
                      <h2 className="font-bold text-gray-900 group-hover:text-blue-600 transition">
                        {cat.name}
                      </h2>
                    </div>
                    <p className="text-xs text-gray-400">
                      {cat._count.portfolios} ผลงาน
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
