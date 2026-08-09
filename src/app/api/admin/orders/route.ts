import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// 1. ฟังก์ชัน GET: สำหรับดึงคิวงานทั้งหมด (เรียงตามวันที่ต้องส่งงาน)
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        dueDate: "asc", // เรียงจากวันที่ใกล้ถึงกำหนดที่สุดขึ้นก่อน
      },
      include: {
        customer: true, // ดึงชื่อลูกค้ามาด้วย
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์" },
      { status: 500 }
    );
  }
}

// 2. ฟังก์ชัน POST: สำหรับสร้างออเดอร์ใหม่
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lineUid, displayName, title, totalPrice, status, dueDate } = body;

    // ระบบจะเช็คว่ามีลูกค้ารายนี้ในฐานข้อมูลหรือยัง 
    // ถ้ามีแล้วให้อัปเดตชื่อ ถ้ายังไม่มีให้สร้างใหม่ (Upsert)
    const customer = await prisma.customer.upsert({
      where: { lineUid: lineUid },
      update: { displayName: displayName },
      create: { 
        lineUid: lineUid, 
        displayName: displayName 
      },
    });

    // สร้างออเดอร์และผูกกับ ID ของลูกค้า
    const newOrder = await prisma.order.create({
      data: {
        customerId: customer.id,
        title: title,
        totalPrice: Number(totalPrice),
        status: status || "PENDING_DEPOSIT",
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างออเดอร์" },
      { status: 500 }
    );
  }
}