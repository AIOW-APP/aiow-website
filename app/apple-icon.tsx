import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", backgroundColor: "#11110F", backgroundImage: "linear-gradient(#494945 1px,transparent 1px),linear-gradient(90deg,#494945 1px,transparent 1px)", backgroundSize: "45px 45px" }}>
      <div style={{ width: 92, height: 92, display: "flex", border: "18px solid #D94B30", borderRadius: 999, backgroundColor: "#11110F" }} />
      <div style={{ position: "absolute", width: 12, height: 12, display: "flex", backgroundColor: "#F5F4EE", borderRadius: 999 }} />
      <div style={{ position: "absolute", top: 18, width: 7, height: 29, display: "flex", backgroundColor: "#F5F4EE" }} />
      <div style={{ position: "absolute", bottom: 18, width: 7, height: 29, display: "flex", backgroundColor: "#F5F4EE" }} />
      <div style={{ position: "absolute", left: 18, width: 29, height: 7, display: "flex", backgroundColor: "#F5F4EE" }} />
      <div style={{ position: "absolute", right: 18, width: 29, height: 7, display: "flex", backgroundColor: "#F5F4EE" }} />
    </div>,
    { ...size },
  );
}
