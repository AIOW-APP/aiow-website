// POST /api/scan/finalize — email report to user + team after scan completes.
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/scan/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_AIOW_ENABLE_FORMS !== "true") {
    return NextResponse.json({ error: "AIOW scan form disabled; use WhatsApp" }, { status: 503 });
  }

  try {
    const { session, name, company, sector, email, report } = await req.json();
    const sess = await verifySession(session || "");
    if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const targetEmail = sess.email;
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return NextResponse.json({ ok: true, note: "email disabled" });

    const reportHtml = mdToHtml(String(report || ""));

    const userPayload = {
      from: "AIOW <scan@aiow.ai>",
      to: [targetEmail],
      subject: `Jouw AIOW AI-scan voor ${company}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;max-width:640px;margin:0 auto;padding:32px;background:#0A0A0B;color:#F8F8FA">
          <h2 style="color:#00F0FF;font-size:14px;letter-spacing:.16em;text-transform:uppercase;margin:0 0 16px">— AIOW Scan Rapport</h2>
          <h1 style="font-size:32px;margin:0 0 8px;letter-spacing:-0.02em;line-height:1.05">${escapeHtml(company)}</h1>
          <p style="color:#8A8A94;font-size:13px;margin:0 0 32px">Sector: ${escapeHtml(sector)} · Voor ${escapeHtml(name)}</p>
          <div style="color:#D1D1D8;line-height:1.7;font-size:15px">${reportHtml}</div>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:32px 0">
          <p style="color:#D1D1D8;line-height:1.7;font-size:14px">
            Dit is een geautomatiseerde conceptscan. Wil je deze bevindingen omzetten in actie? Bespreek eerst de scope en privacygrenzen via WhatsApp:
          </p>
          <a href="https://wa.me/31621898039" style="display:inline-block;background:#00F0FF;color:#0A0A0B;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:500;margin-top:16px">
            Stuur WhatsApp →
          </a>
          <p style="color:#8A8A94;font-size:12px;margin:40px 0 0">
            AIOW BV · <a style="color:#00F0FF" href="https://aiow.ai">aiow.ai</a> · Concept — finale juridische review aanbevolen
          </p>
        </div>
      `,
    };

    const teamPayload = {
      from: "AIOW Scan <scan@aiow.ai>",
      to: ["hello@aiow.ai"],
      reply_to: targetEmail,
      subject: `🎯 Nieuwe scan: ${company} (${sector})`,
      html: `<div style="font-family:-apple-system,sans-serif;padding:24px;background:#0A0A0B;color:#F8F8FA;max-width:640px;margin:0 auto">
        <h2 style="color:#00F0FF">Nieuwe AIOW scan voltooid</h2>
        <p><strong>${escapeHtml(name)}</strong> · ${escapeHtml(company)}</p>
        <p>Sector: ${escapeHtml(sector)}<br>Email: <a style="color:#00F0FF" href="mailto:${escapeHtml(targetEmail)}">${escapeHtml(targetEmail)}</a></p>
        <div style="margin-top:24px;padding:16px;background:#111114;border-radius:10px;color:#D1D1D8;line-height:1.6;font-size:14px">
          ${reportHtml}
        </div>
      </div>`,
    };

    await Promise.allSettled([
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(userPayload),
      }),
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(teamPayload),
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal" }, { status: 500 });
  }
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function mdToHtml(md: string): string {
  // Minimal markdown → HTML. Sufficient for our LLM output.
  let s = escapeHtml(md);
  s = s.replace(/^## (.+)$/gm, '<h2 style="color:#F8F8FA;font-size:20px;margin:28px 0 12px;letter-spacing:-0.01em">$1</h2>');
  s = s.replace(/^### (.+)$/gm, '<h3 style="color:#F8F8FA;font-size:16px;margin:20px 0 8px">$1</h3>');
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#F8F8FA">$1</strong>');
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Bullets
  s = s.replace(/^- (.+)$/gm, '<li style="margin:6px 0">$1</li>');
  s = s.replace(/((?:<li[^>]*>.*<\/li>\s*)+)/g, '<ul style="margin:12px 0;padding-left:20px">$1</ul>');
  // Paragraphs
  s = s.split(/\n\n+/).map(p => {
    if (/^\s*<(h\d|ul|li)/.test(p)) return p;
    return `<p style="margin:12px 0">${p.replace(/\n/g, '<br>')}</p>`;
  }).join("\n");
  return s;
}
