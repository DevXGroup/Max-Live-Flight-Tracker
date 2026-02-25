import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Live Flight Tracker | Real-Time Flight Tracking - Devx Group LLC",
  description: "Track flights in real-time with our advanced flight tracking system. View live positions on an interactive 3D globe, get accurate arrival times, and monitor flight status. Powered by Devx Group LLC.",
  keywords: ["flight tracker", "live flight tracking", "real-time flights", "flight status", "airplane tracker", "Devx Group LLC", "aviation tracking", "devxgroup", "developer tools"],
  authors: [{ name: "Devx Group LLC", url: "https://devxgroup.io" }],
  creator: "Devx Group LLC",
  publisher: "Devx Group LLC",
  metadataBase: new URL("https://devxgroup.io"),
  alternates: {
    canonical: "https://devxgroup.io/flight-tracker",
  },
  applicationName: "Live Flight Tracker",
  openGraph: {
    title: "Live Flight Tracker - Real-Time Flight Tracking",
    description: "Track flights in real-time with interactive 3D globe visualization. Powered by Devx Group LLC.",
    url: "https://devxgroup.io/flight-tracker",
    type: "website",
    siteName: "Live Flight Tracker",
    images: [
      {
        url: "/devx-logo.png",
        width: 1200,
        height: 630,
        alt: "Devx Group LLC Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Flight Tracker - Real-Time Flight Tracking",
    description: "Track flights in real-time with interactive 3D globe visualization. Powered by Devx Group LLC.",
    creator: "@devxgroup",
    images: ["/devx-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/devx-logo.png",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
