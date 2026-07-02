import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChainTrace P1 MVP",
  description: "Role-locked proof graph and case state machine MVP"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
