import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import ContextProvider from "@/context";
import RemoveInitialLoader from "@/app/components/RemoveInitialLoader";

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
        className="antialiased"
        style={{ background: "#0a0b0d" }}
      >
        <div
          id="initial-loader"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.25rem",
            background: "#0a0b0d",
          }}
          aria-busy="true"
          aria-label="Loading"
        >
          <div style={{ position: "relative", width: 44, height: 44 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: "2px solid #23282f",
                borderRadius: "50%",
                opacity: 0.4,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: "2px solid transparent",
                borderTopColor: "#0ab3e6",
                borderRadius: "50%",
                animation: "initial-load-spin 0.8s linear infinite",
              }}
            />
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "#0ab3e6",
              }}
            >
              V
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500, color: "#848e9c" }}>
            Loading Vertex
          </p>
        </div>
        <script
          dangerouslySetInnerHTML={{ __html: walletErrorScript }}
        />
        <ContextProvider cookies={cookies}>
          <RemoveInitialLoader />
          {children}
        </ContextProvider>
      </body>
    </html>
  );
}
