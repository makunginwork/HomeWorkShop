import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    // 1. ตรวจสอบรหัสผ่าน
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401 },
      );
    }

    // 2. สร้าง JWT Token เข้ารหัสด้วย HS256
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const alg = "HS256";

    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime("24h") // หมดอายุใน 24 ชั่วโมง
      .sign(secret);

    // 3. ฝัง Token ลงใน HttpOnly Cookie
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true, // ป้องกันการถูกดึงค่าผ่าน JavaScript (กัน XSS Attack)
      secure: process.env.NODE_ENV === "production", // บังคับใช้ HTTPS ในโหมด Production
      sameSite: "strict", // ป้องกัน CSRF Attack
      maxAge: 60 * 60 * 24, // 1 วัน
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในระบบ" },
      { status: 500 },
    );
  }
}
