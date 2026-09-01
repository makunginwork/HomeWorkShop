"use client";
import { useState, useEffect, useCallback } from "react";
import type {
  PortfolioWithCategory,
  CreatePortfolioPayload,
  UpdatePortfolioPayload,
  CategoryWithCount,
  CreateCategoryPayload,
} from "@/types";

// ============================================================
// Main Component
// ============================================================
export default function AdminPortfolioPage() {
  // Data
  const [portfolios, setPortfolios] = useState<PortfolioWithCategory[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tab: "portfolios" | "categories"
  const [activeTab, setActiveTab] = useState<"portfolios" | "categories">(
    "portfolios",
  );

  // Modal: Portfolio
  const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);
  const [editingPortfolio, setEditingPortfolio] =
    useState<PortfolioWithCategory | null>(null);

  // Modal: Category
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Delete confirm
  const [deletingPortfolioId, setDeletingPortfolioId] = useState<string | null>(
    null,
  );

  // Modal error
  const [modalError, setModalError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isPortfolioModalOpen = isCreatingPortfolio || editingPortfolio !== null;

  // ============================================================
  // Fetch Data
  // ============================================================
  const fetchAll = useCallback(async () => {
    try {
      const [portRes, catRes] = await Promise.all([
        fetch("/api/admin/portfolios"),
        fetch("/api/admin/categories"),
      ]);
      if (portRes.ok) setPortfolios(await portRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch {
      console.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const closeModal = () => {
    setIsCreatingPortfolio(false);
    setEditingPortfolio(null);
    setIsCreatingCategory(false);
    setModalError("");
  };

  // ============================================================
  // Portfolio CRUD
  // ============================================================
  const handleCreatePortfolio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalError("");
    setIsSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload: CreatePortfolioPayload = {
      categoryId: fd.get("categoryId") as string,
      title: fd.get("title") as string,
      imageUrl: fd.get("imageUrl") as string,
      description: (fd.get("description") as string) || undefined,
      published: fd.get("published") === "true",
    };

    try {
      const res = await fetch("/api/admin/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setModalError((await res.json()).error || "ไม่สามารถเพิ่มผลงานได้");
        return;
      }
      closeModal();
      await fetchAll();
    } catch {
      setModalError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePortfolio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPortfolio) return;
    setModalError("");
    setIsSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload: UpdatePortfolioPayload = {
      categoryId: fd.get("categoryId") as string,
      title: fd.get("title") as string,
      imageUrl: fd.get("imageUrl") as string,
      description: (fd.get("description") as string) || undefined,
      published: fd.get("published") === "true",
    };

    try {
      const res = await fetch(`/api/admin/portfolios/${editingPortfolio.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setModalError((await res.json()).error || "ไม่สามารถแก้ไขผลงานได้");
        return;
      }
      closeModal();
      await fetchAll();
    } catch {
      setModalError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/portfolios/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert((await res.json()).error || "ลบไม่สำเร็จ");
        return;
      }
      setDeletingPortfolioId(null);
      await fetchAll();
    } catch {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  // ============================================================
  // Category Create
  // ============================================================
  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalError("");
    setIsSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload: CreateCategoryPayload = {
      name: fd.get("name") as string,
      slug: fd.get("slug") as string,
      icon: (fd.get("icon") as string) || undefined,
    };

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setModalError((await res.json()).error || "ไม่สามารถสร้างประเภทงานได้");
        return;
      }
      closeModal();
      await fetchAll();
    } catch {
      setModalError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="bg-white px-6 py-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              จัดการผลงาน (Portfolio)
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              <a
                href="/admin/dashboard"
                className="text-blue-600 hover:underline"
              >
                ← กลับ Dashboard
              </a>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsCreatingCategory(true);
                setModalError("");
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-xl transition text-sm"
            >
              + ประเภทงาน
            </button>
            <button
              onClick={() => {
                setIsCreatingPortfolio(true);
                setModalError("");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition text-sm"
            >
              + เพิ่มผลงาน
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("portfolios")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "portfolios"
                ? "bg-white shadow-sm text-gray-800"
                : "text-gray-500"
            }`}
          >
            📸 ผลงาน ({portfolios.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "categories"
                ? "bg-white shadow-sm text-gray-800"
                : "text-gray-500"
            }`}
          >
            📁 ประเภทงาน ({categories.length})
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center text-gray-400">กำลังโหลด...</div>
          ) : activeTab === "portfolios" ? (
            /* ===== Portfolio Table ===== */
            portfolios.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-4xl mb-3">📸</p>
                <p className="text-gray-500">
                  ยังไม่มีผลงาน กด &ldquo;+ เพิ่มผลงาน&rdquo; เพื่อเริ่มต้น
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3">รูปภาพ</th>
                      <th className="px-4 py-3">ชื่อผลงาน</th>
                      <th className="px-4 py-3">ประเภท</th>
                      <th className="px-4 py-3">สถานะ</th>
                      <th className="px-4 py-3 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {portfolios.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-16 h-12 object-cover rounded-lg bg-gray-100"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800 max-w-xs">
                          <span className="line-clamp-1">{p.title}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {p.category.icon} {p.category.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {p.published ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              เผยแพร่
                            </span>
                          ) : (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                              ซ่อน
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingPortfolio(p);
                                setModalError("");
                              }}
                              className="text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                            >
                              ✏️ แก้ไข
                            </button>
                            <button
                              onClick={() => setDeletingPortfolioId(p.id)}
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
            )
          ) : /* ===== Category List ===== */
          categories.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-4xl mb-3">📁</p>
              <p className="text-gray-500">
                ยังไม่มีประเภทงาน กด &ldquo;+ ประเภทงาน&rdquo; เพื่อสร้าง
              </p>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-gray-50 rounded-xl p-5 flex items-center gap-4 border border-gray-100"
                >
                  <span className="text-3xl">{cat.icon || "📁"}</span>
                  <div>
                    <p className="font-bold text-gray-800">{cat.name}</p>
                    <p className="text-xs text-gray-400">
                      /{cat.slug} · {cat._count.portfolios} ผลงาน
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          Modal: สร้าง/แก้ไข Portfolio
          ============================================================ */}
      {isPortfolioModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {editingPortfolio
                  ? `✏️ แก้ไข: ${editingPortfolio.title}`
                  : "📸 เพิ่มผลงานใหม่"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4">
              <form
                id="portfolio-form"
                onSubmit={
                  editingPortfolio
                    ? handleUpdatePortfolio
                    : handleCreatePortfolio
                }
                className="space-y-4"
              >
                {/* ประเภทงาน */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ประเภทงาน *
                  </label>
                  <select
                    name="categoryId"
                    required
                    defaultValue={editingPortfolio?.categoryId ?? ""}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="" disabled>
                      — เลือกประเภทงาน —
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      ⚠️ กรุณาสร้างประเภทงานก่อน
                    </p>
                  )}
                </div>

                {/* ชื่อผลงาน */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อผลงาน *
                  </label>
                  <input
                    name="title"
                    type="text"
                    required
                    defaultValue={editingPortfolio?.title ?? ""}
                    placeholder="เช่น: รายงานวิจัย เรื่อง..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>

                {/* URL รูปภาพ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL รูปภาพ *
                  </label>
                  <input
                    name="imageUrl"
                    type="url"
                    required
                    defaultValue={editingPortfolio?.imageUrl ?? ""}
                    placeholder="https://..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>

                {/* รายละเอียด */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รายละเอียด (ไม่บังคับ)
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingPortfolio?.description ?? ""}
                    placeholder="คำอธิบายสั้นๆ เกี่ยวกับผลงานชิ้นนี้..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                  />
                </div>

                {/* สถานะ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    สถานะ
                  </label>
                  <select
                    name="published"
                    defaultValue={
                      editingPortfolio
                        ? String(editingPortfolio.published)
                        : "true"
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="true">🌍 เผยแพร่</option>
                    <option value="false">📁 ซ่อน (Draft)</option>
                  </select>
                </div>

                {modalError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
                    ⚠️ {modalError}
                  </div>
                )}
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                form="portfolio-form"
                disabled={isSaving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition"
              >
                {isSaving
                  ? "กำลังบันทึก..."
                  : editingPortfolio
                    ? "บันทึกการแก้ไข"
                    : "เพิ่มผลงาน"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          Modal: สร้างประเภทงาน
          ============================================================ */}
      {isCreatingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                📁 เพิ่มประเภทงาน
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <form
              id="category-form"
              onSubmit={handleCreateCategory}
              className="px-6 py-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อประเภท *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="เช่น: งาน Word"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL) *
                </label>
                <input
                  name="slug"
                  type="text"
                  required
                  placeholder="เช่น: word"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon (Emoji)
                </label>
                <input
                  name="icon"
                  type="text"
                  placeholder="เช่น: 📄"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              {modalError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
                  ⚠️ {modalError}
                </div>
              )}
            </form>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                form="category-form"
                disabled={isSaving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition"
              >
                {isSaving ? "กำลังบันทึก..." : "สร้างประเภทงาน"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          Modal: ยืนยันลบผลงาน
          ============================================================ */}
      {deletingPortfolioId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center space-y-4">
            <p className="text-4xl">🗑️</p>
            <h3 className="text-lg font-bold text-gray-800">
              ยืนยันการลบผลงาน
            </h3>
            <p className="text-sm text-gray-500">
              ผลงานจะถูกลบถาวร ไม่สามารถกู้คืนได้
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setDeletingPortfolioId(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeletePortfolio(deletingPortfolioId)}
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
