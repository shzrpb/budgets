import type { Metadata, Viewport } from "next";
import { Fira_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";

const firaMono = Fira_Mono({
  variable: "--font-fira-mono",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Budgets",
  description: "A calm way to track spending, income, and net worth.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#faf9f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${firaMono.variable} h-full antialiased`}>
      <body className="flex h-dvh flex-col overflow-hidden bg-stone-50 text-stone-900">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden">
          <TopNav />
          <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
