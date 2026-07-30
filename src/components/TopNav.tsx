"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  if (pathname === "/login") return null;

  const isHome = pathname === "/";

  return (
    <nav className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[13px]">
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
    </nav>
  );
}
