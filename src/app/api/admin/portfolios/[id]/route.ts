import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { verifyAdminToken } from "@/lib/auth";

// PUT /api/admin/portfolios/[id] — แก้ไขผลงาน (รองรับหลายรูปภาพ)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();
    const { categoryId, title, description, imageUrl, published, images } = body;

    // ตรวจสอบรูปภาพ
    let imageList: string[] | undefined = undefined;
    if (Array.isArray(images)) {
      imageList = images.filter((img) => typeof img === "string" && img.trim());
    }

    const coverUrl =
      imageUrl !== undefined
        ? imageUrl?.trim() || (imageList && imageList.length > 0 ? imageList[0] : null)
        : undefined;

    const updated = await prisma.portfolio.update({
      where: { id },
      data: {
        ...(categoryId !== undefined && { categoryId }),
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
        ...(coverUrl !== undefined && { imageUrl: coverUrl }),
        ...(published !== undefined && { published }),
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    // ถ้ามีการส่ง images เข้ามา ให้ sync portfolioImage
    if (imageList !== undefined) {
      await prisma.portfolioImage.deleteMany({ where: { portfolioId: id } });
      if (imageList.length > 0) {
        await prisma.portfolioImage.createMany({
          data: imageList.map((imgUrl, idx) => ({
            portfolioId: id,
            imageUrl: imgUrl,
            sortOrder: idx,
          })),
        });
      }
    }

    const finalPortfolio = await prisma.portfolio.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json(finalPortfolio || updated);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "ไม่พบผลงานนี้ในระบบ" },
        { status: 404 }
      );
    }
    console.error("Error updating portfolio:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการแก้ไขผลงาน" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/portfolios/[id] — ลบผลงาน
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
        { status: 404 }
      );
    }
    console.error("Error deleting portfolio:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบผลงาน" },
      { status: 500 }
    );
  }
}
