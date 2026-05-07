import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roma Pastry",
  description: "Luxury Italian and French pastries from Jeddah.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
