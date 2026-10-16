import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// POST /api/admin/upload — อัปโหลดรูปภาพ
export async function POST(req: NextRequest) {
  const authError = await verifyAdminToken(req);
  if (authError) return authError;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
    }

    // ตรวจสอบประเภทไฟล์ — อนุญาตเฉพาะรูปภาพ
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "อนุญาตเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF, WebP, SVG)" },
        { status: 400 },
      );
    }

    // จำกัดขนาดไฟล์ 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ไฟล์ใหญ่เกิน 5MB" },
        { status: 400 },
      );
    }

    // สร้างชื่อไฟล์ unique ด้วย timestamp + random
    const ext = path.extname(file.name) || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

    // เขียนไฟล์ลง public/uploads/
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const bytes = new Uint8Array(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), bytes);

    // คืน URL ที่ใช้เข้าถึงไฟล์ได้
    const url = `/uploads/${filename}`;

    return NextResponse.json({ url }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปโหลดไฟล์" },
      { status: 500 },
    );
  }
}
