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
          borderRadius: 112,
        }}
      >
        <div style={{ color: "white", fontSize: 282, fontWeight: 700, fontFamily: "sans-serif" }}>B</div>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
