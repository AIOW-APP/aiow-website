/**
 * Welcome email template — React Email.
 *
 * Usage:
 *   const html = render(<WelcomeEmail name="Richard" brand="aiow" />);
 *
 * AIOW rendert sinds 2026-07-05 in clean-glass (DESIGN-DNA.md v2.1): bijna-wit
 * canvas, inkt, één petrol-accent, verdict-taal in het Nederlands. E-mail kan
 * geen OKLCH of variabele fonts aan, dus de tokens zijn hier als hex benaderd
 * (--cg-canvas ≈ #FAF9F5, --cg-ink ≈ #23262E, --cg-accent ≈ #1E6A86) en de
 * display-serif valt terug op Georgia. De overige merken houden hun bestaande
 * donkere template tot hun eigen DNA-slag.
 */
// @ts-expect-error — optional peer dep; install `@react-email/components` in project if using this template
import {
  Html, Body, Container, Head, Heading, Hr, Preview,
  Section, Text, Button, Link, Tailwind,
} from "@react-email/components";

export interface WelcomeEmailProps {
  name: string;
  brand?: "debbie" | "aiow" | "h3alth" | "mew" | "handsome";
  productName?: string;
  ctaUrl?: string;
}

const BRAND_ACCENTS = {
  debbie:   "#E91E63",
  aiow:     "#1E6A86",
  h3alth:   "#FF4D6D",
  mew:      "#FF6B35",
  handsome: "#C6FF3D",
};

/* AIOW, clean-glass bij daglicht */
const CG = {
  canvas: "#FAF9F5",
  surface: "#FFFFFF",
  ink: "#23262E",
  inkSoft: "rgba(35,38,46,0.62)",
  inkFaint: "rgba(35,38,46,0.45)",
  line: "rgba(35,38,46,0.12)",
  accent: "#1E6A86",
  onAccent: "#FBFAF6",
};

function AiowWelcomeEmail({ name, ctaUrl }: { name: string; ctaUrl: string }) {
  return (
    <Html lang="nl">
      <Head />
      <Preview>Je dossier bij AIOW is geopend, {name}.</Preview>
      <Body style={{ backgroundColor: CG.canvas, color: CG.ink, fontFamily: "-apple-system, system-ui, 'Segoe UI', sans-serif", margin: 0 }}>
        <Container style={{ maxWidth: "480px", margin: "0 auto", padding: "44px 20px" }}>
          <Section>
            <Text style={{ fontFamily: "'SF Mono', Menlo, monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: CG.inkSoft, margin: 0 }}>
              AIOW / je dossier
            </Text>
          </Section>

          <Heading style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 30, lineHeight: 1.15, marginTop: 14, marginBottom: 16, fontWeight: 500, letterSpacing: "-0.015em", color: CG.ink }}>
            Welkom, {name}. Je dossier is geopend.
          </Heading>

          <Text style={{ fontSize: 16, lineHeight: 1.6, color: CG.inkSoft, marginBottom: 24 }}>
            Dit gebeurt er nu, in deze volgorde:
          </Text>

          <Text style={{ fontSize: 15, lineHeight: 1.6, color: CG.ink, marginBottom: 10 }}>
            01 · We wegen je aanvraag. Eerlijk, en vaker nee dan ja.
          </Text>
          <Text style={{ fontSize: 15, lineHeight: 1.6, color: CG.ink, marginBottom: 10 }}>
            02 · Binnen een werkdag krijg je het oordeel: meebouwen, betaalde scan, of nee met verbetertip.
          </Text>
          <Text style={{ fontSize: 15, lineHeight: 1.6, color: CG.ink, marginBottom: 24 }}>
            03 · Bij een ja staat alles in je dossier: voorstel, contract en elke gerealiseerde stap.
          </Text>

          <Section style={{ marginTop: 28, marginBottom: 28 }}>
            <Button
              href={ctaUrl}
              style={{
                backgroundColor: CG.accent,
                color: CG.onAccent,
                padding: "14px 26px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 650,
                fontSize: 15,
              }}
            >
              Open je dossier
            </Button>
          </Section>

          <Hr style={{ borderColor: CG.line, marginTop: 36, marginBottom: 18 }} />

          <Text style={{ fontSize: 12, color: CG.inkFaint, lineHeight: 1.6 }}>
            Antwoorden op deze mail komt bij een mens terecht. We lezen alles.<br />
            Verwachtte je deze mail niet? <Link href={`${ctaUrl}/unsubscribe`} style={{ color: CG.inkSoft }}>Afmelden</Link>.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default function WelcomeEmail({
  name,
  brand = "aiow",
  productName = "AIOW",
  ctaUrl = "https://aiow.ai/nl",
}: WelcomeEmailProps) {
  if (brand === "aiow") {
    return <AiowWelcomeEmail name={name} ctaUrl={ctaUrl === "https://aiow.ai/nl" ? "https://aiow.ai/portal" : ctaUrl} />;
  }

  const accent = BRAND_ACCENTS[brand];
  return (
    <Html>
      <Head />
      <Preview>Welcome, {name} — let’s get you set up.</Preview>
      <Tailwind>
        <Body style={{ backgroundColor: "#0A0A0B", color: "#FAFAFA", fontFamily: "-apple-system, system-ui, sans-serif" }}>
          <Container style={{ maxWidth: "480px", margin: "0 auto", padding: "40px 20px" }}>
            <Section>
              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: accent }} />
            </Section>

            <Heading style={{ fontSize: 28, lineHeight: 1.2, marginTop: 40, marginBottom: 20, fontWeight: 600, letterSpacing: -0.5 }}>
              Welcome to {productName}, {name}.
            </Heading>

            <Text style={{ fontSize: 16, lineHeight: 1.6, color: "#A1A1AA", marginBottom: 28 }}>
              You’re in. Here’s what happens next:
            </Text>

            <Text style={{ fontSize: 15, lineHeight: 1.6, color: "#FAFAFA", marginBottom: 12 }}>
              1. Open the dashboard and connect your first account.
            </Text>
            <Text style={{ fontSize: 15, lineHeight: 1.6, color: "#FAFAFA", marginBottom: 12 }}>
              2. Set your preferences — takes 2 minutes.
            </Text>
            <Text style={{ fontSize: 15, lineHeight: 1.6, color: "#FAFAFA", marginBottom: 28 }}>
              3. Let us do the work.
            </Text>

            <Section style={{ marginTop: 32, marginBottom: 32 }}>
              <Button
                href={ctaUrl}
                style={{
                  backgroundColor: accent,
                  color: "#0A0A0B",
                  padding: "14px 28px",
                  borderRadius: 9999,
                  textDecoration: "none",
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                Open {productName} →
              </Button>
            </Section>

            <Hr style={{ borderColor: "rgba(250,250,250,0.08)", marginTop: 40, marginBottom: 20 }} />

            <Text style={{ fontSize: 12, color: "#52525B", lineHeight: 1.6 }}>
              Replying to this email reaches a human. We read everything.<br />
              Not expecting this? <Link href={`${ctaUrl}/unsubscribe`} style={{ color: "#A1A1AA" }}>Unsubscribe</Link>.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
