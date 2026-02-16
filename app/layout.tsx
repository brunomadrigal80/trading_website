import type { Metadata } from "next";
import { headers } from "next/headers";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ContextProvider from "@/context";
import InitialLoadOverlay from "@/app/components/InitialLoadOverlay";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Vertex | Professional Trading",
  description: "Real-time charts, order book, and spot trading",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");

  const walletErrorScript = `
    (function(){
      function isWalletErr(r){
        var m=(r&&(r.message||String(r)))||'';
        return /failed to connect to metamask|connection declined|user rejected|connector/i.test(m);
      }
      window.__walletConnectionError=false;
      window.addEventListener('unhandledrejection',function(e){
        if(!isWalletErr(e.reason))return;
        e.preventDefault();
        e.stopPropagation();
        window.__walletConnectionError=true;
      },true);
    })();
  `.replace(/\s+/g, " ").trim();

  return (
    <html lang="en" className="dark" style={{ background: "#0a0b0d" }}>
      <body
        className={`${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
        style={{ background: "#0a0b0d" }}
      >
        <script
          dangerouslySetInnerHTML={{ __html: walletErrorScript }}
        />
        <ContextProvider cookies={cookies}>
          <InitialLoadOverlay />
          {children}
        </ContextProvider>
      </body>
    </html>
  );
}
