import Link from "next/link";
import prisma from "@/lib/db";
import CustomerReviews from "@/components/CustomerReviews";

// หมวดหมู่บริการทั้งหมดที่รับทำ
const services = [
  { icon: "📊", name: "บัญชี & การเงิน", slug: "accounting" },
  { icon: "📑", name: "แผนธุรกิจ & ตลาด", slug: "business-plan" },
  { icon: "📈", name: "สถิติ & SPSS", slug: "spss-research" },
  { icon: "📄", name: "รายงาน & วิชาการ", slug: "reports" },
  { icon: "🎨", name: "สไลด์ & Canva", slug: "presentation" },
  { icon: "⚙️", name: "วิศวกรรม & คำนวณ", slug: "engineering" },
  { icon: "⚖️", name: "กฎหมายธุรกิจ", slug: "law" },
  { icon: "✏️", name: "แบบฝึกหัด & ใบงาน", slug: "assignments" },
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
              ครอบคลุมทุกระดับชั้น มัธยม มหาวิทยาลัย และงานทั่วไป
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={`/portfolio/${s.slug}`}
                className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition text-center space-y-2.5 block"
              >
                <span className="text-3xl block transform group-hover:scale-110 transition duration-300">
                  {s.icon}
                </span>
                <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition block">
                  {s.name}
                </span>
              </Link>
            ))}
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
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm">ยังไม่มีผลงานในขณะนี้</p>
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
