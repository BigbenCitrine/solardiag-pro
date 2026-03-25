import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolarDiag Pro",
  description: "Diagnostic pentru invertoare și sisteme fotovoltaice",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}