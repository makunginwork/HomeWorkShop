import Link from "next/link";
import prisma from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | James Workspace",
  description: "บทความและความรู้จาก James Workspace",
};

// Server Component — ดึงข้อมูลตรงจาก Database ไม่ต้องผ่าน API
// Next.js จะ cache ผลลัพธ์นี้โดยอัตโนมัติ
async function getPublishedPosts() {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      createdAt: true,
      // ไม่ดึง content — ประหยัด memory และเร็วขึ้น
      content: false,
      published: false,
      updatedAt: false,
    },
  });
}

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  try {
    posts = await getPublishedPosts();
  } catch {
    // DB ไม่พร้อม
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Blog &amp; <span className="text-blue-600">บทความ</span>
          </h1>
          <p className="text-lg text-gray-600">
            ความรู้ เทคนิค และประสบการณ์จากการพัฒนาซอฟต์แวร์
          </p>
          <Link
            href="/"
            className="inline-block text-sm text-blue-600 hover:underline"
          >
            ← กลับหน้าหลัก
          </Link>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">📝</p>
              <p className="text-gray-500 text-lg">ยังไม่มีบทความในขณะนี้</p>
              <p className="text-gray-400 text-sm mt-2">
                กลับมาใหม่เร็วๆ นี้นะครับ!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {/* Cover Image */}
                  {post.coverImage ? (
                    <div className="aspect-video overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <span className="text-4xl">📄</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
