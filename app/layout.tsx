import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChainTrace Proof Page",
  description: "Create verifiable proof pages for products, shipments, invoices, and trade records.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
