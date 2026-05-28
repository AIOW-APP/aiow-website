import Link from 'next/link';
import { aiowPhase2Demo } from '@/content/phase2/demo-data';

export const metadata = {
  title: 'AIOW Phase 2 interne preview',
  description: 'Interne AIOW Phase 2 preview voor account, offerte en planning flow.'
};

export default function AiowPhase2PreviewPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#07080c', color: '#f5f7ff', padding: '48px 20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <section style={{ maxWidth: 1040, margin: '0 auto' }}>
        <p style={{ color: '#8df5d2', letterSpacing: '.16em', textTransform: 'uppercase', fontSize: 12 }}>Internal demo only</p>
        <h1 style={{ fontSize: 'clamp(2.4rem, 7vw, 5rem)', lineHeight: .9, margin: '12px 0 18px' }}>AIOW Phase 2 preview</h1>
        <p style={{ maxWidth: 720, color: '#b9c0d4', fontSize: 18 }}>Van WhatsApp-intake naar intern account, conceptofferte en planning — zonder live automation, formulieren, betalingen of digitale acceptatie.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 32 }}>
          <Card title="Lead" value={aiowPhase2Demo.lead.companyName} meta={aiowPhase2Demo.lead.status} />
          <Card title="Account" value={aiowPhase2Demo.account.companyName} meta={aiowPhase2Demo.account.status} />
          <Card title="Quote" value={aiowPhase2Demo.quote.title} meta={aiowPhase2Demo.quote.status} />
          <Card title="Planning" value={`${aiowPhase2Demo.planning.length} voorgestelde stappen`} meta="manual only" />
        </div>
        <section style={{ border: '1px solid rgba(255,255,255,.14)', borderRadius: 24, padding: 24, marginTop: 28, background: 'rgba(255,255,255,.06)' }}>
          <h2>Guardrails</h2>
          <ul style={{ color: '#c9d0e6', lineHeight: 1.8 }}>
            <li>Forms blijven disabled.</li>
            <li>WhatsApp blijft primaire CTA.</li>
            <li>Digitale quote-acceptatie blijft disabled.</li>
            <li>Geen live database/auth/webhook zonder aparte go.</li>
          </ul>
          <Link href="/portal" style={{ color: '#8df5d2' }}>Terug naar portal preview</Link>
        </section>
      </section>
    </main>
  );
}

function Card({ title, value, meta }: { title: string; value: string; meta: string }) {
  return (
    <article style={{ border: '1px solid rgba(255,255,255,.14)', borderRadius: 22, padding: 20, background: 'linear-gradient(135deg, rgba(141,245,210,.12), rgba(255,255,255,.05))' }}>
      <p style={{ color: '#8df5d2', margin: 0, fontSize: 13 }}>{title}</p>
      <h2 style={{ margin: '10px 0', fontSize: 22 }}>{value}</h2>
      <p style={{ color: '#9da6bd', margin: 0 }}>{meta}</p>
    </article>
  );
}
