import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChainTrace | Supply Chain Fact Platform",
  description: "A supply-chain fact platform for proof packs, customer-context memory, assistant actions, approvals, and verifiable trade evidence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
