import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// ฟังก์ชัน PUT: สำหรับอัปเดตสถานะและเพิ่มลิงก์ไฟล์
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, fileLink } = body;

    const updatedOrder = await prisma.order.update({
      where: {
        id: params.id, // หาออเดอร์จาก ID ที่ส่งมาใน URL
      },
      data: {
        status: status,
        fileLink: fileLink,
      },
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตออเดอร์" },
      { status: 500 }
    );
  }
}