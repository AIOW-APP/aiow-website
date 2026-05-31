"use client";
import { portfolio, team } from "@/lib/content";

export function Footer() {
  return (
    <footer className="relative section-pad hairline">
      <div className="container-wide">
        <div className="grid md:grid-cols-12 gap-10 mb-[var(--space-8)]">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full border border-[var(--color-line-strong)] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
              </div>
              <span className="font-mono text-sm tracking-wider">AIOW</span>
            </div>
            <p className="text-[var(--color-ink-soft)] leading-relaxed max-w-[36ch] mb-6">
              {team.name} · {team.role}
            </p>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed max-w-[44ch]">
              {team.bio}
            </p>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)] mb-4">
              Onze producten
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-[var(--color-ink-soft)]">
              {portfolio.slice(0, 10).map((p) => (
                <li key={p.name}>
                  <a
                    href={`https://${p.name}`}
                    target="_blank"
                    rel="noopener"
                    className="hover:text-[var(--color-accent)] transition-colors"
                  >
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)] mb-4">
              Contact
            </p>
            <ul className="flex flex-col gap-2 text-sm text-[var(--color-ink-soft)]">
              <li>
                <a href="https://wa.me/31621898039" target="_blank" rel="noopener" className="hover:text-[var(--color-accent)] transition-colors">
                  +31 6 21 89 80 39 · WhatsApp
                </a>
              </li>
              <li>
                <a href={`https://x.com/${team.handle.replace("@", "")}`} target="_blank" rel="noopener" className="hover:text-[var(--color-accent)] transition-colors">
                  {team.handle}
                </a>
              </li>
              <li>
                <a href="https://wa.me/31621898039" target="_blank" rel="noopener" className="hover:text-[var(--color-accent)] transition-colors">
                  Plan een AI-scan
                </a>
              </li>
            </ul>

            <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)] mt-8 mb-4">
              Legal
            </p>
            <ul className="flex flex-col gap-2 text-sm text-[var(--color-ink-soft)]">
              <li><a href="/privacy" className="hover:text-[var(--color-accent)] transition-colors">Privacy</a></li>
              <li><a href="/terms" className="hover:text-[var(--color-accent)] transition-colors">Voorwaarden</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 border-t border-[var(--color-line)] text-xs text-[var(--color-ink-muted)] gap-3">
          <p>© {new Date().getFullYear()} AIOW BV. AI-transformatie voor MKB.</p>
          <p className="font-mono">
            Built by Debbie Studio — AI fleet runs 24/7.
          </p>
        </div>
      </div>
    </footer>
  );
}
