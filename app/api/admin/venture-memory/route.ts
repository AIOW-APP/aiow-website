import { NextResponse } from "next/server";
import { assertAiowAdmin } from "@/lib/aiow-admins";
import { aiowDurableStoreMode, supabaseSelect } from "@/lib/aiow-durable-store";
import { listVentureMemoryEvents } from "@/lib/aiow-venture-memory";

type LeadRow = {
  id: string;
  created_at: string;
  email: string;
  name?: string;
  company?: string;
  source_component?: string;
  intent_type?: string;
  status?: string;
  metadata?: Record<string, unknown>;
};

type DealCardRow = {
  id: string;
  session_id: string;
  title: string;
  founder?: string;
  company?: string;
  problem?: string;
  likely_route?: string;
  confidence?: number;
  created_at: string;
  payload?: Record<string, unknown>;
};

type AdminEventRow = {
  id: string;
  event_type: string;
  subject_type: string;
  subject_id?: string;
  event_payload?: Record<string, unknown>;
  created_at: string;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const admin = assertAiowAdmin(
      url.searchParams.get("adminEmail") || req.headers.get("x-aiow-admin-email") || "",
      url.searchParams.get("adminToken") || req.headers.get("x-aiow-admin-token") || "",
    );
    if (!admin) return NextResponse.json({ error: "Admin email/token required" }, { status: 401 });

    const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit")) || 20));
    const storageMode = aiowDurableStoreMode();

    if (storageMode === "supabase") {
      const [leads, dealCards, adminEvents] = await Promise.all([
        supabaseSelect<LeadRow>("aiow_leads", `order=created_at.desc&limit=${limit}`),
        supabaseSelect<DealCardRow>("aiow_deal_cards", `order=created_at.desc&limit=${limit}`),
        supabaseSelect<AdminEventRow>("aiow_admin_events", `order=created_at.desc&limit=${limit}`),
      ]);
      return NextResponse.json({
        ok: true,
        admin,
        storageMode,
        leads: leads || [],
        dealCards: dealCards || [],
        adminEvents: adminEvents || [],
      });
    }

    const memoryEvents = await listVentureMemoryEvents(undefined, limit);
    return NextResponse.json({ ok: true, admin, storageMode, leads: [], dealCards: [], adminEvents: [], memoryEvents });
  } catch (error) {
    console.error("[admin/venture-memory] GET error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
