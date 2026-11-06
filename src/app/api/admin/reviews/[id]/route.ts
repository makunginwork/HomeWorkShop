import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";

// PUT /api/admin/reviews/[id] — อัปเดตสถานะ visible (เปิด/ปิดการแสดงผล)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();
    const { visible } = body;

    const updated = await prisma.review.update({
      where: { id },
      data: {
        ...(typeof visible === "boolean" && { visible }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "ไม่สามารถอัปเดตรีวิวได้" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reviews/[id] — ลบรีวิวทิ้ง (กรณีสแปม/ปั่น)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    await prisma.review.delete({
      where: { id },
    });
    return NextResponse.json({ message: "ลบรีวิวสำเร็จ" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "ไม่สามารถลบรีวิวได้" },
      { status: 500 }
    );
  }
}
