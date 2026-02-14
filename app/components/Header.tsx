"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Markets", href: "/markets" },
  { label: "Trade", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Futures", href: "/futures" },
] as const;

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-[var(--accent-cyan)]">
            Vertex
          </span>
          <span className="text-xs font-medium text-[var(--text-muted)]">
            TRADING
          </span>
        </Link>
        <nav className="flex gap-1">
          {navItems.map(({ label, href }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={label}
                href={href}
                className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden rounded border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-1.5 md:flex">
          <input
            type="search"
            placeholder="Search pairs..."
            className="w-40 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
          <kbd className="ml-2 text-[10px] text-[var(--text-muted)]">⌘K</kbd>
        </div>
        <button className="rounded-lg bg-[var(--accent-cyan)] px-4 py-2 text-sm font-semibold text-[var(--bg-primary)] transition-opacity hover:opacity-90">
          Connect Wallet
        </button>
      </div>
    </header>
  );
}
