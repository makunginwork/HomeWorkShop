import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  // ดึง Token จาก Cookie
  const token = req.cookies.get('admin_token')?.value;

  // ป้องกันทุกหน้าใต้ /admin/* ยกเว้น /admin/login
  if (
    req.nextUrl.pathname.startsWith('/admin') &&
    !req.nextUrl.pathname.startsWith('/admin/login')
  ) {
    // ถ้าไม่มี Token ให้เตะกลับไปหน้า Login
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    try {
      // ถอดรหัสและตรวจสอบความถูกต้องของ Token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next(); // ผ่านได้
    } catch {
      // Token ปลอม หรือ หมดอายุ
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

// กำหนดให้ Middleware ทำงานเฉพาะเส้นทาง /admin/*
export const config = {
  matcher: ['/admin/:path*'],
};