import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c1917",
          borderRadius: 42,
        }}
      >
        <div style={{ color: "white", fontSize: 106, fontWeight: 700, fontFamily: "sans-serif" }}>B</div>
      </div>
    ),
    { width: 192, height: 192 },
  );
}
