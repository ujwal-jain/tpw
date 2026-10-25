import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/top-bar";
import { SiteFooter } from "@/components/site-footer";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Human Ledger — TPW Coalition",
  description:
    "Outcome data for Transformative Programming Works: what rehabilitation costs, what incarceration costs, and what each one returns.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${interTight.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <TopBar />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
