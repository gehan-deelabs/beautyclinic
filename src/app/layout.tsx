import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ever | Beauty In Every Detail",
  description:
    "EVER - Beauty in every detail. Lash extensions, brows, nails, waxing, semi-permanent makeup, and body treatments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
