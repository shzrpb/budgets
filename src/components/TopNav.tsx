"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useVisualViewportBottomGap } from "@/lib/useVisualViewport";

function HouseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3 4 7l4 4" />
      <path d="M4 7h16" />
      <path d="M16 21l4-4-4-4" />
      <path d="M20 17H4" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

const TABS = [
  { href: "/", label: "Home", Icon: HouseIcon },
  { href: "/transactions", label: "Transactions", Icon: SwapIcon },
  { href: "/accounts", label: "Accounts", Icon: WalletIcon },
  { href: "/cards", label: "Cards", Icon: CardIcon },
];

export default function TopNav() {
  const pathname = usePathname();
  const bottomGap = useVisualViewportBottomGap();

  if (pathname === "/login") return null;

  const isHome = pathname === "/";

  return (
    // Pinned to the true bottom of the screen, not just the layout
    // viewport's bottom-0: iOS Safari and Chrome both draw their own bottom
    // bar inside the layout viewport, so a plain `bottom: 0` sits behind
    // that bar instead of above it. bottomGap tracks how much of the
    // layout viewport is currently covered by browser chrome and offsets
    // the nav to clear it.
    <nav
      className="fixed inset-x-0 z-40 mx-auto w-full max-w-md"
      style={{ bottom: bottomGap }}
    >
      {/* Fades the scrolled content out before it reaches the pill, so list
          rows don't show through the transparent gap around the nav. */}
      <div
        className="pointer-events-none absolute inset-0 backdrop-blur-md"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, black 40%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 40%)",
        }}
      />
      <div className="relative px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[13px]">
        <div className={`flex h-14 rounded-full bg-stone-100 p-1 ${isHome ? "gap-4" : "gap-1.5"}`}>
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex flex-1 items-center justify-center rounded-full transition-colors ${
                active ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"
              }`}
            >
              <Icon />
            </Link>
          );
        })}
        </div>
      </div>
    </nav>
  );
}
