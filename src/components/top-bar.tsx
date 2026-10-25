"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LiveCostTicker } from "./live-cost-ticker";

const NAV = [
  { href: "/", label: "Ledger" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/roi", label: "Cost & ROI" },
];

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper">
      <div className="shell flex h-16 items-center justify-between gap-8">
        <Link href="/" className="label-xs !text-ink whitespace-nowrap">
          TPW Coalition
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
                    ? "text-ink border-b border-amber pb-0.5"
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
