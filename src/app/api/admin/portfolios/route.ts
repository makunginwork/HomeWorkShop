import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";

// GET /api/admin/portfolios — ดึงผลงานทั้งหมด
export async function GET(req: NextRequest) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const portfolios = await prisma.portfolio.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { category: true },
    });
    return NextResponse.json(portfolios);
  } catch {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลผลงาน" },
      { status: 500 },
    );
  }
}

// POST /api/admin/portfolios — เพิ่มผลงานใหม่
export async function POST(req: NextRequest) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const { categoryId, title, description, imageUrl, published } =
      await req.json();

    if (!categoryId || !title?.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอก ประเภทงาน และ ชื่อผลงาน" },
        { status: 400 },
      );
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        categoryId,
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        published: published ?? true,
      },
      include: { category: true },
    });

    return NextResponse.json(portfolio, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเพิ่มผลงาน" },
      { status: 500 },
    );
  }
}
