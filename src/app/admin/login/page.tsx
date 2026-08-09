"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // ถ้ารหัสถูก ให้พาไปหน้า Dashboard ทันที
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "เข้าสู่ระบบไม่สำเร็จ");
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Workspace</h1>
          <p className="text-sm text-gray-500 mt-2">
            กรุณาใส่รหัสผ่านเพื่อเข้าสู่ระบบ
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่านผู้ดูแลระบบ"
              className="w-full border rounded-xl p-3 text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition"
          >
            {isLoading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
