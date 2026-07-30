import type { Metadata, Viewport } from "next";
import { Fira_Mono, Inter } from "next/font/google";
import "./globals.css";
import ScrollContainer from "@/components/ScrollContainer";
import TopNav from "@/components/TopNav";

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
    <html lang="en" className={`${firaMono.variable} ${inter.variable} h-full overflow-hidden antialiased`}>
      {/* No overflow-hidden here: TopNav below is fixed to the true bottom
          of the screen, and an overflow-hidden ancestor would clip it
          there if this box ever falls short of the real viewport height
          (as can happen in a home-screen-installed webapp). html's own
          overflow-hidden above is enough to stop any stray page scroll. */}
      <body className="fixed inset-0 flex flex-col text-stone-900">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden">
          <ScrollContainer>{children}</ScrollContainer>
        </div>
        <TopNav />
      </body>
    </html>
  );
}
