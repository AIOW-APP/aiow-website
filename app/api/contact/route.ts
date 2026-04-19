import { NextResponse } from "next/server";

// POST /api/contact — receive AI-scan form, send via Resend.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, company, email, phone, sector, message } = body;

    if (!name || !company || !email || !sector) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[contact] Missing RESEND_API_KEY");
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    // Email to AIOW team
    const teamPayload = {
      from: "AIOW Scan <scan@aiow.io>",
      to: ["info@aiow.io"],
      reply_to: email,
      subject: `[AI-scan aanvraag] ${company} · ${sector}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0A0A0B; color: #F8F8FA; border-radius: 16px;">
          <h2 style="color: #00F0FF; font-size: 14px; letter-spacing: 0.16em; text-transform: uppercase; margin: 0 0 24px;">— Nieuwe AI-scan aanvraag</h2>
          <h1 style="font-size: 28px; margin: 0 0 32px; letter-spacing: -0.02em;">${escapeHtml(company)}</h1>

          <table style="width: 100%; border-collapse: collapse; color: #D1D1D8;">
            <tr><td style="padding: 8px 0; color: #8A8A94; font-size: 13px;">Naam</td><td style="padding: 8px 0;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding: 8px 0; color: #8A8A94; font-size: 13px;">Email</td><td style="padding: 8px 0;"><a style="color:#00F0FF" href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
            ${phone ? `<tr><td style="padding: 8px 0; color: #8A8A94; font-size: 13px;">Telefoon</td><td style="padding: 8px 0;">${escapeHtml(phone)}</td></tr>` : ""}
            <tr><td style="padding: 8px 0; color: #8A8A94; font-size: 13px;">Sector</td><td style="padding: 8px 0;">${escapeHtml(sector)}</td></tr>
          </table>

          ${message ? `
          <div style="margin-top: 24px; padding: 16px; background: #111114; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;">
            <p style="color: #8A8A94; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 12px;">Waar wil je AI inzetten?</p>
            <p style="margin: 0; color: #F8F8FA; line-height: 1.6;">${escapeHtml(message).replace(/\n/g, "<br>")}</p>
          </div>
          ` : ""}

          <p style="margin-top: 32px; color: #8A8A94; font-size: 12px;">Verstuurd via aiow.io — binnen 24u reageren.</p>
        </div>
      `,
    };

    // Confirmation email to sender
    const userPayload = {
      from: "AIOW <info@aiow.io>",
      to: [email],
      subject: "Je AI-scan aanvraag is binnen — we reageren binnen 24 uur",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0A0A0B; color: #F8F8FA; border-radius: 16px;">
          <h2 style="color: #00F0FF; font-size: 14px; letter-spacing: 0.16em; text-transform: uppercase; margin: 0 0 24px;">— AIOW</h2>
          <h1 style="font-size: 32px; margin: 0 0 24px; letter-spacing: -0.02em; line-height: 1.05;">Bedankt, ${escapeHtml(name)}.</h1>

          <p style="color: #D1D1D8; line-height: 1.6; margin: 0 0 20px;">
            Je AI-scan aanvraag voor <strong style="color:#F8F8FA">${escapeHtml(company)}</strong> is binnen. We reageren binnen 24 uur met beschikbare tijden voor een 2-uurs video-call.
          </p>

          <div style="margin: 32px 0; padding: 20px; background: #111114; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;">
            <p style="color: #8A8A94; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 16px;">Wat je krijgt</p>
            <ul style="margin: 0; padding-left: 20px; color: #D1D1D8; line-height: 1.8;">
              <li>2 uur video-call met onze consultants</li>
              <li>Concreet PDF rapport van je AI-opportunity's</li>
              <li>3 prioritaire use cases met ROI-berekening</li>
              <li>Budget- en roadmap-indicatie</li>
              <li><strong style="color:#00E6A8">Volledig gratis, geen verplichtingen</strong></li>
            </ul>
          </div>

          <p style="color: #D1D1D8; line-height: 1.6; margin: 0 0 16px;">
            In de tussentijd: wil je een indruk van ons werk? Bekijk <a style="color:#00F0FF" href="https://aiow.io#portfolio">ons portfolio van 30+ AI-native SaaS-producten</a>.
          </p>

          <p style="color: #8A8A94; font-size: 13px; margin: 32px 0 0;">— Team AIOW</p>
        </div>
      `,
    };

    const [teamRes, userRes] = await Promise.all([
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(teamPayload),
      }),
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(userPayload),
      }),
    ]);

    if (!teamRes.ok) {
      console.error("[contact] Team email failed:", await teamRes.text());
    }
    if (!userRes.ok) {
      console.error("[contact] Confirmation email failed:", await userRes.text());
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[contact] Error:", e);
    return NextResponse.json({ error: e.message || "Internal error" }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
