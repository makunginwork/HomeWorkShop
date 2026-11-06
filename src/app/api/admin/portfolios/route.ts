import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/portfolios — ดึงผลงานทั้งหมดพร้อมรูปภาพ
export async function GET(req: NextRequest) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const portfolios = await prisma.portfolio.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    });
    return NextResponse.json(portfolios);
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลผลงาน" },
      { status: 500 }
    );
  }
}

// POST /api/admin/portfolios — เพิ่มผลงานใหม่ (รองรับหลายรูปภาพ)
export async function POST(req: NextRequest) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { categoryId, title, description, imageUrl, published, images } = body;

    if (!categoryId || !title?.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอก ประเภทงาน และ ชื่อผลงาน" },
        { status: 400 }
      );
    }

    const imageList: string[] = Array.isArray(images)
      ? images.filter((img) => typeof img === "string" && img.trim())
      : imageUrl?.trim()
      ? [imageUrl.trim()]
      : [];

    const coverUrl = imageUrl?.trim() || (imageList.length > 0 ? imageList[0] : null);

    const portfolio = await prisma.portfolio.create({
      data: {
        categoryId,
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl: coverUrl,
        published: published ?? true,
        images: {
          create: imageList.map((imgUrl, idx) => ({
            imageUrl: imgUrl,
            sortOrder: idx,
          })),
        },
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    console.error("Error creating portfolio:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเพิ่มผลงาน" },
      { status: 500 }
    );
  }
}
