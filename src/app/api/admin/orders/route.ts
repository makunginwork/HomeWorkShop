import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // ตรวจสอบ Token ก่อน — ถ้าไม่ผ่านจะ return 401 ทันที
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const orders = await prisma.order.findMany({
      orderBy: { dueDate: "asc" },
      include: { customer: true },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // ตรวจสอบ Token ก่อน — ถ้าไม่ผ่านจะ return 401 ทันที
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { lineUid, displayName, title, totalPrice, status, dueDate } = body;

    if (!lineUid || !displayName || !title || Number.isNaN(Number(totalPrice))) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน หรือรูปแบบราคาไม่ถูกต้อง" }, { status: 400 });
    }

    const customer = await prisma.customer.upsert({
      where: { lineUid: lineUid },
      update: { displayName: displayName },
      create: { lineUid: lineUid, displayName: displayName },
    });

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
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างออเดอร์" }, { status: 500 });
  }
}