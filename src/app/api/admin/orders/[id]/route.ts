import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { verifyAdminToken } from "@/lib/auth";

// PUT /api/admin/orders/[id] — อัปเดตสถานะ, ลิงก์ไฟล์, และกำหนดส่ง
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, fileLink, dueDate } = body;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        fileLink,
        // อัปเดต dueDate ด้วย — null = ล้างค่า, undefined = ไม่แตะ
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
      },
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

// DELETE /api/admin/orders/[id] — ลบออเดอร์
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const { id } = await params;

    await prisma.order.delete({ where: { id } });

    return NextResponse.json({ message: "ลบออเดอร์สำเร็จ" }, { status: 200 });
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
      { error: "เกิดข้อผิดพลาดในการลบออเดอร์" },
      { status: 500 },
    );
  }
}
