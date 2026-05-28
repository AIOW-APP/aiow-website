export const aiowPhase2Demo = {
  policy: {
    mode: 'internal-demo-only',
    formsEnabled: false,
    liveAutomation: false,
    quoteAcceptance: false,
    primaryCta: 'WhatsApp'
  },
  lead: {
    id: 'demo-lead-001',
    companyName: 'Demo MKB BV',
    contactName: 'Interne demo',
    source: 'whatsapp/manual',
    status: 'reviewing',
    intakeSummary: 'Wil AI inzetten voor intake, offertevoorbereiding en planning zonder direct live automation.'
  },
  account: {
    id: 'demo-account-001',
    status: 'draft',
    companyName: 'Demo MKB BV'
  },
  quote: {
    id: 'demo-quote-001',
    status: 'draft_internal_review',
    title: 'AI intake + offerteflow pilot',
    legalReviewRequired: true,
    acceptanceDisabled: true
  },
  planning: [
    { id: 'demo-plan-001', title: 'Procesmapping', status: 'proposed' },
    { id: 'demo-plan-002', title: 'Prototype review', status: 'proposed' }
  ]
} as const;
