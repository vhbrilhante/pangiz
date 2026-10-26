import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
          background: "radial-gradient(90% 70% at 50% 110%, #ffe2b8 0%, #ff9a5c 25%, #d9466a 50%, #5a2a7a 72%, #09090c 100%)",
          color: "#f4f1ea",
          fontSize: 130,
          fontFamily: "sans-serif", fontWeight: 700, letterSpacing: "-0.06em",
          paddingBottom: 20,
        }}
      >
        p
      </div>
    ),
    size,
  );
}
