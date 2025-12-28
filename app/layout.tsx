import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// ✅ ADD THESE IMPORTS
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Study Companion",
  description:
    "Upload notes or PDFs. Practice with exam-style quizzes. Built for real students.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        {children}

        {/* ✅ Vercel Analytics (page views, visitors, routes) */}
        <Analytics />

        {/* ✅ Speed Insights (performance metrics) */}
        <SpeedInsights />
      </body>
    </html>
  );
}