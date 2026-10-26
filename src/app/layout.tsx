import type { Metadata, Viewport } from "next";
import { Hedvig_Letters_Serif, Instrument_Sans } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

// Serifa para números e títulos, sans para todo o resto (as fontes do Figma original).
const sans = Instrument_Sans({
  variable: "--font-ui-sans",
  subsets: ["latin"],
});

const serif = Hedvig_Letters_Serif({
  variable: "--font-ui-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "pangiz",
  description: "saiba quanto você pode investir, e em que mês.",
  appleWebApp: { capable: true, title: "pangiz", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0b0c0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${sans.variable} ${serif.variable} antialiased`}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
