import Link from "next/link";
import prisma from "@/lib/db";

// ประเภทบริการทั้งหมดที่รับทำ
const services = [
  { icon: "📄", name: "รายงาน / Word" },
  { icon: "📊", name: "Excel / ตาราง" },
  { icon: "📑", name: "PDF" },
  { icon: "🧮", name: "บัญชี" },
  { icon: "🧊", name: "โมเดล 3D" },
  { icon: "🌐", name: "เว็บไซต์ / โค้ด" },
  { icon: "✏️", name: "งานเขียน" },
  { icon: "🎨", name: "Canva Design" },
  { icon: "🇬🇧", name: "งานภาษาอังกฤษ" },
];

export default async function HomePage() {
  // ดึงผลงานล่าสุด 6 ชิ้น
  const latestWorks = await prisma.portfolio.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { category: { select: { name: true, icon: true } } },
  });

  return (
    <div className="min-h-screen bg-white">

      {/* ===== 1. Hero ===== */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            James <span className="text-blue-600">Workspace</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            รับทำการบ้าน รายงาน งานเอกสาร ครบทุกวิชา
            ดำเนินงานด้วยความใส่ใจ ส่งงานตรงเวลา
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/contact"
              className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              💬 สั่งงานเลย
            </Link>
            <Link
              href="/portfolio"
              className="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-medium border border-blue-200 hover:bg-blue-50 transition"
            >
              📂 ดูผลงาน
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 2. Nav Bar ===== */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/portfolio" className="hover:text-blue-600 transition">ผลงาน</Link>
          <Link href="/contact" className="hover:text-blue-600 transition">ติดต่อ</Link>
          <Link href="/client" className="hover:text-blue-600 transition">เช็คสถานะงาน</Link>
        </div>
      </nav>

      {/* ===== 3. บริการที่รับทำ ===== */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
            บริการที่รับทำ
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {services.map((s) => (
              <div
                key={s.name}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition text-center space-y-2"
              >
                <span className="text-3xl block">{s.icon}</span>
                <span className="text-xs font-medium text-gray-700">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. ผลงานล่าสุด ===== */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-gray-800">ผลงานล่าสุด</h2>
            <Link href="/portfolio" className="text-blue-600 hover:underline text-sm font-medium">
              ดูทั้งหมด →
            </Link>
          </div>

          {latestWorks.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm">ยังไม่มีผลงานในขณะนี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {latestWorks.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {/* แสดงรูป ถ้ามี / ถ้าไม่มีแสดง icon ประเภทงานแทน */}
                  {item.imageUrl ? (
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center gap-2">
                      <span className="text-5xl">{item.category.icon || "📁"}</span>
                      <span className="text-xs text-gray-400 font-medium">{item.category.name}</span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{item.category.icon}</span>
                      <span className="text-xs text-gray-400">{item.category.name}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                </div>
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
              { icon: "⚡", title: "งานเร็ว ทันกำหนด", desc: "รับงานด่วนได้ ส่งงานตรงเวลาทุกครั้ง" },
              { icon: "✨", title: "คุณภาพเกินราคา", desc: "งานเรียบร้อย ตรวจทุกรายละเอียดก่อนส่ง" },
              { icon: "🔒", title: "ปลอดภัย เป็นความลับ", desc: "ข้อมูลลูกค้าถูกเก็บเป็นความลับ 100%" },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center space-y-3"
              >
                <span className="text-3xl block">{item.icon}</span>
                <h3 className="font-bold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">พร้อมสั่งงานแล้วใช่ไหม?</h2>
          <p className="text-blue-100">ทักมาคุยก่อนได้เลย ปรึกษาฟรี!</p>
          <Link
            href="/contact"
            className="inline-block bg-white text-blue-700 font-bold px-10 py-4 rounded-full text-lg hover:bg-blue-50 transition shadow-lg"
          >
            💬 ติดต่อสั่งงาน
          </Link>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-white border-t border-gray-100 py-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} James Workspace. All rights reserved.</p>
      </footer>
    </div>
  );
}
