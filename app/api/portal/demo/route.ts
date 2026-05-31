import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    mode: "manual-safe-customer-portal",
    account: {
      company: "Voorbeeldbedrijf BV",
      verified: false,
      source: "manual-interest",
      portalRoute: "/portal",
      status: "interest_received",
    },
    quote: {
      id: "demo-starter",
      status: "draft",
      package: "Persoonlijke AI Starter",
      title: "Persoonlijke AI-installatie + onderhoud",
      setupExVatFrom: 2500,
      maintenanceMonthlyExVatFrom: 650,
      extraWorkHourlyExVatFrom: 175,
      currency: "EUR",
    },
    portalSections: ["intake", "scope", "data_boundary", "quote", "planning", "status"],
    blockers: [
      "No live database/auth until approved",
      "No WhatsApp webhook until approved",
      "No digital acceptance/payment until legal review",
    ],
  });
}
