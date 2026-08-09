import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  // ดึง Token จาก Cookie
  const token = req.cookies.get('admin_token')?.value;

  // ตรวจสอบว่าผู้ใช้กำลังจะเข้าหน้า /admin/dashboard หรือไม่
  if (req.nextUrl.pathname.startsWith('/admin/dashboard')) {
    
    // ถ้าไม่มี Token ให้เตะกลับไปหน้า Login
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    try {
      // ถอดรหัสและตรวจสอบความถูกต้องของ Token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next(); // ผ่านได้
    } catch (error) {
      // Token ปลอม หรือ หมดอายุ
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }
  
  return NextResponse.next();
}

// กำหนดให้ Middleware ทำงานเฉพาะเส้นทางที่ระบุ
export const config = {
  matcher: ['/admin/dashboard/:path*'],
};