// POST /api/scan/request: send magic-link code to email
import { NextResponse } from "next/server";
import { generateCode } from "@/lib/scan/store";

export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_AIOW_ENABLE_FORMS !== "true") {
    return NextResponse.json({ error: "AIOW scan form disabled; use WhatsApp" }, { status: 503 });
  }

  try {
    const { email, name, company } = await req.json();
    if (!email || !name || !company) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const code = generateCode(email);

    // Send code via Resend. Await the provider response so smoke tests fail
    // honestly if sender-domain verification or API credentials break.
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const payload = {
        from: "AIOW Scan <scan@send.aiow.ai>",
        to: [email],
        reply_to: "hello@aiow.ai",
        subject: `Je AIOW scan code: ${code}`,
        html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#0A0A0B;color:#F8F8FA;border-radius:16px">
          <h2 style="color:#00F0FF;font-size:14px;letter-spacing:.16em;text-transform:uppercase;margin:0 0 16px">AIOW Scan</h2>
          <h1 style="font-size:28px;margin:0 0 16px;letter-spacing:-0.02em">Hi ${escapeHtml(name)},</h1>
          <p style="color:#D1D1D8;line-height:1.6;margin:0 0 24px">
            Je verificatie-code voor de AIOW scan van <strong style="color:#F8F8FA">${escapeHtml(company)}</strong>:
          </p>
          <div style="padding:24px;background:#111114;border:1px solid rgba(255,255,255,0.1);border-radius:12px;text-align:center;margin:0 0 24px">
            <div style="font-family:'JetBrains Mono',monospace;font-size:36px;letter-spacing:.3em;color:#00F0FF;font-weight:500">${code}</div>
          </div>
          <p style="color:#8A8A94;font-size:13px;line-height:1.5;margin:0">
            Geldig voor 15 minuten. Niet gevraagd? Negeer deze mail.
          </p>
        </div>`,
      };
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
      });

      if (!resendRes.ok) {
        const providerError = await resendRes.text();
        console.error("[scan/request] Resend send failed:", providerError);
        return NextResponse.json({ error: "Email service failed" }, { status: 502 });
      }
    } else {
      console.error("[scan/request] Missing RESEND_API_KEY");
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal" }, { status: 500 });
  }
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
