import type { Metadata, Viewport } from "next";
import { Hedvig_Letters_Serif, Instrument_Sans } from "next/font/google";
import { ICON_NAMES } from "@/components/icons";
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
  themeColor: "#0b0d09",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Ícones Material Symbols Rounded, preenchidos e em negrito, só com os glifos que o app usa. */}
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,700,1,0&icon_names=${ICON_NAMES}&display=block`}
        />
      </head>
      <body className={`${sans.variable} ${serif.variable} antialiased`}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
