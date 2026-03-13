import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Siam Beauty | ความงามในทุกรายละเอียด",
  description:
    "สยาม บิวตี้ - คลินิกเสริมความงามมาตรฐานสากล ยกกระชับผิว ฟิลเลอร์ เลเซอร์ ทรีตเมนต์ ปรับรูปร่าง โดยทีมแพทย์ผู้เชี่ยวชาญ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Noto+Sans+Thai:wght@100..900&family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
