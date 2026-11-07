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

  // Filter state
  const [filterCategoryId, setFilterCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

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
  // Client-Side Image Compression & Processing
  // ============================================================
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type === "image/svg+xml") {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Image Upload Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setModalError("");

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 15 * 1024 * 1024) {
          setModalError(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 15MB`);
          continue;
        }

        const compressedDataUrl = await compressImage(file);
        newUrls.push(compressedDataUrl);
      }

      if (newUrls.length > 0) {
        setPortfolioImages((prev) => [...prev, ...newUrls]);
      }
    } catch {
      setModalError("เกิดข้อผิดพลาดในการโหลดรูปภาพ");
    } finally {
      setIsUploading(false);
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

  // Filtered Portfolios
  const filteredPortfolios = portfolios.filter((p) => {
    const matchesCat =
      filterCategoryId === "all" || p.categoryId === filterCategoryId;
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-xs border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span>📸</span>
              <span>จัดการผลงานและรีวิวร้าน</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              เพิ่ม/แก้ไขรูปภาพผลงาน ใส่รูปได้หลายรูป, จัดการหมวดหมู่, และตรวจสอบรีวิวลูกค้า
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/admin/dashboard"
              className="text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium transition"
            >
              ← แดชบอร์ด
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition text-sm shadow-sm flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
            >
              <span>+</span>
              <span>{activeTab === "categories" ? "หมวดหมู่งานใหม่" : "เพิ่มผลงานใหม่"}</span>
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 bg-gray-200/60 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("portfolios")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
              activeTab === "portfolios"
                ? "bg-white text-blue-600 shadow-xs font-semibold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>📸 ผลงาน</span>
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-mono">
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
            <span>📁 หมวดหมู่งาน</span>
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-mono">
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
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-mono">
              {reviews.length}
            </span>
          </button>
        </div>

        {/* Filters for Portfolios */}
        {activeTab === "portfolios" && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 mr-1">หมวดหมู่:</span>
              <button
                onClick={() => setFilterCategoryId("all")}
                className={`text-xs px-3 py-1.5 rounded-lg transition font-medium ${
                  filterCategoryId === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                ทั้งหมด ({portfolios.length})
              </button>
              {categories.map((c) => {
                const count = portfolios.filter((p) => p.categoryId === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setFilterCategoryId(c.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1 ${
                      filterCategoryId === c.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span>{c.name}</span>
                    <span className="opacity-75 font-mono text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="ค้นหาชื่อผลงาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>
        )}

        {/* Content Box */}
        <div className="bg-white rounded-3xl shadow-xs border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center text-gray-400">
              <p className="text-4xl animate-bounce mb-3">⏳</p>
              <p className="text-sm">กำลังโหลดข้อมูล...</p>
            </div>
          ) : activeTab === "portfolios" ? (
            /* ===== Portfolio List ===== */
            filteredPortfolios.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-5xl mb-3">📂</p>
                <p className="text-gray-700 font-bold text-base">
                  {portfolios.length === 0
                    ? "ยังไม่มีผลงานในระบบ"
                    : "ไม่พบผลงานที่ตรงกับการค้นหา"}
                </p>
                <p className="text-gray-400 text-xs mt-1 max-w-sm mx-auto">
                  {portfolios.length === 0
                    ? "คลิกที่ปุ่ม \"+ เพิ่มผลงานใหม่\" ด้านบนเพื่อเริ่มลงผลงานของคุณได้ทันที"
                    : "ลองเปลี่ยนคำค้นหา หรือเลือกดูหมวดหมู่อื่น"}
                </p>
                {portfolios.length === 0 && (
                  <button
                    onClick={openCreatePortfolio}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-xl text-xs transition"
                  >
                    + เพิ่มผลงานชิ้นแรก
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-5 py-3.5">รูปหน้าปก</th>
                      <th className="px-5 py-3.5">ชื่อผลงาน</th>
                      <th className="px-5 py-3.5">หมวดหมู่</th>
                      <th className="px-5 py-3.5 text-center">จำนวนรูป</th>
                      <th className="px-5 py-3.5">สถานะ</th>
                      <th className="px-5 py-3.5 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredPortfolios.map((p) => {
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
                  ยังไม่มีหมวดหมู่งาน กด &ldquo;+ หมวดหมู่งานใหม่&rdquo; เพื่อสร้าง
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
                    หมวดหมู่งาน *
                  </label>
                  <select
                    name="categoryId"
                    required
                    defaultValue={editingPortfolio?.categoryId ?? ""}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="" disabled>
                      -- เลือกหมวดหมู่งาน --
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
                    placeholder="เช่น: รายงานการวิเคราะห์งบการเงิน หรือ แบบจำลอง CVP บน Excel"
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
                    rows={4}
                    defaultValue={editingPortfolio?.description ?? ""}
                    placeholder="พิมพ์รายละเอียดงาน โปรแกรมที่ใช้ สูตร หรือสาระสำคัญของงาน..."
                    className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-400 outline-none leading-relaxed"
                  />
                </div>

                {/* รูปภาพผลงาน (เลือกจากเครื่อง หรือ วาง URL) */}
                <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide">
                        รูปภาพผลงาน ({portfolioImages.length} รูป)
                      </label>
                      <p className="text-[11px] text-gray-500">
                        เลือกได้หลายรูปพร้อมกัน (รูปแรกจะเป็นรูปหน้าปก)
                      </p>
                    </div>
                  </div>

                  {/* ปุ่มเลือกไฟล์จากเครื่อง (ประมวลผลทันที) */}
                  <label className="flex items-center justify-center gap-2 cursor-pointer bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl px-4 py-3.5 transition text-center">
                    <span className="text-xl">📁</span>
                    <span className="text-sm font-medium text-gray-700">
                      {isUploading
                        ? "⏳ กำลังโหลดรูปภาพ..."
                        : "เลือกรูปจากเครื่อง (เลือกได้หลายไฟล์พร้อมกัน)"}
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

                  {/* หรือเพิ่ม URL รูปภาพ */}
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

                  {/* Visual Thumbnails */}
                  {portfolioImages.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-semibold text-gray-500 mb-2">
                        รูปภาพที่เลือก ({portfolioImages.length} รูป):
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
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 p-1">
                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveImageToCover(idx)}
                                  className="text-[10px] bg-white text-gray-800 px-2 py-0.5 rounded font-medium shadow"
                                >
                                  ตั้งเป็นปก
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="text-[10px] bg-red-600 text-white px-2.5 py-0.5 rounded font-medium shadow"
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
                    💡 หากไม่ได้ใส่รูป ระบบจะแสดงไอคอนของหมวดหมู่นั้นแทนโดยอัตโนมัติ
                  </p>
                </div>

                {/* สถานะเผยแพร่ */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    สถานะการแสดงผล
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

      {/* Modal: Category */}
      {(isCreatingCategory || editingCategory) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-800">
                {editingCategory
                  ? `✏️ แก้ไขหมวดหมู่: ${editingCategory.name}`
                  : "📁 หมวดหมู่งานใหม่"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={
                editingCategory ? handleUpdateCategory : handleCreateCategory
              }
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ชื่อหมวดหมู่ *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingCategory?.name ?? ""}
                  placeholder="เช่น: งานคำนวณและแบบจำลอง Excel"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Slug (URL ภาษาอังกฤษ) *
                </label>
                <input
                  name="slug"
                  type="text"
                  required
                  defaultValue={editingCategory?.slug ?? ""}
                  placeholder="เช่น: excel-models"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Icon (Emoji หรือข้อความ)
                </label>
                <input
                  name="icon"
                  type="text"
                  defaultValue={editingCategory?.icon ?? ""}
                  placeholder="เช่น: 📗 หรือ 📊"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              {modalError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl p-3">
                  ⚠️ {modalError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-200 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 disabled:opacity-60 transition"
                >
                  {isSaving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation: Portfolio */}
      {deletingPortfolioId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg">ยืนยันการลบผลงาน?</h3>
            <p className="text-sm text-gray-600">
              เมื่อลบแล้วรูปภาพและข้อมูลของผลงานนี้จะไม่สามารถกู้คืนได้
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingPortfolioId(null)}
                className="px-4 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeletePortfolio(deletingPortfolioId)}
                className="px-4 py-2 text-xs font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation: Category */}
      {deletingCategoryId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg">ยืนยันการลบหมวดหมู่?</h3>
            <p className="text-sm text-gray-600">
              ผลงานทั้งหมดที่อยู่ในหมวดหมู่นี้จะถูกลบไปด้วย
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingCategoryId(null)}
                className="px-4 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeleteCategory(deletingCategoryId)}
                className="px-4 py-2 text-xs font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation: Review */}
      {deletingReviewId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg">ยืนยันการลบรีวิว?</h3>
            <p className="text-sm text-gray-600">
              ต้องการลบรีวิวนี้ออกจากระบบใช่หรือไม่?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingReviewId(null)}
                className="px-4 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeleteReview(deletingReviewId)}
                className="px-4 py-2 text-xs font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
