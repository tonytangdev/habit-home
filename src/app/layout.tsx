import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HabitHome - 智能家務分配工具",
  description: "為情侶、室友和家庭設計的公平家務分配平台",
  keywords: "家務分配, 家庭管理, 任務分配, 情侶工具",
  authors: [{ name: "HabitHome Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}