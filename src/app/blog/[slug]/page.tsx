import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import type { Metadata } from "next";

// ============================================================
// generateMetadata — SEO แบบ Dynamic ต่อบทความ
// ============================================================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>; // Next.js 16: params เป็น Promise
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    select: { title: true, content: true },
  });

  if (!post) {
    return { title: "ไม่พบบทความ | James Workspace" };
  }

  return {
    title: `${post.title} | James Workspace`,
    description: post.content.slice(0, 160).replace(/\n/g, " "),
    openGraph: {
      title: post.title,
      description: post.content.slice(0, 160).replace(/\n/g, " "),
    },
  };
}

// ============================================================
// generateStaticParams — Pre-render ทุก slug ที่ published ไว้ล่วงหน้า
// ============================================================
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return posts.map((post) => ({ slug: post.slug }));
}

// ============================================================
// Page Component
// ============================================================
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>; // Next.js 16: params เป็น Promise
}) {
  const { slug } = await params; // await params ตามมาตรฐาน Next.js 15+/16

  const post = await prisma.post.findUnique({
    where: { slug, published: true },
  });

  // ถ้าไม่พบบทความหรือยังไม่ได้ publish → แสดงหน้า 404
  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Cover Image */}
      {post.coverImage && (
        <div className="w-full max-h-96 overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-8"
        >
          ← กลับไปหน้ารายการบทความ
        </Link>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <p className="text-sm text-gray-400 mb-8">
          เผยแพร่เมื่อ{" "}
          {new Date(post.createdAt).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {post.updatedAt !== post.createdAt && (
            <span>
              {" "}
              · แก้ไขล่าสุด{" "}
              {new Date(post.updatedAt).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
        </p>

        {/* Divider */}
        <hr className="border-gray-100 mb-8" />

        {/* Content — แสดงเป็น plain text พร้อม whitespace-pre-wrap */}
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
            {post.content}
          </p>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        <p>
          © {new Date().getFullYear()} James Workspace. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
