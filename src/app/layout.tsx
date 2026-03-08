import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import "./globals.css";

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AI Context Compiler",
  description: "Structure and generate robust logic contexts for AI-powered development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${firaSans.variable} ${firaCode.variable} font-sans bg-[#020617] text-[#F8FAFC] antialiased selection:bg-[#22C55E]/30 selection:text-[#22C55E] min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
