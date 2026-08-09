"use client";
import { useState } from "react";

export default function ClientDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"CURRENT" | "ARCHIVE">("CURRENT");

  // สำหรับทดสอบบน Localhost (แทนที่การดึงค่าจาก LIFF ชั่วคราว)
  const [testUid, setTestUid] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ฟังก์ชันดึงข้อมูลเมื่อลูกค้าเข้าสู่ระบบ (จำลอง LIFF)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUid) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/client/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineUid: testUid }),
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
        setIsLoggedIn(true);
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  // คัดกรองข้อมูลตามสถานะ
  const currentOrders = orders.filter((o) => o.status !== "DELIVERED");
  const archiveOrders = orders.filter((o) => o.status === "DELIVERED");

  // ฟังก์ชันช่วยแปลสถานะเป็นภาษาไทยและสี
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_DEPOSIT":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
            รอมัดจำ
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
            กำลังดำเนินการ
          </span>
        );
      case "DELIVERED":
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
            ส่งมอบแล้ว
          </span>
        );
      default:
        return null;
    }
  };

  // หน้าจอตอนยังไม่ล็อกอิน (โหมดทดสอบ)
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">
            📱
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              จำลองการเข้าสู่ระบบ LINE
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              กรอก UID ลูกค้าที่สร้างไว้ใน Admin เพื่อดูผลลัพธ์
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              required
              type="text"
              value={testUid}
              onChange={(e) => setTestUid(e.target.value)}
              placeholder="กรอก UID เช่น U123..."
              className="w-full border rounded-xl p-3 text-sm text-center"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl transition"
            >
              {isLoading ? "กำลังโหลด..." : "เข้าสู่ระบบ (LIFF Mock)"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // หน้าจอ Client Dashboard จริง
  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto shadow-xl relative">
      {/* Header */}
      <header className="bg-white px-6 py-8 rounded-b-3xl shadow-sm mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">สถานะงานของคุณ</h1>
        <p className="text-gray-500 text-sm mt-1">
          อัปเดตล่าสุด: {new Date().toLocaleDateString("th-TH")}
        </p>
      </header>

      {/* Tabs */}
      <div className="px-6 flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab("CURRENT")}
          className={`flex-1 py-3 text-sm font-medium rounded-xl transition ${activeTab === "CURRENT" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-500 border border-gray-200"}`}
        >
          งานปัจจุบัน ({currentOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("ARCHIVE")}
          className={`flex-1 py-3 text-sm font-medium rounded-xl transition ${activeTab === "ARCHIVE" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-500 border border-gray-200"}`}
        >
          คลังผลงาน ({archiveOrders.length})
        </button>
      </div>

      {/* List Content */}
      <div className="px-6 pb-20 space-y-4">
        {activeTab === "CURRENT" ? (
          currentOrders.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm">
              ไม่มีงานที่กำลังดำเนินการ
            </p>
          ) : (
            currentOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">
                    {order.title}
                  </h3>
                  {getStatusBadge(order.status)}
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>ราคา: ฿{order.totalPrice}</p>
                  <p>
                    กำหนดส่ง: {" "}
                    {order.dueDate
                      ? new Date(order.dueDate).toLocaleDateString("th-TH")
                      : "ไม่ได้กำหนด"}
                  </p>
                </div>
              </div>
            ))
          )
        ) : archiveOrders.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">
            ยังไม่มีผลงานที่ส่งมอบแล้ว
          </p>
        ) : (
          archiveOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col"
            >
              <h3 className="font-bold text-gray-800 text-lg leading-tight mb-2">
                {order.title}
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                เสร็จสิ้นเมื่อ: {" "}
                {new Date(order.updatedAt).toLocaleDateString("th-TH")}
              </p>
              {order.fileLink ? (
                <a
                  href={order.fileLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-center bg-green-50 text-green-700 font-medium py-3 rounded-xl border border-green-200 hover:bg-green-100 transition"
                >
                  ดาวน์โหลดไฟล์งาน
                </a>
              ) : (
                <p className="text-sm text-red-500 text-center">
                  ไม่มีลิงก์ไฟล์
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
