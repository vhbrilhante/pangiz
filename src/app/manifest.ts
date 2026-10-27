import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "pangiz",
    short_name: "pangiz",
    description: "Saiba quanto você pode investir, e em que mês.",
    start_url: `${BASE}/`,
    display: "standalone",
    background_color: "#09090c",
    theme_color: "#09090c",
    lang: "pt-BR",
    icons: [
      { src: `${BASE}/icon`, sizes: "512x512", type: "image/png" },
      { src: `${BASE}/apple-icon`, sizes: "180x180", type: "image/png" },
    ],
  };
}
