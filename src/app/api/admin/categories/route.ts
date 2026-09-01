import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";

// GET /api/admin/categories — ดึงประเภทงานทั้งหมด (พร้อมจำนวนผลงาน)
export async function GET(req: NextRequest) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { portfolios: true } } },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทงาน" },
      { status: 500 },
    );
  }
}

// POST /api/admin/categories — สร้างประเภทงานใหม่
export async function POST(req: NextRequest) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const { name, slug, icon, sortOrder } = await req.json();

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อประเภทงานและ slug" },
        { status: 400 },
      );
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: `Slug "${slug}" ถูกใช้งานแล้ว` },
        { status: 409 },
      );
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        icon: icon || null,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างประเภทงาน" },
      { status: 500 },
    );
  }
}
