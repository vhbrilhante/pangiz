import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "pangiz",
  description: "Saiba quanto você pode investir, e em que mês.",
  appleWebApp: { capable: true, title: "pangiz", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#09090c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} antialiased`}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
