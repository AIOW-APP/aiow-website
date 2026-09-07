import { ImageResponse } from "next/og";

export const alt = "AIOW — AI op maat voor bedrijf, bedrijfspand en woning";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const routes = ["BEDRIJF", "BEDRIJFSPAND", "WONING"];

export default async function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", overflow: "hidden", backgroundColor: "#E4E5E0", color: "#11110F", fontFamily: "Arial, sans-serif", backgroundImage: "linear-gradient(rgba(17,17,15,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(17,17,15,.11) 1px,transparent 1px)", backgroundSize: "36px 36px" }}>
      <div style={{ width: 104, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "54px 0 38px", backgroundColor: "#11110F", color: "#F5F4EE", fontSize: 40, fontWeight: 800, lineHeight: .9 }}>
        <span>A</span><span>I</span>
        <div style={{ width: 46, height: 46, display: "flex", margin: "12px 0 10px", border: "7px solid #D94B30", borderRadius: 999 }} />
        <span>W</span><span style={{ marginTop: "auto", fontSize: 15, letterSpacing: 2 }}>26</span>
      </div>

      <div style={{ width: 728, height: "100%", display: "flex", flexDirection: "column", padding: "54px 50px 46px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#50514C", fontSize: 18, fontWeight: 700, letterSpacing: 3 }}>
          <span>AIOW</span><span style={{ width: 58, height: 1, display: "flex", backgroundColor: "#9FA09A" }} /><span>MAATWERK-AI · HOOFDDORP</span>
        </div>
        <div style={{ display: "flex", width: 545, marginTop: 42, padding: "11px 22px 8px", backgroundColor: "#D94B30", color: "#11110F", fontSize: 68, fontWeight: 800, lineHeight: .95, letterSpacing: -2 }}>AI OP MAAT</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 17, fontSize: 55, fontWeight: 800, lineHeight: .91, letterSpacing: -2 }}>
          <span>VOOR BEDRIJF,</span><span>BEDRIJFSPAND</span><span>EN WONING.</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: "auto", paddingTop: 17, borderTop: "4px solid #11110F", color: "#50514C", fontSize: 19, fontWeight: 700, letterSpacing: 2 }}>
          <span>ONTWERP</span><span>·</span><span>BOUW</span><span>·</span><span>KOPPEL</span><span>·</span><span>BEHEER</span>
        </div>
      </div>

      <div style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", position: "relative", padding: "54px 44px 42px", backgroundColor: "#11110F", color: "#F5F4EE" }}>
        <div style={{ color: "#B8B8B1", fontSize: 17, fontWeight: 700, letterSpacing: 3 }}>DRIE OMGEVINGEN</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 54, borderTop: "1px solid #494945" }}>
          {routes.map((route, index) => <div key={route} style={{ minHeight: 92, display: "flex", alignItems: "center", gap: 20, borderBottom: "1px solid #494945" }}><span style={{ color: "#FFB5A3", fontSize: 17, fontWeight: 700 }}>0{index + 1}</span><span style={{ fontSize: route === "BEDRIJFSPAND" ? 26 : 31, fontWeight: 800, letterSpacing: -.5 }}>{route}</span></div>)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 13, marginTop: "auto", color: "#F5F4EE", fontSize: 20, fontWeight: 700 }}><span style={{ width: 13, height: 13, display: "flex", border: "3px solid #D94B30", borderRadius: 999 }} /><span>EEN MENS BESLIST. ALTIJD.</span></div>
        <div style={{ position: "absolute", right: 30, top: 30, width: 58, height: 58, display: "flex", border: "1px solid #494945" }} />
      </div>
    </div>,
    { ...size },
  );
}
