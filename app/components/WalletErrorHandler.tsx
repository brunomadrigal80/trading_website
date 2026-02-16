"use client";

import { useLayoutEffect } from "react";
import { toast } from "sonner";

const WALLET_ERROR_TOAST_ID = "wallet-connection-failed";

const WALLET_ERROR_MESSAGE =
  "Make sure MetaMask is unlocked and try again. You can also disconnect and reconnect the site in MetaMask.";

function isWalletConnectionError(reason: unknown): boolean {
  const message =
    reason instanceof Error ? reason.message : String(reason ?? "");
  return (
    /failed to connect to metamask/i.test(message) ||
    /connection declined/i.test(message) ||
    /user rejected/i.test(message) ||
    /connector.*not found/i.test(message)
  );
}

function showWalletErrorToast() {
  toast.error("Wallet connection failed", {
    id: WALLET_ERROR_TOAST_ID,
    description: WALLET_ERROR_MESSAGE,
    duration: 6000,
  });
}

export default function WalletErrorHandler() {
  useLayoutEffect(() => {
    if (typeof window !== "undefined" && window.__walletConnectionError) {
      window.__walletConnectionError = false;
      showWalletErrorToast();
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      if (!isWalletConnectionError(event.reason)) return;
      event.preventDefault();
      event.stopPropagation();
      showWalletErrorToast();
    };

    window.addEventListener("unhandledrejection", handleRejection, true);
    return () =>
      window.removeEventListener("unhandledrejection", handleRejection, true);
  }, []);

  return null;
}
