import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ToastProvider } from "@/components/ui/Toaster";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: '%s | TubeRise',
    default: 'TubeRise — YouTube Influencer Platform',
  },
  description: 'Connect brands with YouTube creators. Track campaign ROI in real-time.',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'TubeRise',
    description: 'The smarter YouTube influencer platform',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ToastProvider>{children}</ToastProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
