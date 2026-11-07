import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";

// POST /api/admin/upload — อัปโหลดรูปภาพ (Serverless Ready)
export async function POST(req: NextRequest) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
    }

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "อนุญาตเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF, WebP, SVG)" },
        { status: 400 }
      );
    }

    // จำกัดขนาดไฟล์ 8MB
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ไฟล์มีขนาดใหญ่เกิน 8MB" },
        { status: 400 }
      );
    }

    // คืน Data URL สำหรับ Serverless (Vercel) ปลอดภัย ไม่ติด Read-only filesystem
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ url: dataUrl }, { status: 201 });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปโหลดไฟล์: " + (err?.message || "") },
      { status: 500 }
    );
  }
}
