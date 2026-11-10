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
  title: "Live Flight Tracker - DevX Group",
  description: "Look up a flight to see available aircraft position and trip details on a map. Data coverage and details vary by source.",
  keywords: ["flight tracker", "live flight tracking", "real-time flights", "flight status", "airplane tracker", "DevXGroup", "aviation tracking", "flight radar", "flight path"],
  authors: [{ name: "DevXGroup LLC", url: "https://devxgroup.io" }],
  creator: "DevXGroup LLC",
  publisher: "DevXGroup LLC",
  metadataBase: new URL("https://flight.devxgroup.io"),
  alternates: {
    canonical: "https://flight.devxgroup.io",
  },
  applicationName: "Live Flight Tracker",
  openGraph: {
    title: "Live Flight Tracker - DevX Group",
    description: "Look up a flight to see available aircraft position and trip details on a map. Data coverage and details vary by source.",
    url: "https://flight.devxgroup.io",
    type: "website",
    siteName: "Live Flight Tracker",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Live Flight Tracker Icon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Flight Tracker - DevX Group",
    description: "Look up a flight to see available aircraft position and trip details on a map. Data coverage and details vary by source.",
    creator: "@devxgroup",
    images: ["/icon.png"],
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
    icon: "/icon.png",
    apple: "/apple-icon.png",
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
