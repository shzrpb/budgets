"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Home" },
  { href: "/transactions", label: "Transactions" },
  { href: "/accounts", label: "Accounts" },
];

export default function TopNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="px-4 pt-2">
      <div className="flex gap-1.5 rounded-full bg-stone-100 p-1">
        {TABS.map(({ href, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 rounded-full py-2 text-center text-sm font-medium transition-colors ${
                active ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
