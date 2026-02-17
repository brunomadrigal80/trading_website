"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { toast } from "sonner";

function OfflineConnectWalletButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const display =
    isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet";

  return (
    <button
      type="button"
      onClick={() => open()}
      className="rounded-lg bg-[var(--accent-cyan)] px-4 py-2 text-sm font-semibold text-[var(--bg-primary)] transition-opacity hover:opacity-90"
    >
      {display}
    </button>
  );
}

function OnlineConnectWalletButton() {
  return (
    <button
      type="button"
      onClick={() => toast.info("This project can only be used offline.")}
      className="rounded-lg bg-[var(--accent-cyan)] px-4 py-2 text-sm font-semibold text-[var(--bg-primary)] transition-opacity hover:opacity-90"
    >
      Connect Wallet
    </button>
  );
}

function ConnectWalletButton() {
  // Treat localhost as the offline environment where wallet connections are allowed.
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isOfflineHost = host === "localhost" || host === "127.0.0.1" || host === "::1";
    if (isOfflineHost) {
      return <OfflineConnectWalletButton />;
    }
  }
  return <OnlineConnectWalletButton />;
}

const navItems = [
  { label: "Markets", href: "/markets" },
  { label: "Trade", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
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
        <ConnectWalletButton />
      </div>
    </header>
  );
}
