import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_JWT_SECRET = "supersecretjwtkey_homework_shop_2026_secured";

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
    const secretKey = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
    const secret = new TextEncoder().encode(secretKey);
    await jwtVerify(token, secret);
    return null; // null = ผ่านการตรวจสอบแล้ว
  } catch {
    return NextResponse.json(
      { error: "Unauthorized: Token ไม่ถูกต้องหรือหมดอายุแล้ว" },
      { status: 401 },
    );
  }
}
