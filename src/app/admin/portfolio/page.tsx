"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PortfolioWithCategory,
  CategoryWithCount,
  CreateCategoryPayload,
  Review,
} from "@/types";

export default function AdminPortfolioPage() {
  const [portfolios, setPortfolios] = useState<PortfolioWithCategory[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tabs: 'portfolios' | 'categories' | 'reviews'
  const [activeTab, setActiveTab] = useState<
    "portfolios" | "categories" | "reviews"
  >("portfolios");

  // Modal: Portfolio
  const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);
  const [editingPortfolio, setEditingPortfolio] =
    useState<PortfolioWithCategory | null>(null);

  // Multiple Images State for current portfolio modal
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Modal: Category
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithCount | null>(null);

  // Delete confirms
  const [deletingPortfolioId, setDeletingPortfolioId] = useState<string | null>(
    null
  );
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null
  );
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  // Modal error & saving state
  const [modalError, setModalError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isPortfolioModalOpen = isCreatingPortfolio || editingPortfolio !== null;

  // ============================================================
  // Fetch Data
  // ============================================================
  const fetchAll = useCallback(async () => {
    try {
      const [portRes, catRes, revRes] = await Promise.all([
        fetch("/api/admin/portfolios"),
        fetch("/api/admin/categories"),
        fetch("/api/admin/reviews"),
      ]);
      if (portRes.ok) setPortfolios(await portRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (revRes.ok) setReviews(await revRes.json());
    } catch {
      console.error("Failed to fetch admin data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // When opening edit portfolio modal, sync images
  const openEditPortfolio = (p: PortfolioWithCategory) => {
    setEditingPortfolio(p);
    const existingImgs =
      p.images && p.images.length > 0
        ? p.images.map((img) => img.imageUrl)
        : p.imageUrl
        ? [p.imageUrl]
        : [];
    setPortfolioImages(existingImgs);
    setCustomImageUrl("");
    setModalError("");
  };

  const openCreatePortfolio = () => {
    setIsCreatingPortfolio(true);
    setEditingPortfolio(null);
    setPortfolioImages([]);
    setCustomImageUrl("");
    setModalError("");
  };

  const closeModal = () => {
    setIsCreatingPortfolio(false);
    setEditingPortfolio(null);
    setIsCreatingCategory(false);
    setEditingCategory(null);
    setPortfolioImages([]);
    setCustomImageUrl("");
    setModalError("");
  };

  // ============================================================
  // Image Handlers (Multiple Images)
  // ============================================================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setModalError("");

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          setModalError(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 5MB`);
          continue;
        }

        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) newUrls.push(data.url);
        } else {
          const err = await res.json();
          setModalError(err.error || `อัปโหลด ${file.name} ไม่สำเร็จ`);
        }
      }

      if (newUrls.length > 0) {
        setPortfolioImages((prev) => [...prev, ...newUrls]);
      }
    } catch {
      setModalError("เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
    } finally {
      setIsUploading(false);
      // Reset input value so same files can be re-selected if needed
      e.target.value = "";
    }
  };

  const addCustomImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setPortfolioImages((prev) => [...prev, customImageUrl.trim()]);
    setCustomImageUrl("");
  };

  const removeImage = (indexToRemove: number) => {
    setPortfolioImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const moveImageToCover = (indexToMove: number) => {
    setPortfolioImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(indexToMove, 1);
      copy.unshift(item);
      return copy;
    });
  };

  // ============================================================
  // Portfolio CRUD
  // ============================================================
  const handleCreatePortfolio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalError("");
    setIsSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      categoryId: fd.get("categoryId") as string,
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || undefined,
      imageUrl: portfolioImages.length > 0 ? portfolioImages[0] : undefined,
      images: portfolioImages,
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
    const payload = {
      categoryId: fd.get("categoryId") as string,
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || undefined,
      imageUrl: portfolioImages.length > 0 ? portfolioImages[0] : null,
      images: portfolioImages,
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
  // Category CRUD
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

  const handleUpdateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCategory) return;
    setModalError("");
    setIsSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      slug: fd.get("slug") as string,
      icon: (fd.get("icon") as string) || null,
    };

    try {
      const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setModalError((await res.json()).error || "ไม่สามารถแก้ไขได้");
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

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert((await res.json()).error || "ลบไม่สำเร็จ");
        return;
      }
      setDeletingCategoryId(null);
      await fetchAll();
    } catch {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  // ============================================================
  // Review Moderation (Toggle Visible & Delete)
  // ============================================================
  const handleToggleReviewVisible = async (review: Review) => {
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !review.visible }),
      });
      if (res.ok) {
        await fetchAll();
      } else {
        alert("ไม่สามารถเปลี่ยนสถานะรีวิวได้");
      }
    } catch {
      alert("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeletingReviewId(null);
        await fetchAll();
      } else {
        alert("ไม่สามารถลบรีวิวได้");
      }
    } catch {
      alert("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    }
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span>📸</span>
              <span>จัดการผลงานและรีวิวร้าน</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              เพิ่ม/แก้ไขรูปภาพหลายรูป (แบบ IG), จัดการหมวดหมู่งาน, และตรวจสอบรีวิวลูกค้า
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium transition"
            >
              ← จัดการออเดอร์
            </Link>
            <button
              onClick={
                activeTab === "categories"
                  ? () => {
                      setIsCreatingCategory(true);
                      setModalError("");
                    }
                  : openCreatePortfolio
              }
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition text-sm shadow-sm"
            >
              {activeTab === "categories" ? "+ ประเภทงานใหม่" : "+ เพิ่มผลงานใหม่"}
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl w-fit border border-gray-200/50">
          <button
            onClick={() => setActiveTab("portfolios")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
              activeTab === "portfolios"
                ? "bg-white text-blue-600 shadow-xs font-semibold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>📸 ผลงาน</span>
            <span className="bg-gray-200/80 text-gray-700 text-xs px-2 py-0.5 rounded-full">
              {portfolios.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
              activeTab === "categories"
                ? "bg-white text-blue-600 shadow-xs font-semibold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>📁 ประเภทงาน</span>
            <span className="bg-gray-200/80 text-gray-700 text-xs px-2 py-0.5 rounded-full">
              {categories.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
              activeTab === "reviews"
                ? "bg-white text-blue-600 shadow-xs font-semibold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>💬 รีวิวลูกค้า</span>
            <span className="bg-gray-200/80 text-gray-700 text-xs px-2 py-0.5 rounded-full">
              {reviews.length}
            </span>
          </button>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center text-gray-400">
              <p className="text-4xl animate-bounce mb-3">⏳</p>
              <p className="text-sm">กำลังโหลดข้อมูล...</p>
            </div>
          ) : activeTab === "portfolios" ? (
            /* ===== Portfolio List ===== */
            portfolios.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-5xl mb-3">📂</p>
                <p className="text-gray-600 font-medium text-base">ยังไม่มีผลงานในระบบ</p>
                <p className="text-gray-400 text-xs mt-1">
                  กดปุ่ม &ldquo;+ เพิ่มผลงานใหม่&rdquo; ด้านบนเพื่อเริ่มลงผลงาน
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-5 py-3.5">รูปตัวอย่าง</th>
                      <th className="px-5 py-3.5">ชื่อผลงาน</th>
                      <th className="px-5 py-3.5">ประเภทงาน</th>
                      <th className="px-5 py-3.5 text-center">จำนวนรูป</th>
                      <th className="px-5 py-3.5">สถานะ</th>
                      <th className="px-5 py-3.5 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {portfolios.map((p) => {
                      const imgCount =
                        p.images && p.images.length > 0
                          ? p.images.length
                          : p.imageUrl
                          ? 1
                          : 0;

                      return (
                        <tr key={p.id} className="hover:bg-gray-50/70 transition">
                          <td className="px-5 py-3.5">
                            {p.imageUrl ? (
                              <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={p.imageUrl}
                                  alt={p.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl border border-gray-200">
                                {p.category?.icon || "📁"}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-gray-800 max-w-sm">
                            <span className="line-clamp-1">{p.title}</span>
                            {p.description && (
                              <span className="line-clamp-1 text-xs text-gray-400 font-normal mt-0.5">
                                {p.description}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-700 font-medium">
                              <span>{p.category?.icon}</span>
                              <span>{p.category?.name}</span>
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full font-mono">
                              📷 {imgCount} รูป
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                p.published
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {p.published ? "✓ เผยแพร่" : "ซ่อน"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditPortfolio(p)}
                                className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-medium transition"
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === "categories" ? (
            /* ===== Category List ===== */
            categories.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-4xl mb-3">📁</p>
                <p className="text-gray-500">
                  ยังไม่มีประเภทงาน กด &ldquo;+ ประเภทงานใหม่&rdquo; เพื่อสร้าง
                </p>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{cat.icon || "📁"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate">
                          {cat.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          slug: /{cat.slug} · {cat._count.portfolios} ผลงาน
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setModalError("");
                        }}
                        className="flex-1 text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                      >
                        ✏️ แก้ไข
                      </button>
                      <button
                        onClick={() => setDeletingCategoryId(cat.id)}
                        className="text-red-600 bg-white hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                      >
                        🗑️ ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* ===== Reviews Moderation ===== */
            reviews.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-gray-500">ยังไม่มีรีวิวจากลูกค้า</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-5 py-3.5">ผู้รีวิว</th>
                      <th className="px-5 py-3.5">คะแนน</th>
                      <th className="px-5 py-3.5">ข้อความรีวิว</th>
                      <th className="px-5 py-3.5">วันที่</th>
                      <th className="px-5 py-3.5">สถานะ</th>
                      <th className="px-5 py-3.5 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reviews.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/70 transition">
                        <td className="px-5 py-3.5 font-semibold text-gray-800">
                          {r.authorName}
                          {r.lineUid && (
                            <span className="block text-[11px] text-gray-400 font-mono font-normal">
                              UID: {r.lineUid}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-amber-500 text-sm">
                            {"★★★★★".slice(0, r.rating)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 max-w-md">
                          <p className="line-clamp-2">{r.comment}</p>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString("th-TH")}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              r.visible
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-600 border border-red-200"
                            }`}
                          >
                            {r.visible ? "✓ เปิดแสดง" : "ซ่อนอยู่"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleToggleReviewVisible(r)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                r.visible
                                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                  : "bg-green-50 text-green-700 hover:bg-green-100"
                              }`}
                            >
                              {r.visible ? "🙈 ซ่อนรีวิว" : "👁️ แสดงรีวิว"}
                            </button>
                            <button
                              onClick={() => setDeletingReviewId(r.id)}
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
          )}
        </div>
      </div>

      {/* ============================================================
          Modal: สร้าง/แก้ไข Portfolio (รองรับหลายรูปภาพ)
          ============================================================ */}
      {isPortfolioModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800">
                {editingPortfolio
                  ? `✏️ แก้ไขผลงาน: ${editingPortfolio.title}`
                  : "📸 เพิ่มผลงานใหม่"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5">
              <form
                id="portfolio-form"
                onSubmit={
                  editingPortfolio
                    ? handleUpdatePortfolio
                    : handleCreatePortfolio
                }
                className="space-y-4"
              >
                {/* หมวดหมู่งาน */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    ประเภทงาน *
                  </label>
                  <select
                    name="categoryId"
                    required
                    defaultValue={editingPortfolio?.categoryId ?? ""}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="" disabled>
                      -- เลือกประเภทงาน --
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon || "📁"} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ชื่อผลงาน */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    ชื่อผลงาน *
                  </label>
                  <input
                    name="title"
                    type="text"
                    required
                    defaultValue={editingPortfolio?.title ?? ""}
                    placeholder="เช่น: รายงานการวิเคราะห์งบการเงิน ประจำปี 2569"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>

                {/* รายละเอียดผลงาน */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    รายละเอียดผลงาน
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingPortfolio?.description ?? ""}
                    placeholder="อธิบายเครื่องมือที่ใช้ ขอบเขตงาน หรือผลลัพธ์..."
                    className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-400 outline-none leading-relaxed"
                  />
                </div>

                {/* รูปภาพผลงาน (รองรับหลายรูปภาพ) */}
                <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide">
                        รูปภาพผลงาน ({portfolioImages.length} รูป)
                      </label>
                      <p className="text-[11px] text-gray-500">
                        อัปโหลดได้หลายรูปสำหรับสไลด์ดูรูปซ้าย-ขวาแบบ IG (รูปแรกคือรูปหน้าปก)
                      </p>
                    </div>
                  </div>

                  {/* ปุ่มเลือกไฟล์จากเครื่อง (รองรับเลือกทีละหลายไฟล์) */}
                  <label className="flex items-center justify-center gap-2 cursor-pointer bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl px-4 py-3 transition text-center">
                    <span className="text-xl">📁</span>
                    <span className="text-sm font-medium text-gray-700">
                      {isUploading
                        ? "⏳ กำลังอัปโหลดรูปภาพ..."
                        : "เลือกรูปจากเครื่อง (เลือกได้หลายไฟล์)..."}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploading}
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>

                  {/* หรือเพิ่ม URL รูปภาพโดยตรง */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="หรือวาง URL รูป เช่น https://..."
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={addCustomImageUrl}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-semibold transition"
                    >
                      + เพิ่ม URL
                    </button>
                  </div>

                  {/* Thumbnail Previews with Cover Badge and Remove Button */}
                  {portfolioImages.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-semibold text-gray-500 mb-2">
                        รูปภาพที่จะบันทึก (คลิก &ldquo;ตั้งเป็นหน้าปก&rdquo; เพื่อสลับลำดับ):
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
                        {portfolioImages.map((url, idx) => (
                          <div
                            key={idx}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-white group shadow-xs ${
                              idx === 0
                                ? "border-blue-600 ring-2 ring-blue-100"
                                : "border-gray-200"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt={`preview-${idx}`}
                              className="w-full h-full object-cover"
                            />
                            {idx === 0 && (
                              <span className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                                หน้าปก
                              </span>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 p-1">
                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveImageToCover(idx)}
                                  className="text-[10px] bg-white text-gray-800 px-1.5 py-0.5 rounded font-medium shadow"
                                >
                                  ตั้งเป็นปก
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-medium shadow"
                              >
                                ลบ ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-gray-400">
                    💡 หากไม่ใส่รูปภาพ ระบบจะใช้ icon ของประเภทงานแสดงเป็นภาพแทนโดยอัตโนมัติ
                  </p>
                </div>

                {/* สถานะเผยแพร่ */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    สถานะการเผยแพร่
                  </label>
                  <select
                    name="published"
                    defaultValue={
                      editingPortfolio
                        ? editingPortfolio.published
                          ? "true"
                          : "false"
                        : "true"
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="true">✓ เผยแพร่ทันที (แสดงบนเว็บ)</option>
                    <option value="false">ซ่อนไว้ก่อน (แบบร่าง)</option>
                  </select>
                </div>

                {modalError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl p-3">
                    ⚠️ {modalError}
                  </div>
                )}
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                form="portfolio-form"
                disabled={isSaving || isUploading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition shadow-sm"
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
          Modal: สร้าง/แก้ไข ประเภทงาน
          ============================================================ */}
      {(isCreatingCategory || editingCategory) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-800">
                {editingCategory
                  ? `✏️ แก้ไข: ${editingCategory.name}`
                  : "📁 เพิ่มประเภทงานใหม่"}
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
              onSubmit={
                editingCategory ? handleUpdateCategory : handleCreateCategory
              }
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  ชื่อประเภทงาน *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="เช่น: การบัญชีและการเงิน"
                  defaultValue={editingCategory?.name ?? ""}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Slug (URL) *
                </label>
                <input
                  name="slug"
                  type="text"
                  required
                  placeholder="เช่น: accounting"
                  defaultValue={editingCategory?.slug ?? ""}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Icon (Emoji)
                </label>
                <input
                  name="icon"
                  type="text"
                  placeholder="เช่น: 📊"
                  defaultValue={editingCategory?.icon ?? ""}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              {modalError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl p-3">
                  ⚠️ {modalError}
                </div>
              )}
            </form>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                form="category-form"
                disabled={isSaving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition shadow-sm"
              >
                {isSaving
                  ? "กำลังบันทึก..."
                  : editingCategory
                  ? "บันทึกการแก้ไข"
                  : "สร้างประเภทงาน"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          Modal: ยืนยันลบผลงาน
          ============================================================ */}
      {deletingPortfolioId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <p className="text-4xl">🗑️</p>
            <h3 className="text-lg font-bold text-gray-800">ยืนยันการลบผลงาน</h3>
            <p className="text-xs text-gray-500">
              ผลงานและรูปภาพทั้งหมดในรายการนี้จะถูกลบถาวร ไม่สามารถกู้คืนได้
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
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
              >
                ยืนยัน ลบเลย
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          Modal: ยืนยันลบประเภทงาน
          ============================================================ */}
      {deletingCategoryId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <p className="text-4xl">📁</p>
            <h3 className="text-lg font-bold text-gray-800">
              ยืนยันการลบประเภทงาน
            </h3>
            <p className="text-xs text-gray-500">
              หากยังมีผลงานอยู่ในประเภทนี้ ระบบจะป้องกันไม่ให้ลบเพื่อรักษาข้อมูล
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setDeletingCategoryId(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeleteCategory(deletingCategoryId)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
              >
                ยืนยัน ลบเลย
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          Modal: ยืนยันลบรีวิว
          ============================================================ */}
      {deletingReviewId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <p className="text-4xl">💬</p>
            <h3 className="text-lg font-bold text-gray-800">ยืนยันการลบรีวิว</h3>
            <p className="text-xs text-gray-500">
              รีวิวนี้จะถูกลบออกจากระบบอย่างถาวร (สำหรับจัดการสแปม/ปั่นรีวิว)
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setDeletingReviewId(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeleteReview(deletingReviewId)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
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
