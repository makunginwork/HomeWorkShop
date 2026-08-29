import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

/**
 * ตรวจสอบ JWT Token จาก HttpOnly Cookie ที่แนบมากับ Request
 * - คืนค่า null  → Token ถูกต้อง (ผ่านการตรวจสอบ)
 * - คืนค่า NextResponse → Token ผิดพลาด/ไม่มี (ให้ return ออกจาก handler ทันที)
 */
export async function verifyAdminToken(
  req: NextRequest,
): Promise<NextResponse | null> {
  const token = req.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized: ไม่พบ Token กรุณาเข้าสู่ระบบก่อน" },
      { status: 401 },
    );
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return null; // null = ผ่านการตรวจสอบแล้ว
  } catch {
    return NextResponse.json(
      { error: "Unauthorized: Token ไม่ถูกต้องหรือหมดอายุแล้ว" },
      { status: 401 },
    );
  }
}
