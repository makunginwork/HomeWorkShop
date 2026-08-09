import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const { status, fileLink } = body;

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
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
