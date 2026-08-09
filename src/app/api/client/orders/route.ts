import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lineUid } = body;

    // ตรวจสอบว่ามีการส่ง UID มาหรือไม่
    if (!lineUid) {
      return NextResponse.json({ error: "ไม่อนุญาตให้เข้าถึง: ขาดข้อมูลระบุตัวตน" }, { status: 400 });
    }

    // ค้นหาลูกค้าและดึงออเดอร์ทั้งหมดของลูกค้ารายนี้ เรียงจากงานล่าสุดไปหางานเก่า
    const customer = await prisma.customer.findUnique({
      where: { lineUid: lineUid },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' } // เรียงลำดับงานล่าสุดขึ้นก่อน
        }
      }
    });

    // หากไม่พบลูกค้า (อาจจะเป็นคนกดเข้ามาดูเว็บเฉยๆ ยังไม่เคยสั่งงาน) ให้ส่งอาร์เรย์ว่างกลับไป
    if (!customer) {
      return NextResponse.json([], { status: 200 });
    }

    // ส่งข้อมูลออเดอร์กลับไปให้หน้าเว็บ
    return NextResponse.json(customer.orders, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์ลูกค้า" },
      { status: 500 }
    );
  }
}