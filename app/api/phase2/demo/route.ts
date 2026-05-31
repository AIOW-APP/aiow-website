import { NextResponse } from 'next/server';
import { aiowPhase2Demo } from '@/content/phase2/demo-data';

export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json({
    ...aiowPhase2Demo,
    guardrail: 'Internal demo only. No live automation, accounts, payment, analytics, forms or quote acceptance is enabled.'
  });
}
