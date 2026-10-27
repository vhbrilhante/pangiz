import type { NextConfig } from "next";

// No GitHub Pages o app é um site estático em /pangiz/ (veja .github/workflows/pages.yml).
const pages = process.env.GITHUB_PAGES === "true";
const base = pages ? "/pangiz" : "";

const nextConfig: NextConfig = {
  // O "N" do modo dev ficava por cima da navegação, inclusive dentro do /simulador.
  devIndicators: false,
  ...(pages && { output: "export", basePath: base, trailingSlash: true, images: { unoptimized: true } }),
  env: { NEXT_PUBLIC_BASE_PATH: base },
};

export default nextConfig;
