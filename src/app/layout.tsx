import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

// ตั้งค่าฟอนต์ Prompt รองรับภาษาไทยและอังกฤษ
const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
});

// ตั้งค่า SEO และชื่อแท็บเบราว์เซอร์
export const metadata: Metadata = {
  title: "My Portfolio & Services",
  description: "แฟ้มสะสมผลงานและระบบจัดการคิวงาน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${prompt.variable} font-sans antialiased bg-gray-50 text-gray-900 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}