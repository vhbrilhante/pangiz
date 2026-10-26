import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Ícone do app: um "p" serifado sobre prata fosca.
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
          background: "linear-gradient(135deg, #fbfbfc 0%, #d9dce1 45%, #bfc4cb 100%)",
          color: "#17191d",
          fontSize: 130,
          fontFamily: "Georgia, serif",
          paddingBottom: 20,
        }}
      >
        p
      </div>
    ),
    size,
  );
}
