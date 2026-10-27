import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";
export const dynamic = "force-static";

// Ícone do app: um "p" claro sobre a luz do horizonte nascendo no preto.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(90% 70% at 50% 110%, #f4ffb0 0%, #d4f53c 28%, #7fae17 55%, #0b0d09 85%)",
          color: "#eef0e2",
          fontSize: 360,
          fontFamily: "sans-serif", fontWeight: 700, letterSpacing: "-0.06em",
          paddingBottom: 60,
        }}
      >
        p
      </div>
    ),
    size,
  );
}
