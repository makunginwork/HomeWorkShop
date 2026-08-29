"use client";
import { useState, useEffect, useCallback } from "react";
import type { Post, CreatePostPayload, UpdatePostPayload } from "@/types";

// ============================================================
// Sub-component: Badge สถานะบทความ
// ============================================================
function StatusBadge({ published }: { published: boolean }) {
  return published ? (
    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
      เผยแพร่แล้ว
    </span>
  ) : (
    <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 font-medium">
      Draft
    </span>
  );
}

// ============================================================
// ประเภทข้อมูลที่ใช้ใน listing (ไม่มี content)
// ============================================================
type PostListItem = Omit<Post, "content">;

// ============================================================
// Main Component
// ============================================================
export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State สำหรับ Modal — null = ปิด, "create" = สร้างใหม่, Post = แก้ไข
  const [modalMode, setModalMode] = useState<"create" | PostListItem | null>(null);

  // State สำหรับ Delete Confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // State สำหรับ error ใน Modal
  const [modalError, setModalError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ============================================================
  // Fetch Posts
  // ============================================================
  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/posts");
      if (!res.ok) throw new Error("ดึงข้อมูลไม่สำเร็จ");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ============================================================
  // สร้างบทความใหม่
  // ============================================================
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalError("");
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const payload: CreatePostPayload = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      content: formData.get("content") as string,
      published: formData.get("published") === "true",
      coverImage: (formData.get("coverImage") as string) || undefined,
    };

    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setModalError(data.error || "เกิดข้อผิดพลาดในการสร้างบทความ");
        return;
      }

      setModalMode(null);
      await fetchPosts();
    } catch {
      setModalError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // แก้ไขบทความ
  // ============================================================
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (typeof modalMode !== "object" || modalMode === null || modalMode === "create") return;

    setModalError("");
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const payload: UpdatePostPayload = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      content: formData.get("content") as string,
      published: formData.get("published") === "true",
      coverImage: (formData.get("coverImage") as string) || undefined,
    };

    try {
      const res = await fetch(`/api/admin/posts/${modalMode.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setModalError(data.error || "เกิดข้อผิดพลาดในการแก้ไขบทความ");
        return;
      }

      setModalMode(null);
      await fetchPosts();
    } catch {
      setModalError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // ลบบทความ
  // ============================================================
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "เกิดข้อผิดพลาดในการลบบทความ");
        return;
      }
      setDeletingId(null);
      await fetchPosts();
    } catch {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  // ============================================================
  // Helper: สร้าง slug อัตโนมัติจาก title
  // ============================================================
  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/[^\w-]/g, "")
      .replace(/--+/g, "-");

  const isEditMode = typeof modalMode === "object" && modalMode !== null && modalMode !== "create";
  const editingPost = isEditMode ? (modalMode as PostListItem) : null;

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <header className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">จัดการบทความ Blog</h1>
            <p className="text-sm text-gray-500 mt-1">
              <a href="/admin/dashboard" className="text-blue-600 hover:underline">
                ← กลับ Dashboard
              </a>
            </p>
          </div>
          <button
            onClick={() => { setModalMode("create"); setModalError(""); }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition text-sm"
          >
            + เขียนบทความใหม่
          </button>
        </header>

        {/* Posts Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-lg">กำลังโหลด...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">📝</p>
              <p className="text-gray-500">ยังไม่มีบทความ กด &ldquo;เขียนบทความใหม่&rdquo; เพื่อเริ่มต้น</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600">ชื่อบทความ</th>
                    <th className="p-4 font-semibold text-gray-600">Slug</th>
                    <th className="p-4 font-semibold text-gray-600">สถานะ</th>
                    <th className="p-4 font-semibold text-gray-600">วันที่สร้าง</th>
                    <th className="p-4 font-semibold text-gray-600 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                        <span className="font-medium text-gray-800 line-clamp-1">
                          {post.title}
                        </span>
                      </td>
                      <td className="p-4">
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 hover:underline font-mono text-xs"
                        >
                          /blog/{post.slug}
                        </a>
                      </td>
                      <td className="p-4">
                        <StatusBadge published={post.published} />
                      </td>
                      <td className="p-4 text-gray-400 text-xs">
                        {new Date(post.createdAt).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setModalMode(post); setModalError(""); }}
                            className="text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => setDeletingId(post.id)}
                            className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                          >
                            ลบ
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

      {/* ============================================================
          Modal: สร้าง / แก้ไขบทความ
          ============================================================ */}
      {modalMode !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {isEditMode ? `แก้ไข: ${editingPost?.title}` : "✏️ เขียนบทความใหม่"}
              </h2>
              <button
                onClick={() => setModalMode(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <form
                id="post-form"
                onSubmit={isEditMode ? handleUpdate : handleCreate}
                className="space-y-4"
              >
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อบทความ <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    type="text"
                    required
                    defaultValue={editingPost?.title ?? ""}
                    placeholder="เช่น: แนะนำ Next.js App Router"
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => {
                      // Auto-fill slug เฉพาะตอนสร้างใหม่
                      if (!isEditMode) {
                        const slugInput = document.querySelector<HTMLInputElement>('input[name="slug"]');
                        if (slugInput) slugInput.value = generateSlug(e.target.value);
                      }
                    }}
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (URL) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 whitespace-nowrap">/blog/</span>
                    <input
                      name="slug"
                      type="text"
                      required
                      defaultValue={editingPost?.slug ?? ""}
                      placeholder="nextjs-app-router"
                      className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Cover Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL รูปปก (ไม่บังคับ)
                  </label>
                  <input
                    name="coverImage"
                    type="url"
                    defaultValue={editingPost?.coverImage ?? ""}
                    placeholder="https://..."
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เนื้อหาบทความ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="content"
                    required
                    rows={10}
                    defaultValue={editingPost ? "" : ""}
                    placeholder="เขียนเนื้อหาบทความที่นี่..."
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                  {isEditMode && (
                    <p className="text-xs text-gray-400 mt-1">
                      * ช่องนี้จะเริ่มว่าง กรุณากรอกเนื้อหาที่ต้องการแก้ไข
                    </p>
                  )}
                </div>

                {/* Published Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    สถานะการเผยแพร่
                  </label>
                  <select
                    name="published"
                    defaultValue={editingPost ? String(editingPost.published) : "false"}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="false">📁 Draft (ยังไม่เผยแพร่)</option>
                    <option value="true">🌍 เผยแพร่ทันที</option>
                  </select>
                </div>

                {/* Error Message */}
                {modalError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                    ⚠️ {modalError}
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                form="post-form"
                disabled={isSaving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition"
              >
                {isSaving ? "กำลังบันทึก..." : isEditMode ? "บันทึกการแก้ไข" : "เผยแพร่บทความ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          Modal: ยืนยันการลบ
          ============================================================ */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center space-y-4">
            <p className="text-4xl">🗑️</p>
            <h3 className="text-lg font-bold text-gray-800">ยืนยันการลบบทความ</h3>
            <p className="text-sm text-gray-500">
              บทความจะถูกลบออกจากระบบถาวร ไม่สามารถกู้คืนได้
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
