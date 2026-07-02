import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ServiceDesk",
  description: "Kunden, Aufträge, Termine und Finanzen für Gartenservice und Technikhilfe.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ServiceDesk",
    statusBarStyle: "default"
  },
  icons: {
    icon: "/servicedesk-icon.svg",
    apple: "/servicedesk-icon.svg"
  }
};

export const viewport: Viewport = {
  themeColor: "#061321",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={cn("font-sans", inter.variable)}>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
