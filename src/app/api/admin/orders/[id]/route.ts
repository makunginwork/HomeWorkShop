import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { verifyAdminToken } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // Next.js 15+ ต้องเป็น Promise
) {
  // ตรวจสอบ Token ก่อน — ถ้าไม่ผ่านจะ return 401 ทันที
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const { id } = await params; // await params ตามมาตรฐาน Next.js 15+/16
    const body = await req.json();
    const { status, fileLink } = body;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status, fileLink },
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลออเดอร์นี้ในระบบ" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตออเดอร์" },
      { status: 500 },
    );
  }
}
