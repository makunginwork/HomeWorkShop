import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { verifyAdminToken } from "@/lib/auth";

// PUT /api/admin/portfolios/[id] — แก้ไขผลงาน
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const { categoryId, title, description, imageUrl, published } =
      await req.json();

    const updated = await prisma.portfolio.update({
      where: { id },
      data: {
        ...(categoryId !== undefined && { categoryId }),
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl.trim() }),
        ...(published !== undefined && { published }),
      },
      include: { category: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "ไม่พบผลงานนี้ในระบบ" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการแก้ไขผลงาน" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/portfolios/[id] — ลบผลงาน
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    await prisma.portfolio.delete({ where: { id } });
    return NextResponse.json({ message: "ลบผลงานสำเร็จ" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "ไม่พบผลงานนี้ในระบบ" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบผลงาน" },
      { status: 500 },
    );
  }
}
