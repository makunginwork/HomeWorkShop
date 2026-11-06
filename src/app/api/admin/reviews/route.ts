import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/reviews — ดึงรีวิวทั้งหมด (ทั้งที่เปิดและปิด) สำหรับ Admin
export async function GET(req: NextRequest) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    return NextResponse.json(
      { error: "ไม่สามารถดึงข้อมูลรีวิวได้" },
      { status: 500 }
    );
  }
}
