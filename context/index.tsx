"use client";

import { wagmiAdapter, projectId } from "@/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { mainnet, arbitrum } from "@reown/appkit/networks";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { Toaster } from "sonner";
import { TickerProvider } from "./TickerContext";

const queryClient = new QueryClient();

const getAppUrl = () =>
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const metadata = {
  name: "Vertex Trading",
  description: "Professional Trading - Real-time charts and spot trading",
  get url() {
    return getAppUrl();
  },
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum],
  defaultNetwork: mainnet,
  metadata,
  features: {
    analytics: false,
    email: false,
    socials: [],
  },
});

export default function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState} reconnectOnMount>
      <QueryClientProvider client={queryClient}>
        <TickerProvider>
          {children}
          <Toaster theme="dark" />
        </TickerProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
