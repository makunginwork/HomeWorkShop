"use client";
import { useState, useEffect } from "react";
import type {
  OrderWithCustomer,
  OrderStatus,
  CreateOrderPayload,
  UpdateOrderPayload,
} from "@/types";

// ============================================================
// Helper: แปลงสถานะ enum เป็นภาษาไทย + สี Badge
// ============================================================
function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; className: string }> = {
    PENDING_DEPOSIT: { label: "รอมัดจำ", className: "bg-yellow-100 text-yellow-800" },
    IN_PROGRESS:    { label: "กำลังดำเนินการ", className: "bg-blue-100 text-blue-800" },
    DELIVERED:      { label: "ส่งมอบแล้ว", className: "bg-green-100 text-green-800" },
  };
  const { label, className } = map[status];
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

// ============================================================
// Main Component
// ============================================================
export default function AdminDashboard() {
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State: Popup แก้ไข
  const [editingOrder, setEditingOrder] = useState<OrderWithCustomer | null>(null);
  const [updateError, setUpdateError] = useState("");

  // State: Modal ยืนยันลบ
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ============================================================
  // Fetch
  // ============================================================
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data);
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // ============================================================
  // สร้างออเดอร์ใหม่
  // ============================================================
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: CreateOrderPayload = {
      lineUid:      formData.get("lineUid") as string,
      displayName:  formData.get("displayName") as string,
      title:        formData.get("title") as string,
      totalPrice:   Number(formData.get("totalPrice")),
      dueDate:      (formData.get("dueDate") as string) || null,
    };

    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(`เกิดข้อผิดพลาด: ${data.error || "ไม่สามารถสร้างออเดอร์ได้"}`);
        return;
      }

      e.currentTarget.reset();
      await fetchOrders();
    } catch {
      alert("เกิดข้อผิดพลาด: ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  // ============================================================
  // แก้ไขออเดอร์ (status + fileLink + dueDate)
  // ============================================================
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingOrder) return;
    setUpdateError("");

    const formData = new FormData(e.currentTarget);
    const dueDateVal = formData.get("dueDate") as string;
    const payload: UpdateOrderPayload = {
      status:   formData.get("status") as OrderStatus,
      fileLink: formData.get("fileLink") as string,
      dueDate:  dueDateVal || null,
    };

    try {
      const res = await fetch(`/api/admin/orders/${editingOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setUpdateError(data.error || "ไม่สามารถอัปเดตข้อมูลได้");
        return;
      }

      setEditingOrder(null);
      await fetchOrders();
    } catch {
      setUpdateError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  // ============================================================
  // ลบออเดอร์
  // ============================================================
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "เกิดข้อผิดพลาดในการลบออเดอร์");
        return;
      }

      setDeletingId(null);
      await fetchOrders();
    } catch {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  // ============================================================
  // Helper: format dueDate สำหรับ input datetime-local
  // ============================================================
  const toLocalDatetimeValue = (iso: string | null | undefined): string => {
    if (!iso) return "";
    const d = new Date(iso);
    // ตัด timezone offset ออก เพื่อให้ datetime-local แสดงเวลาท้องถิ่น
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className="bg-white px-6 py-5 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">ระบบจัดการคิวงาน (Admin)</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            ออเดอร์ทั้งหมด: <span className="font-semibold text-gray-600">{orders.length}</span> รายการ
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ===== ฟอร์มสร้างออเดอร์ ===== */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1 h-fit">
            <h2 className="text-base font-semibold text-gray-700 mb-4">➕ สร้างออเดอร์ใหม่</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                required name="lineUid" type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="UID ลูกค้า (LINE)"
              />
              <input
                required name="displayName" type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="ชื่อลูกค้า"
              />
              <input
                required name="title" type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="ชื่องาน"
              />
              <input
                required name="totalPrice" type="number" min="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="ราคา (บาท)"
              />
              <div>
                <label className="block text-xs text-gray-400 mb-1">กำหนดส่ง (ไม่บังคับ)</label>
                <input
                  name="dueDate" type="datetime-local"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition text-sm"
              >
                บันทึกออเดอร์
              </button>
            </form>
          </div>

          {/* ===== ตารางออเดอร์ ===== */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-3">
            <h2 className="text-base font-semibold text-gray-700 mb-4">📋 คิวงานทั้งหมด</h2>

            {isLoading ? (
              <div className="py-16 text-center text-gray-400">กำลังโหลด...</div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-sm">ยังไม่มีออเดอร์ในระบบ</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3">ลูกค้า</th>
                      <th className="px-4 py-3">ชื่องาน</th>
                      <th className="px-4 py-3">สถานะ</th>
                      <th className="px-4 py-3">กำหนดส่ง</th>
                      <th className="px-4 py-3">ลิงก์งาน</th>
                      <th className="px-4 py-3 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {order.customer.displayName}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{order.title}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3">
                          {order.dueDate ? (
                            <span className="text-red-500 text-xs">
                              {new Date(order.dueDate).toLocaleString("th-TH", {
                                dateStyle: "short", timeStyle: "short",
                              })}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {order.fileLink ? (
                            <a
                              href={order.fileLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-500 underline text-xs"
                            >
                              ดูไฟล์ ↗
                            </a>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {/* ปุ่มแก้ไข */}
                            <button
                              onClick={() => { setEditingOrder(order); setUpdateError(""); }}
                              className="text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                            >
                              ✏️ แก้ไข
                            </button>
                            {/* ปุ่มลบ */}
                            <button
                              onClick={() => setDeletingId(order.id)}
                              className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                            >
                              🗑️ ลบ
                            </button>
                          </div>
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

      {/* ============================================================
          Popup: แก้ไขออเดอร์
          ============================================================ */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">✏️ แก้ไขออเดอร์</h3>
              <button
                onClick={() => setEditingOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >✕</button>
            </div>

            {/* Body */}
            <form id="update-form" onSubmit={handleUpdate} className="px-6 py-4 space-y-4">
              <p className="text-sm text-gray-500">
                งาน: <span className="font-semibold text-gray-800">{editingOrder.title}</span>
                {" · "}ลูกค้า: {editingOrder.customer.displayName}
              </p>

              {/* สถานะ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สถานะงาน</label>
                <select
                  name="status"
                  defaultValue={editingOrder.status}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="PENDING_DEPOSIT">⏳ รอมัดจำ</option>
                  <option value="IN_PROGRESS">🔧 กำลังดำเนินการ</option>
                  <option value="DELIVERED">✅ ส่งมอบแล้ว (จบงาน)</option>
                </select>
              </div>

              {/* กำหนดส่ง */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  กำหนดส่ง
                </label>
                <input
                  name="dueDate"
                  type="datetime-local"
                  defaultValue={toLocalDatetimeValue(editingOrder.dueDate)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">เว้นว่างเพื่อล้างค่ากำหนดส่ง</p>
              </div>

              {/* ลิงก์ไฟล์ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ลิงก์ Google Drive
                </label>
                <input
                  name="fileLink"
                  type="url"
                  defaultValue={editingOrder.fileLink || ""}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              {/* Error */}
              {updateError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
                  ⚠️ {updateError}
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                form="update-form"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
              >
                บันทึกข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          Modal: ยืนยันลบออเดอร์
          ============================================================ */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center space-y-4">
            <p className="text-4xl">🗑️</p>
            <h3 className="text-lg font-bold text-gray-800">ยืนยันการลบออเดอร์</h3>
            <p className="text-sm text-gray-500">
              ออเดอร์จะถูกลบออกถาวร ไม่สามารถกู้คืนได้
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition"
              >
                ยืนยัน ลบเลย
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
