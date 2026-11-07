import Link from "next/link";
import prisma from "@/lib/db";
import CustomerReviews from "@/components/CustomerReviews";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// หมวดหมู่บริการทั้งหมดที่รับทำ
const services = [
  { icon: "📗", name: "งานคำนวณ & Excel", slug: "excel-models", format: "Excel .xlsx ผูกสูตร" },
  { icon: "📊", name: "บัญชี & การเงิน", slug: "accounting", format: "สมุดรายวัน · งบการเงิน" },
  { icon: "📑", name: "แผนธุรกิจ & ตลาด", slug: "business-plan", format: "BMC · 7Ps · แผนธุรกิจ" },
  { icon: "📈", name: "สถิติ & SPSS", slug: "spss-research", format: "SPSS .sav · แปลผลวิจัย" },
  { icon: "📄", name: "รายงาน & วิชาการ", slug: "reports", format: "Word .docx · จัดเล่ม APA" },
  { icon: "🎨", name: "สไลด์ & Canva", slug: "presentation", format: "PowerPoint · Canva Deck" },
  { icon: "⚙️", name: "วิศวกรรม & คำนวณ", slug: "engineering", format: "โมเดลทดสอบ · คำนวณแล็บ" },
  { icon: "⚖️", name: "กฎหมายธุรกิจ", slug: "law", format: "Mind Map สรุปกฎหมาย" },
  { icon: "✏️", name: "แบบฝึกหัด & ใบงาน", slug: "assignments", format: "วิธีทำละเอียด · ข้อสอบแล็บ" },
];

async function getLatestWorks() {
  return prisma.portfolio.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      category: { select: { name: true, icon: true, slug: true } },
      images: { take: 1 },
    },
  });
}

