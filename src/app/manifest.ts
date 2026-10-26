import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "pangiz",
    short_name: "pangiz",
    description: "Saiba quanto você pode investir, e em que mês.",
    start_url: "/",
    display: "standalone",
    background_color: "#121211",
    theme_color: "#121211",
    lang: "pt-BR",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
