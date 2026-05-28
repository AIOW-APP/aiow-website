import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg, #080A08 0%, #11170F 52%, #2A1E12 100%)", color: "#F8F2E8", fontFamily: "Inter" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 24, color: "#77D9AA", letterSpacing: 2, fontWeight: 800 }}>
          <span>AIOW</span><span>AI OPERATING WORKLAYER</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", maxWidth: 900, fontSize: 82, lineHeight: .88, fontWeight: 900, letterSpacing: -5 }}>AI zonder chaos.</div>
          <div style={{ display: "flex", marginTop: 28, maxWidth: 760, fontSize: 34, lineHeight: 1.18, color: "#D8CDBD" }}>Eén veilige AI-werklaag voor processen, data, agents en approvals.</div>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 22, color: "#E2B06D", fontWeight: 800 }}>
          <span>Local waar nodig</span><span>•</span><span>Cloud waar het mag</span><span>•</span><span>Agents met controle</span>
        </div>
      </div>
    ),
    size,
  );
}
