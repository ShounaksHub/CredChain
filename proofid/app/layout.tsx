import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Web3Provider } from "@/providers/web3-provider";

export const metadata: Metadata = {
  title: "CredChain — Own Your Student Identity",
  description:
    "A portable, verifiable student credential. Secure, shareable, blockchain ready.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Web3Provider>
          {children}
          <Toaster />
        </Web3Provider>
      </body>
    </html>
  );
}
