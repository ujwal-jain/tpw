"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LiveCostTicker } from "./live-cost-ticker";
import { Wordmark } from "./wordmark";

const NAV = [
  { href: "/", label: "The Case" },
  { href: "/savings-calculator", label: "Savings Calculator" },
];

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper">
      <div className="shell flex h-16 items-center justify-between gap-8">
        <Link href="/" aria-label="TPW — home">
          <Wordmark />
        </Link>

        <nav className="flex items-center gap-7 text-[14px]">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "border-b-2 border-green pb-0.5 text-ink"
                    : "text-muted transition-colors hover:text-ink"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <LiveCostTicker />
      </div>
    </header>
  );
}
