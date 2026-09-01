import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ติดต่อเรา | James Workspace",
  description: "ช่องทางติดต่อสั่งงาน — LINE OA, สอบถามราคา, ขั้นตอนการสั่งงาน",
};

// ขั้นตอนการสั่งงาน
const steps = [
  { icon: "💬", title: "ทักแชท LINE", desc: "แจ้งรายละเอียดงานที่ต้องการ" },
  { icon: "💰", title: "ตกลงราคา", desc: "ประเมินราคาและชำระมัดจำ" },
  { icon: "⏳", title: "รอรับงาน", desc: "ติดตามสถานะงานแบบ Real-time" },
  { icon: "✅", title: "รับงาน", desc: "ตรวจงานและรับไฟล์ผลงาน" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            ติดต่อ<span className="text-green-600">สั่งงาน</span>
          </h1>
          <p className="text-lg text-gray-600">
            สนใจสั่งงาน สอบถามราคา หรือปรึกษาก่อนได้เลย
          </p>
          <Link
            href="/"
            className="inline-block text-sm text-green-600 hover:underline"
          >
            ← กลับหน้าหลัก
          </Link>
        </div>
      </section>

      {/* LINE OA Contact */}
      <section className="py-16 px-6">
        <div className="max-w-md mx-auto text-center space-y-8">
          {/* LINE Button */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-4xl">💬</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                LINE Official Account
              </h2>
              <p className="text-gray-500 text-sm">
                แอดเพื่อนเพื่อสอบถามและสั่งงาน
              </p>
            </div>

            <Link
              href="https://line.me/ti/p/~YOUR_LINE_ID"
              target="_blank"
              rel="noreferrer"
              className="block w-full bg-green-500 hover:bg-green-600 text-white font-medium py-4 rounded-xl transition text-lg shadow-lg hover:shadow-xl"
            >
              แอดไลน์สั่งงาน 📱
            </Link>

            <p className="text-xs text-gray-400">
              หรือค้นหา LINE ID:{" "}
              <span className="font-mono font-medium text-gray-600">
                @your-line-id
              </span>
            </p>
          </div>

          {/* เวลาทำการ */}
          <div className="bg-gray-50 p-6 rounded-2xl text-sm space-y-2">
            <h3 className="font-semibold text-gray-700">⏰ เวลาทำการ</h3>
            <p className="text-gray-500">ทุกวัน 09:00 - 22:00 น.</p>
            <p className="text-gray-400 text-xs">* ตอบแชทภายใน 1-2 ชั่วโมง</p>
          </div>
        </div>
      </section>

      {/* ขั้นตอนการสั่งงาน */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">
            ขั้นตอนการสั่งงาน
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center space-y-3"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-2xl">
                  {step.icon}
                </div>
                <div className="text-xs text-blue-600 font-semibold">
                  ขั้นตอนที่ {i + 1}
                </div>
                <h3 className="font-bold text-gray-800 text-sm">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-xs">{step.desc}</p>
              </div>
            ))}
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
