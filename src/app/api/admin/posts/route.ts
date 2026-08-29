import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";
import type { CreatePostPayload } from "@/types";

// GET /api/admin/posts — ดึงบทความทั้งหมด (ทั้ง published และ draft)
export async function GET(req: NextRequest) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        coverImage: true,
        createdAt: true,
        updatedAt: true,
        // ไม่ดึง content มาเพื่อประหยัด bandwidth ในหน้า listing
        content: false,
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลบทความ" },
      { status: 500 },
    );
  }
}

// POST /api/admin/posts — สร้างบทความใหม่
export async function POST(req: NextRequest) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const body: CreatePostPayload = await req.json();
    const { title, slug, content, published, coverImage } = body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!title?.trim() || !slug?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอก title, slug และ content ให้ครบถ้วน" },
        { status: 400 },
      );
    }

    // ตรวจสอบว่า slug ซ้ำหรือไม่
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: `Slug "${slug}" ถูกใช้งานแล้ว กรุณาเลือก slug อื่น` },
        { status: 409 },
      );
    }

    const newPost = await prisma.post.create({
      data: {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        content: content.trim(),
        published: published ?? false,
        coverImage: coverImage?.trim() || null,
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างบทความ" },
      { status: 500 },
    );
  }
}
