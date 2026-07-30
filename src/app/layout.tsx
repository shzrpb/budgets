import type { Metadata, Viewport } from "next";
import { Fira_Mono, Inter } from "next/font/google";
import "./globals.css";
import ScrollContainer from "@/components/ScrollContainer";
import TopNav from "@/components/TopNav";
import ViewportHeightSync from "@/components/ViewportHeightSync";

const firaMono = Fira_Mono({
  variable: "--font-fira-mono",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Budgets",
  description: "A calm way to track spending, income, and net worth.",
  appleWebApp: {
    capable: true,
    // Lets the mesh background paint behind the status bar instead of
    // sitting under a solid system-drawn bar when added to the home screen.
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#faf9f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${firaMono.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex h-[var(--app-height,100dvh)] flex-col overflow-hidden text-stone-900">
        <ViewportHeightSync />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden">
          <ScrollContainer>{children}</ScrollContainer>
          <TopNav />
        </div>
      </body>
    </html>
  );
}
