import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Family Wealth OS",
    template: "%s · Family Wealth OS",
  },
  description:
    "Private family wealth command centre — consolidated net worth, broker, mutual funds, banking, Tally, insurance, tax and document operations.",
  applicationName: "Family Wealth OS",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#08162d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
