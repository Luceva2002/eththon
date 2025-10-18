"use client";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { base } from "wagmi/chains";

export default function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnchainKitProvider
      apiKey="YOUR_API_KEY"
      chain={base}
      config={{
        appearance: {
          mode: "auto", // 'light' | 'dark' | 'auto'
        },
        wallet: {
          display: "modal", // 'modal' | 'drawer'
          preference: "all", // 'all' | 'smartWalletOnly' | 'eoaOnly'
        },
      }}
    >
      <html>
        <body>{children}</body>
      </html>
    </OnchainKitProvider>
  );
}