export default async function HomePage() {
  // ดึงผลงานล่าสุด 6 ชิ้น (try-catch กัน build พังถ้า DB ยังไม่พร้อม)
  let latestWorks: Awaited<ReturnType<typeof getLatestWorks>> = [];
  try {
    latestWorks = await getLatestWorks();
  } catch {
    // DB ไม่พร้อมตอน build — แสดงหน้าโดยไม่มีผลงาน
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ===== 1. Hero ===== */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50/60 to-purple-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-100/80 text-blue-800 text-xs font-semibold px-4 py-1.5 rounded-full">
            <span>✨</span>
            <span>รับทำการบ้าน รายงาน SPSS แผนธุรกิจ บัญชี ครบวงจร</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            ร้านรับจ้างสารพัด <span className="text-blue-600">Workspace</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            รับทำการบ้าน รายงาน งานวิจัย SPSS งบการเงิน Excel และสไลด์ Canva ครบทุกวิชา
            ส่งงานตรงเวลา ละเอียดถูกต้อง รวดเร็ว ปลอดภัย 100%
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/contact"
              className="bg-blue-600 text-white px-8 py-3.5 rounded-full text-base font-medium hover:bg-blue-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              💬 สั่งงานผ่าน LINE OA
            </Link>
            <Link
              href="/portfolio"
              className="bg-white text-blue-600 px-8 py-3.5 rounded-full text-base font-medium border border-blue-200 hover:bg-blue-50 transition shadow-sm"
            >
              📂 ดูตัวอย่างผลงานจริง
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 2. Nav Bar ===== */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <span>James <span className="text-blue-600">Workspace</span></span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/portfolio" className="hover:text-blue-600 transition">
              ผลงาน
            </Link>
            <Link href="/contact" className="hover:text-blue-600 transition">
              ติดต่อ
            </Link>
            <Link href="/client" className="hover:text-blue-600 transition">
              เช็คสถานะงาน
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== 3. บริการที่รับทำ ===== */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-3xl font-bold text-gray-800">
              บริการที่รับทำทั้งหมด
            </h2>
            <p className="text-gray-500 text-sm">
              ครอบคลุมทุกระดับชั้น มัธยม มหาวิทยาลัย และงานทั่วไป แยกตามสาขาวิชา
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={`/portfolio/${s.slug}`}
                className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition text-center space-y-2 block"
              >
                <span className="text-3xl block transform group-hover:scale-110 transition duration-300">
                  {s.icon}
                </span>
                <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition block">
                  {s.name}
                </span>
                <span className="text-[11px] text-gray-400 group-hover:text-gray-600 transition block">
                  {s.format}
                </span>
              </Link>
            ))}
          </div>

          {/* Quick Filter By Software / Program (เพิ่มความชัดเจนให้ลูกค้าเลือกดูง่าย) */}
          <div className="mt-14 pt-10 border-t border-gray-100">
            <div className="text-center space-y-1 mb-8">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Software & Deliverables
              </span>
              <h3 className="text-2xl font-bold text-gray-800">
                เลือกดูผลงานตามโปรแกรมที่ต้องการสั่งทำ
              </h3>
              <p className="text-xs text-gray-400">
                ลูกค้าสามารถเลือกดูตัวอย่างงานแยกตามประเภทไฟล์และโปรแกรมได้ทันที
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <Link
                href="/portfolio/excel-models"
                className="group bg-gradient-to-b from-emerald-50/50 to-white p-4 rounded-xl border border-emerald-100/80 hover:border-emerald-300 hover:shadow-md transition text-center space-y-2 block"
              >
                <span className="text-3xl block">📗</span>
                <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition">
                  งาน Excel (.xlsx)
                </p>
                <p className="text-[11px] text-gray-500 leading-snug">
                  ผูกสูตรคำนวณอัตโนมัติ, CVP, จุดคุ้มทุน, งบประมาณ, โมเดลธุรกิจ
                </p>
                <span className="inline-block text-[10px] text-emerald-600 font-semibold group-hover:underline">
                  ดูผลงาน Excel →
                </span>
              </Link>

              <Link
                href="/portfolio/reports"
                className="group bg-gradient-to-b from-blue-50/50 to-white p-4 rounded-xl border border-blue-100/80 hover:border-blue-300 hover:shadow-md transition text-center space-y-2 block"
              >
                <span className="text-3xl block">📘</span>
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition">
                  งานเขียน Word (.docx)
                </p>
                <p className="text-[11px] text-gray-500 leading-snug">
                  รายงานวิชาการ, ภาคนิพนธ์, สารบัญอัตโนมัติ, อ้างอิง APA 7th
                </p>
                <span className="inline-block text-[10px] text-blue-600 font-semibold group-hover:underline">
                  ดูผลงาน Word →
                </span>
              </Link>

              <Link
                href="/portfolio/presentation"
                className="group bg-gradient-to-b from-purple-50/50 to-white p-4 rounded-xl border border-purple-100/80 hover:border-purple-300 hover:shadow-md transition text-center space-y-2 block"
              >
                <span className="text-3xl block">🎨</span>
                <p className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition">
                  สไลด์ Canva / PPTX
                </p>
                <p className="text-[11px] text-gray-500 leading-snug">
                  สไลด์นำเสนอฝึกงาน, โครงงานธุรกิจ, Pitch Deck ดีไซน์สวยงาม
                </p>
                <span className="inline-block text-[10px] text-purple-600 font-semibold group-hover:underline">
                  ดูผลงานสไลด์ →
                </span>
              </Link>

              <Link
                href="/portfolio/spss-research"
                className="group bg-gradient-to-b from-amber-50/50 to-white p-4 rounded-xl border border-amber-100/80 hover:border-amber-300 hover:shadow-md transition text-center space-y-2 block"
              >
                <span className="text-3xl block">📈</span>
                <p className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition">
                  สถิติวิจัย SPSS (.sav)
                </p>
                <p className="text-[11px] text-gray-500 leading-snug">
                  รันผลสถิติ, Cronbach, ANOVA, Regression, ตารางสรุปผลวิจัย
                </p>
                <span className="inline-block text-[10px] text-amber-600 font-semibold group-hover:underline">
                  ดูผลงาน SPSS →
                </span>
              </Link>

              <Link
                href="/portfolio/assignments"
                className="group bg-gradient-to-b from-rose-50/50 to-white p-4 rounded-xl border border-rose-100/80 hover:border-rose-300 hover:shadow-md transition text-center space-y-2 block"
              >
                <span className="text-3xl block">✏️</span>
                <p className="text-sm font-bold text-gray-900 group-hover:text-rose-700 transition">
                  แบบฝึกหัด & ใบงาน
                </p>
                <p className="text-[11px] text-gray-500 leading-snug">
                  แสดงวิธีทำละเอียดทุกขั้นตอน, ดิจิทัลลอจิก, ข้อสอบแล็บคอม
                </p>
                <span className="inline-block text-[10px] text-rose-600 font-semibold group-hover:underline">
                  ดูผลงานใบงาน →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4. ผลงานล่าสุด ===== */}
      <section className="py-16 px-6 bg-gray-50/70 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">ผลงานล่าสุด</h2>
              <p className="text-xs text-gray-500 mt-1">
                คลิกดูภาพขยายและรายละเอียดผลงานที่ส่งมอบจริง
              </p>
            </div>
            <Link
              href="/portfolio"
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline flex items-center gap-1"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          {latestWorks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 max-w-lg mx-auto p-8 shadow-xs space-y-3">
              <span className="text-4xl block">✨</span>
              <p className="text-gray-800 font-bold text-base">พร้อมรับงานทุกสาขาวิชา</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                คลิกเลือกดูบริการที่รับทำด้านบน หรือทัก LINE เพื่อส่งโจทย์และประเมินราคาได้ทันที
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-full text-xs transition shadow-sm"
                >
                  💬 สอบถามหรือสั่งงานผ่าน LINE
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestWorks.map((item) => (
                <Link
                  key={item.id}
                  href={`/portfolio/${item.category.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-lg transition duration-300 overflow-hidden flex flex-col"
                >
                  {/* แสดงรูปภาพ หรือ Icon Fallback */}
                  {item.imageUrl ? (
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition duration-300" />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center gap-2">
                      <span className="text-5xl">
                        {item.category.icon || "📁"}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {item.category.name}
                      </span>
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-sm">{item.category.icon}</span>
                        <span className="text-xs font-semibold text-blue-600">
                          {item.category.name}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                      <span>ตัวอย่างงานจริง</span>
                      <span className="text-blue-600 font-medium group-hover:underline">
                        ดูรายละเอียด →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== 5. ทำไมต้องเลือกเรา ===== */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
            ทำไมต้องเลือกเรา?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "⚡",
                title: "งานเร็ว ทันกำหนด",
                desc: "รับงานด่วนได้ ส่งงานตรงเวลาทุกครั้ง มีแบบร่างให้เช็คความคืบหน้า",
              },
              {
                icon: "✨",
                title: "คุณภาพเกินราคา",
                desc: "งานเรียบร้อย ละเอียด ถูกต้องตามหลักวิชาการและรูปแบบที่กำหนด",
              },
              {
                icon: "🔒",
                title: "ปลอดภัย เป็นความลับ",
                desc: "รักษาความลับของลูกค้าและข้อมูล 100% ไม่เปิดเผยตัวตน",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs text-center space-y-3"
              >
                <span className="text-4xl block">{item.icon}</span>
                <h3 className="font-bold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 6. รีวิวจากลูกค้าจริง ===== */}
      <section className="py-16 px-6 bg-gradient-to-b from-white to-gray-50/80 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Customer Reviews
            </span>
            <h2 className="text-3xl font-bold text-gray-900">
              รีวิวและความประทับใจจากลูกค้า
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              เสียงตอบรับจากเพื่อนๆ พี่ๆ น้องๆ นักเรียน นักศึกษาที่ไว้วางใจให้เราช่วยดูแลงาน
            </p>
          </div>

          <CustomerReviews />
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            พร้อมส่งงานให้เราช่วยดูแลแล้วใช่ไหม?
          </h2>
          <p className="text-blue-100 text-base">
            ทักมาสอบถามรายละเอียด ประเมินราคา ปรึกษาฟรี ไม่มีค่าใช้จ่ายล่วงหน้า!
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-block bg-white text-blue-700 font-bold px-10 py-4 rounded-full text-base hover:bg-blue-50 transition shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              💬 แอดไลน์สั่งงานเลย
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-white border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        <p>
          © {new Date().getFullYear()} ร้านรับจ้างสารพัด Workspace. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
