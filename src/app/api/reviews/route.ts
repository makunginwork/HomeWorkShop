import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/reviews — ดึงรีวิวที่เปิดให้แสดงผล (visible: true)
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { visible: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "ไม่สามารถดึงข้อมูลรีวิวได้" },
      { status: 500 }
    );
  }
}

// POST /api/reviews — ลูกค้าส่งรีวิวและคะแนนบริการ
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { authorName, rating, comment, lineUid } = body;

    if (!authorName || typeof authorName !== "string" || !authorName.trim()) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่อของคุณ" },
        { status: 400 }
      );
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: "คะแนนต้องอยู่ระหว่าง 1 ถึง 5 ดาว" },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json(
        { error: "กรุณาระบุข้อความรีวิว" },
        { status: 400 }
      );
    }

    // ถ้ามีการส่ง lineUid มา อาจดึง displayName จาก Customer มาเสริมได้
    let finalAuthorName = authorName.trim();
    if (lineUid && typeof lineUid === "string" && lineUid.trim()) {
      try {
        const customer = await prisma.customer.findUnique({
          where: { lineUid: lineUid.trim() },
        });
        if (customer && customer.displayName) {
          finalAuthorName = customer.displayName;
        }
      } catch (e) {
        // Ignored
      }
    }

    const newReview = await prisma.review.create({
      data: {
        authorName: finalAuthorName.slice(0, 50),
        rating: ratingNum,
        comment: comment.trim().slice(0, 1000),
        lineUid: lineUid ? String(lineUid).trim().slice(0, 100) : null,
        visible: true,
      },
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "ไม่สามารถบันทึกรีวิวได้ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
