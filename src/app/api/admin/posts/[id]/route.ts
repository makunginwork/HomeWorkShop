import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { verifyAdminToken } from "@/lib/auth";
import type { UpdatePostPayload } from "@/types";

// PUT /api/admin/posts/[id] — แก้ไขบทความ
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // Next.js 16: params เป็น Promise
) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const { id } = await params; // await params ตามมาตรฐาน Next.js 15+/16
    const body: UpdatePostPayload = await req.json();
    const { title, slug, content, published, coverImage } = body;

    // ถ้ามีการส่ง slug ใหม่มา ให้ตรวจสอบว่าซ้ำกับบทความอื่นหรือไม่
    if (slug) {
      const existing = await prisma.post.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json(
          { error: `Slug "${slug}" ถูกใช้งานโดยบทความอื่นแล้ว` },
          { status: 409 },
        );
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(slug !== undefined && { slug: slug.trim().toLowerCase() }),
        ...(content !== undefined && { content: content.trim() }),
        ...(published !== undefined && { published }),
        ...(coverImage !== undefined && {
          coverImage: coverImage?.trim() || null,
        }),
      },
    });

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "ไม่พบบทความนี้ในระบบ" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการแก้ไขบทความ" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/posts/[id] — ลบบทความ
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // Next.js 16: params เป็น Promise
) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const { id } = await params; // await params ตามมาตรฐาน Next.js 15+/16

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ message: "ลบบทความสำเร็จ" }, { status: 200 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "ไม่พบบทความนี้ในระบบ" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบบทความ" },
      { status: 500 },
    );
  }
}
