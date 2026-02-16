"use client";

import { useEffect } from "react";
import { useReconnect } from "wagmi";
import { toast } from "sonner";

const WALLET_ERROR_TOAST_ID = "wallet-connection-failed";

function showWalletErrorToast() {
  toast.error("Wallet connection failed", {
    id: WALLET_ERROR_TOAST_ID,
    description:
      "Make sure MetaMask is unlocked and try again. You can also disconnect and reconnect the site in MetaMask.",
    duration: 6000,
  });
}

export default function ReconnectOnMount() {
  const { reconnect } = useReconnect({
    mutation: {
      onError: (error) => {
        const message = error?.message ?? "";
        if (
          /failed to connect|metamask|connection declined|connector|user rejected/i.test(
            message
          )
        ) {
          showWalletErrorToast();
        }
      },
    },
  });

  useEffect(() => {
    const id = setTimeout(() => reconnect(), 0);
    return () => clearTimeout(id);
  }, [reconnect]);

  return null;
}
