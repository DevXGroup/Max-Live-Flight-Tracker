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
  title: "Live Flight Tracker | Real-Time Global Flight Tracking - DevXGroup",
  description: "Track any flight in real-time with our advanced 3D interactive globe. Get accurate status updates, arrival times, and global aviation coverage. Powered by DevXGroup.",
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
    title: "Live Flight Tracker - Real-Time Global Flight Tracking",
    description: "Track flights in real-time with interactive 3D globe visualization. Advanced aviation tracking by DevXGroup.",
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
    title: "Live Flight Tracker - Real-Time Flight Tracking",
    description: "Track flights in real-time with interactive 3D globe visualization. Powered by DevXGroup.",
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
