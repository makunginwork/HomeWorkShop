import Link from "next/link";

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            James <span className="text-blue-600">Workspace</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            บริการรับพัฒนาเว็บไซต์และเว็บแอปพลิเคชันยุคใหม่
            พร้อมบริการที่ปรึกษาด้านวิชาการครบวงจร
            ดำเนินงานด้วยความใส่ใจทุกรายละเอียด
          </p>
          <div className="pt-6">
            <Link
              href="https://line.me/ti/p/~YOUR_LINE_ID"
              target="_blank"
              rel="noreferrer" // <-- เติมบรรทัดนี้
              className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              ติดต่อสอบถามคิวงาน
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Services Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            บริการของเรา
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Service 1: Web Dev */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-2xl mb-6">
                💻
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Software & Web Development
              </h3>
              <p className="text-gray-600">
                รับออกแบบและพัฒนาเว็บไซต์ด้วยเทคโนโลยีทันสมัย
                รองรับการใช้งานทุกหน้าจอ (Responsive) ไม่ว่าจะเป็นหน้า Landing
                Page, ระบบจัดการหลังบ้าน (Admin Panel) หรือ Web Application
                แบบกำหนดเอง
              </p>
            </div>

            {/* Service 2: Academic */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-2xl mb-6">
                📚
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Academic & Tutoring Services
              </h3>
              <p className="text-gray-600">
                บริการให้คำปรึกษา ช่วยทำการบ้าน และติวเตอร์ส่วนตัว
                ครอบคลุมรายวิชาเศรษฐศาสตร์มหภาค/จุลภาค, บัญชี, คณิตศาสตร์,
                ภาษาอังกฤษ และวัสดุศาสตร์
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tech Stack Section */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            เครื่องมือและเทคโนโลยีที่เชี่ยวชาญ
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Next.js",
              "React",
              "NestJS",
              "Python",
              "Tailwind CSS",
              "PostgreSQL",
              "JavaScript",
              "HTML/CSS",
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 text-center text-gray-500 text-sm">
        <p>
          © {new Date().getFullYear()} James Workspace. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
