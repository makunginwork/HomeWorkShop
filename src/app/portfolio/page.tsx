import Link from "next/link";
import prisma from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

// Helper ให้ป้าย format ตาม category slug
function getCategoryFormatBadge(slug: string) {
  switch (slug) {
    case "excel-models":
      return { label: "📗 Excel (.xlsx) ผูกสูตร", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "accounting":
      return { label: "📊 Excel งบการเงิน & ผังบัญชี", color: "bg-teal-50 text-teal-700 border-teal-200" };
    case "business-plan":
      return { label: "📑 Word & PPT แผนธุรกิจ BMC", color: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    case "spss-research":
      return { label: "📈 SPSS (.sav) & แปลผลสถิติ", color: "bg-amber-50 text-amber-700 border-amber-200" };
    case "reports":
      return { label: "📘 Word (.docx) จัดรูปเล่ม APA", color: "bg-blue-50 text-blue-700 border-blue-200" };
    case "presentation":
      return { label: "🎨 PowerPoint & Canva Decks", color: "bg-purple-50 text-purple-700 border-purple-200" };
    case "engineering":
      return { label: "⚙️ Excel โมเดล & คำนวณแล็บ", color: "bg-cyan-50 text-cyan-700 border-cyan-200" };
    case "law":
      return { label: "⚖️ Mind Map & สรุปข้อกฎหมาย", color: "bg-violet-50 text-violet-700 border-violet-200" };
    case "assignments":
      return { label: "✏️ PDF & Word แสดงวิธีทำ", color: "bg-rose-50 text-rose-700 border-rose-200" };
    default:
      return { label: "📄 เอกสารงานจริง", color: "bg-gray-50 text-gray-700 border-gray-200" };
  }
}

export default async function PortfolioPage() {
  let categories: Awaited<ReturnType<typeof getCategoriesWithPortfolios>> = [];
  try {
    categories = await getCategoriesWithPortfolios();
  } catch {
    // DB ไม่พร้อม
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-100/80 text-blue-800 text-xs font-semibold px-4 py-1.5 rounded-full">
            <span>✨</span>
            <span>ตัวอย่างงานส่งมอบจริง ไร้ข้อมูลส่วนบุคคล 100%</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            ผลงาน<span className="text-blue-600">ของเรา</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            รวมตัวอย่างผลงานส่งมอบจริง ครอบคลุมทั้งไฟล์ Excel ผูกสูตร, รายงาน Word, สไลด์ Canva, สถิติ SPSS และแบบฝึกหัด
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              ← กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </section>

      {/* Software & Tool Quick Navigation Bar */}
      <section className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-xs py-3.5 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 font-medium whitespace-nowrap pr-1">
            เลือกดูตามโปรแกรม:
          </span>
          <Link
            href="/portfolio/excel-models"
            className="px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium border border-emerald-200 whitespace-nowrap transition flex items-center gap-1.5 shadow-xs"
          >
            <span>📗</span>
            <span>Excel (.xlsx) ผูกสูตร</span>
          </Link>
          <Link
            href="/portfolio/reports"
            className="px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-800 font-medium border border-blue-200 whitespace-nowrap transition flex items-center gap-1.5 shadow-xs"
          >
            <span>📘</span>
            <span>Word (.docx) รายงาน</span>
          </Link>
          <Link
            href="/portfolio/presentation"
            className="px-3.5 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-800 font-medium border border-purple-200 whitespace-nowrap transition flex items-center gap-1.5 shadow-xs"
          >
            <span>🎨</span>
            <span>PowerPoint & Canva</span>
          </Link>
          <Link
            href="/portfolio/spss-research"
            className="px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium border border-amber-200 whitespace-nowrap transition flex items-center gap-1.5 shadow-xs"
          >
            <span>📈</span>
            <span>SPSS (.sav) สถิติ</span>
          </Link>
          <Link
            href="/portfolio/assignments"
            className="px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 font-medium border border-rose-200 whitespace-nowrap transition flex items-center gap-1.5 shadow-xs"
          >
            <span>✏️</span>
            <span>แบบฝึกหัด & ใบงาน</span>
          </Link>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-14 px-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const badge = getCategoryFormatBadge(cat.slug);
                return (
                  <Link
                    key={cat.id}
                    href={`/portfolio/${cat.slug}`}
                    className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Preview Image with Step Overlay */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-950">
                      {cat.portfolios[0]?.imageUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cat.portfolios[0].imageUrl}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 group-hover:from-black/75 transition duration-300" />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                          <span className="text-5xl">{cat.icon || "📁"}</span>
                        </div>
                      )}

                      {/* Top Format Badge */}
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-gray-800 text-[11px] px-2.5 py-1 rounded-full font-semibold shadow-sm flex items-center gap-1.5">
                        <span>{cat.icon || "📁"}</span>
                        <span>{cat.name}</span>
                      </div>

                      {/* Bottom Flow Hint */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-white/90">
                        <span className="bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded font-mono">
                          ปก · สารบัญ · เนื้อหา · ตาราง · สรุป
                        </span>
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-medium shadow-xs">
                          {cat._count.portfolios} งาน →
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                        <h2 className="font-bold text-gray-900 group-hover:text-blue-600 transition text-base">
                          {cat.name}
                        </h2>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                        <span>ตัวอย่างงานส่งมอบจริง</span>
                        <span className="text-blue-600 font-semibold group-hover:underline">
                          เปิดดูหมวดนี้ →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
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
