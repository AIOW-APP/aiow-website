---
# Template — replace placeholders [IN_BRACKETS] before publishing.
# Reviewed for: GDPR (EU), AVG (NL), basic CCPA safe-harbor.
# Still recommended: legal review before go-live on regulated products.
---

# Privacy Policy

_Last updated: [YYYY-MM-DD]_

## 1. Who we are

[COMPANY_NAME] ("we", "our", "us") operates [WEBSITE_URL] and any related applications. We are registered in [COUNTRY] under [COMPANY_REGISTRATION].

Contact: [PRIVACY_EMAIL]

## 2. What we collect

We collect only what we need to operate the service:

- **Account data** — name, email, hashed password (if you create an account)
- **Usage data** — pages visited, clicks, device type (anonymized via Plausible; IP not stored)
- **Optional analytics** — behavioral telemetry via PostHog (only identified if you explicitly log in)
- **Payment data** — handled entirely by [Stripe / iDEAL provider], we never see card details
- **Wallet addresses** — only public blockchain addresses you provide; we never have access to private keys

We do NOT sell, rent, or trade your personal data.

## 3. Why we process it

- To provide and maintain the service
- To respond to support requests
- To prevent fraud and abuse
- To comply with legal obligations (tax, AML)

Legal bases (GDPR Art. 6):
- Consent (analytics cookies, marketing)
- Contract (account and service delivery)
- Legitimate interest (security, fraud prevention)

## 4. How long we keep it

- Account data: until you delete your account, plus 7 years for required tax/legal records
- Analytics: anonymized; 24 months
- Logs: 90 days for security, then purged

## 5. Your rights (GDPR)

You have the right to:

- Access your data
- Correct inaccurate data
- Delete your data ("right to be forgotten")
- Restrict processing
- Port your data elsewhere
- Object to processing
- Withdraw consent at any time
- File a complaint with your national data protection authority (in NL: Autoriteit Persoonsgegevens)

Email [PRIVACY_EMAIL] to exercise these rights. We respond within 30 days.

## 6. Cookies

We use:

- **Strictly necessary** cookies (session, CSRF) — no consent required
- **Analytics** (Plausible, cookieless by default) — no consent needed
- **Product analytics** (PostHog) — consent-based; opt in via the cookie banner

No advertising cookies.

## 7. Third parties

We share data only with processors strictly needed to run the service:

- Vercel (hosting) — EU/US
- Stripe (payments) — EU/US with SCC
- Plausible (analytics) — EU
- PostHog (product analytics) — EU (eu.posthog.com)
- Supabase (database) — EU

All processors have Data Processing Agreements in place.

## 8. International transfers

Where data leaves the EU, we rely on Standard Contractual Clauses and adequacy decisions.

## 9. Children

The service is not intended for users under 18. We do not knowingly collect data from minors.

## 10. Changes

We'll post updates here and, for material changes, notify active users by email at least 30 days before effect.

---

_This policy is written to be readable. If you spot something unclear, [PRIVACY_EMAIL] — we'll clarify and likely improve the text for everyone._
