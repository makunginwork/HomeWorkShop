"use client";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<any>(null); // State สำหรับควบคุม Popup เปิด/ปิด

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newOrder = {
      lineUid: formData.get("lineUid"),
      displayName: formData.get("displayName"),
      title: formData.get("title"),
      totalPrice: Number(formData.get("totalPrice")),
      dueDate: formData.get("dueDate") || null,
    };
    try {
      await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });
      fetchOrders();
      e.currentTarget.reset();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการสร้างออเดอร์");
    }
  };

  // ฟังก์ชันสำหรับอัปเดตสถานะและลิงก์งาน
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await fetch(`/api/admin/orders/${editingOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: formData.get("status"),
          fileLink: formData.get("fileLink"),
        }),
      });
      setEditingOrder(null); // ปิด Popup
      fetchOrders(); // รีเฟรชตาราง
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">ระบบจัดการคิวงาน (Admin)</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ฟอร์มสร้างออเดอร์ (ย่อส่วนให้เล็กลง) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1 h-fit">
            <h2 className="text-lg font-semibold mb-4">+ สร้างออเดอร์ใหม่</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required name="lineUid" type="text" className="w-full border rounded-lg p-2 text-sm" placeholder="UID ลูกค้า" />
              <input required name="displayName" type="text" className="w-full border rounded-lg p-2 text-sm" placeholder="ชื่อลูกค้า" />
              <input required name="title" type="text" className="w-full border rounded-lg p-2 text-sm" placeholder="ชื่องาน" />
              <input required name="totalPrice" type="number" className="w-full border rounded-lg p-2 text-sm" placeholder="ราคา (บาท)" />
              <input name="dueDate" type="datetime-local" className="w-full border rounded-lg p-2 text-sm" />
              <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg">บันทึก</button>
            </form>
          </div>

          {/* ตารางแสดงออเดอร์ */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-3">
            <h2 className="text-lg font-semibold mb-4">คิวงานทั้งหมด</h2>
            {isLoading ? <p>กำลังโหลด...</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="p-3">ลูกค้า</th>
                      <th className="p-3">ชื่องาน</th>
                      <th className="p-3">สถานะ</th>
                      <th className="p-3">กำหนดส่ง</th>
                      <th className="p-3">ลิงก์งาน</th>
                      <th className="p-3 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{order.customer.displayName}</td>
                        <td className="p-3">{order.title}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                            order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3 text-red-600">
                          {order.dueDate ? new Date(order.dueDate).toLocaleString('th-TH') : "-"}
                        </td>
                        <td className="p-3">
                          {order.fileLink ? <a href={order.fileLink} target="_blank" className="text-blue-500 underline">ดูไฟล์</a> : "-"}
                        </td>
                        <td className="p-3 text-center">
                          <button onClick={() => setEditingOrder(order)} className="text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg">
                            อัปเดต
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* หน้าต่าง Popup สำหรับอัปเดตข้อมูล */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">อัปเดตงาน: {editingOrder.title}</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">สถานะงาน</label>
                <select name="status" defaultValue={editingOrder.status} className="w-full border rounded-lg p-2 text-sm">
                  <option value="PENDING_DEPOSIT">รอมัดจำ</option>
                  <option value="IN_PROGRESS">กำลังดำเนินการ</option>
                  <option value="DELIVERED">ส่งมอบแล้ว (จบงาน)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">แนบลิงก์ Google Drive</label>
                <input name="fileLink" type="url" defaultValue={editingOrder.fileLink || ""} className="w-full border rounded-lg p-2 text-sm" placeholder="https://drive.google.com/..." />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setEditingOrder(null)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
