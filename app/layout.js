export const metadata = {
  title: "ChainTrace P0 Prototype",
  description: "Static ChainTrace P0 prototype shell for Vercel preview deployment."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
