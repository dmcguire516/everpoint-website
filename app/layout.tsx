import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://everpoint.tech"),
  title: {
    default: "Everpoint | Technology Integration",
    template: "%s | Everpoint",
  },
  description:
    "Everpoint designs, installs, and supports reliable technology for homes and small businesses throughout the Charleston Lowcountry.",
  applicationName: "Everpoint",
  keywords: [
    "technology integration",
    "Charleston technology",
    "home networking",
    "business Wi-Fi",
    "security cameras",
    "smart home integration",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://everpoint.tech",
    siteName: "Everpoint",
    title: "Everpoint | Technology Integration",
    description:
      "Reliable technology for homes and small businesses throughout the Charleston Lowcountry.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Everpoint | Technology Integration",
    description:
      "Reliable technology for homes and small businesses throughout the Charleston Lowcountry.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d1117",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${manrope.variable}`}>{children}</body>
    </html>
  );
}
