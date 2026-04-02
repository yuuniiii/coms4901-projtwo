import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap", // important: avoids blocking render
});

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Modern, sleek admin panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.className} antialiased bg-[#111434] text-white`}>
        {children}
      </body>
    </html>
  );
}