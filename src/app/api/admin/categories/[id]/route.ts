import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { verifyAdminToken } from "@/lib/auth";

// PUT /api/admin/categories/[id] — แก้ไขประเภทงาน
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const { name, slug, icon, sortOrder } = await req.json();

    // ตรวจสอบ slug ซ้ำ (ยกเว้นตัวเอง)
    if (slug) {
      const existing = await prisma.category.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json(
          { error: `Slug "${slug}" ถูกใช้งานแล้ว` },
          { status: 409 },
        );
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(slug !== undefined && { slug: slug.trim().toLowerCase() }),
        ...(icon !== undefined && { icon: icon || null }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "ไม่พบประเภทงานนี้" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการแก้ไข" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/categories/[id] — ลบประเภทงาน
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "ลบประเภทงานสำเร็จ" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "ไม่พบประเภทงานนี้" }, { status: 404 });
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { error: "ไม่สามารถลบได้ เพราะยังมีผลงานอยู่ในประเภทนี้" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบ" },
      { status: 500 },
    );
  }
}
