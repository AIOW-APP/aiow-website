/**
 * Welcome email template — React Email.
 *
 * Usage:
 *   const html = render(<WelcomeEmail name="Richard" brand="aiow" />);
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
  aiow:     "#00D9FF",
  h3alth:   "#FF4D6D",
  mew:      "#FF6B35",
  handsome: "#C6FF3D",
};

export default function WelcomeEmail({
  name,
  brand = "debbie",
  productName = "Debbie",
  ctaUrl = "https://example.com",
}: WelcomeEmailProps) {
  const accent = BRAND_ACCENTS[brand];
  return (
    <Html>
      <Head />
      <Preview>Welcome, {name} — let's get you set up.</Preview>
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
              You're in. Here's what happens next:
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
