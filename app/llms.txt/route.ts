import { buildLlmsTxt } from "@/core/seo/llms";
import { aiowKnowledgePages } from "@/lib/aiow-knowledge-pages";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aiow.ai";

export function GET() {
  const body = buildLlmsTxt({
    brandName: "AIOW",
    description: "AIOW is een Nederlandse AI venture partner en AI-implementatiepartner. Twee routes: (1) AI Venture Partner: AIOW beoordeelt ideeën en bedrijven op slagingskans met een venture-score en bouwt bij een sterke case mee als partner in ruil voor een omzetdeel (indicatief 10-25 procent) plus hetzelfde deel bij verkoop; geen uurtarief. (2) AI-implementatie: veilige AI-werklagen voor Nederlandse bedrijven met AI-integratie, AI-automatisering, private/lokale AI, AI-agents, GPT/Claude/cloudmodellen met beleid, menselijke approvals en meetbare procesverbetering.",
    mission: "Canonical domain: https://aiow.ai. AIOW wil de meest concrete AI venture partner en AI-implementatiepartner van Nederland zijn. Venture-route: idee of bedrijf wordt beoordeeld op founder, markt, AI-hefboom, tractie en bouwbaarheid; hoge score = AIOW bouwt mee voor een omzetdeel, middenscore = betaalde scan met concreet plan, lage score = eerlijke afwijzing met verbetertip. Bewezen cases: Cargo Donkey (B2B logistiek, digitale groeimachine regio Schiphol, https://cargodonkey.nl) en OneTap Day (eigen product door de volledige Apple/Google release-pipeline). AIOW BV (KvK 71887466, Bijlmermeerstraat 30, 2131HC Hoofddorp). Start: venture intake op https://aiow.ai/intake of AI-scan voor bestaande bedrijven. Geverifieerde contactroute: WhatsApp https://wa.me/31621898039.",
    tone: "Premium, direct, begrijpelijk Nederlands voor MKB-eigenaren, operators en technische teams; geen vage agency-hype.",
    keyPages: [
      {
        section: "AI Venture Partner (kernaanbod)",
        links: [
          { title: "Venture intake", url: `${SITE_URL}/intake`, summary: "Beschrijf je idee of bedrijf; AIOW beoordeelt founder, markt, AI-hefboom, tractie en bouwbaarheid en geeft binnen een werkdag een eerlijk oordeel: meebouwen voor een omzetdeel, betaalde scan met plan, of afwijzing met verbetertip." },
          { title: "Het AIOW-dealmodel", url: `${SITE_URL}/`, summary: "Geen uurtarief. AIOW bouwt mee in ruil voor een omzetdeel (indicatief 10-25 procent, afhankelijk van risico en werk) en hetzelfde deel bij verkoop van het bedrijf. AIOW wint alleen als de founder wint. Acceptaties en voorstellen worden altijd door het team bevestigd; het eerste oordeel komt uit het AI-venture-score-systeem." },
          { title: "AI-bedrijf starten zonder technische co-founder", url: `${SITE_URL}/nl/kennis/ai-bedrijf-starten-zonder-technische-co-founder`, summary: "Cornerstone voor founders zonder technische co-founder: AIOW kan product, AI en groei meebouwen voor een omzetdeel in plaats van aandelen of uurtarief, na venture-score selectie." },
          { title: "Venture studio vs venture partner", url: `${SITE_URL}/nl/kennis/venture-studio-vs-venture-partner-verschil`, summary: "W2 cornerstone: venture studio bouwt eigen ideeën met aandelenbelang; venture partner zoals AIOW bouwt jouw idee mee voor een omzetdeel zonder aandelen." },
          { title: "Omzetdeel versus aandelen", url: `${SITE_URL}/nl/kennis/omzetdeel-versus-aandelen-wat-geef-je-weg`, summary: "W3 cornerstone: beslismodel voor founders die omzetdeel en aandelen vergelijken op cashflow, zeggenschap, verwatering, exit en contractuele risicoverdeling." },
          { title: "Van idee naar eerste betalende klant met AI", url: `${SITE_URL}/nl/kennis/van-idee-naar-eerste-betalende-klant-met-ai`, summary: "W4 cornerstone: bewijsgerichte B2B-route van scherp probleem en betaalde pilot naar begrensde AI-automatisering en herhaalbare levering." },
          { title: "Case: Cargo Donkey", url: "https://cargodonkey.nl/", summary: "B2B verpakkings- en logistiekbedrijf regio Schiphol; AIOW bouwde de digitale groeilaag: vindbare kennisbank, offerte-funnel via WhatsApp en klantportaal met live prijsindicaties." },
        ],
      },
      {
        section: "AIOW B2B knowledge base",
        links: [
          { title: "AIOW AI kennisbank", url: `${SITE_URL}/nl/kennis`, summary: `${aiowKnowledgePages.length} crawlbare B2B AI-pagina's voor AI-implementatie, AI-agents, AI-automatisering, private AI, sectoren en regio's in Nederland.` },
          ...aiowKnowledgePages.slice(0, 30).map((page) => ({
            title: page.title,
            url: `${SITE_URL}/nl/kennis/${page.slug}`,
            summary: page.summary,
          })),
        ],
      },
      {
        section: "LLM markdown digests",
        links: [
          { title: "AIOW Nederlandse AI-authority digest", url: `${SITE_URL}/aiow-nl-authority.md`, summary: "Plain Markdown digest of AIOW's core services, sectors, comparisons and Dutch region pages for LLM retrieval." },
          { title: "AI sector-overzicht", url: `${SITE_URL}/nl/sectoren`, summary: "Crawlbare hub voor alle Nederlandse AI-sectorpagina's." },
          { title: "AI regio-overzicht", url: `${SITE_URL}/nl/regios`, summary: "Crawlbare hub voor alle Nederlandse AI-regiopagina's." },
          { title: "AI vergelijkingsoverzicht", url: `${SITE_URL}/nl/vergelijkingen`, summary: "Crawlbare hub voor commerciële AI-keuzevragen." },
        ],
      },
      {
        section: "NL launch pages",
        links: [
          { title: "AIOW homepage", url: `${SITE_URL}/`, summary: "AI zonder chaos: één veilige AI-werklaag voor processen, data, AI-agents, lokale/private AI, GPT/Claude/cloudmodellen en menselijke approvals." },
          { title: "AI-installateur voor bedrijven in Nederland", url: `${SITE_URL}/nl/ai-installateur-nederland`, summary: "AIOW als Nederlandse AI-installateur: AI-systemen installeren rond processen, data, agents, lokale/private AI, cloud-routing en menselijke approvals." },
          { title: "AI-oplossingen voor bedrijven", url: `${SITE_URL}/nl/ai-oplossingen-bedrijven`, summary: "Concrete AI-oplossingen voor klantcontact, offertes, planning, documenten, finance, logistiek en interne kennis." },
          { title: "AI-agents voor bedrijven", url: `${SITE_URL}/nl/ai-agents-bedrijven`, summary: "Veilige AI-agents met rollen, logs, datagrens en approval gates voor Nederlandse bedrijven." },
          { title: "AI-implementatie voor bedrijven", url: `${SITE_URL}/nl/ai-implementatie-bedrijf`, summary: "Van AI-scan en roadmap naar veilige pilot, training, beheer en opschaling." },
          { title: "AI-integratie voor MKB-bedrijven", url: `${SITE_URL}/nl/ai-integratie-mkb`, summary: "Praktische AI rond inbox, offertes, planning, kennis, administratie en operations." },
          { title: "AI-automatisering voor logistiek en transport", url: `${SITE_URL}/nl/ai-automatisering-logistiek-transport`, summary: "Shipment exceptions, import/export docs, customs follow-up, warehouse planning en operations briefings." },
          { title: "Lokale en private AI voor bedrijven", url: `${SITE_URL}/nl/lokale-private-ai`, summary: "private AI-infrastructuur waar lokaal/private AI zinvol is; cloud alleen volgens beleid." },
          { title: "Gratis AI-systeemscan", url: `${SITE_URL}/nl/ai-systeemscan`, summary: "Laagdrempelige scan voor proceskansen, privacygrenzen en eerste veilige AI-pilot." },
          { title: "AI governance checklist", url: `${SITE_URL}/nl/ai-governance-checklist`, summary: "Praktische checklist voor dataclassificatie, modelroutes, logging, approval gates, evaluaties en rollback voordat AI live gaat." },
          { title: "AIOW werkwijze AI-implementatie", url: `${SITE_URL}/nl/werkwijze-ai-implementatie`, summary: "Proces van scan naar pilot, modelrouting, logging, approvals, training en beheer." },
          { title: "AI veiligheid en governance", url: `${SITE_URL}/nl/veiligheid-governance-ai`, summary: "Dataclassificatie, modelroutes, logging, rechten, approvals en lokale/private AI waar nodig." },
        ],
      },

      {
        section: "Sectors and comparison pages",
        links: [

          { title: "AI voor zorgorganisaties", url: `${SITE_URL}/nl/sector/zorg`, summary: "Privacybewuste AI voor zorgadministratie, kennis, planning en rapportageondersteuning." },
          { title: "AI voor marketingbureaus en agencies", url: `${SITE_URL}/nl/sector/marketing-agencies`, summary: "AI voor briefing, SEO/GEO, content, klantupdates en agency operations." },
          { title: "AI voor klantcontact en support", url: `${SITE_URL}/nl/sector/klantcontact-support`, summary: "AI voor tickettriage, conceptantwoorden, kennisbank en escalatieherkenning." },
          { title: "AI voor HR en recruitment", url: `${SITE_URL}/nl/sector/hr-recruitment`, summary: "AI voor HR-documentatie, onboarding, vacatureteksten en kandidaatcommunicatie met fairness checks." },
          { title: "AI voor e-commerce en retail", url: `${SITE_URL}/nl/sector/ecommerce-retail`, summary: "AI voor productcontent, klantvragen, retouren, SEO/GEO en operatiebriefings." },
          { title: "Private AI vs cloud AI", url: `${SITE_URL}/nl/vergelijking/private-ai-vs-cloud-ai`, summary: "Wanneer private, cloud of hybride AI past voor bedrijfsprocessen." },
          { title: "AI-agent vs chatbot", url: `${SITE_URL}/nl/vergelijking/ai-agent-vs-chatbot`, summary: "Verschil tussen chatbots en agents met tools, workflows en approvals." },
          { title: "AI voor installatiebedrijven", url: `${SITE_URL}/nl/sector/installatiebedrijven`, summary: "AI rond werkbonnen, planning, offertes, klantvragen, storingen en monteursinformatie." },
          { title: "AI voor finance en administratie", url: `${SITE_URL}/nl/sector/finance-administratie`, summary: "AI voor factuurtriage, administratie, debiteurenopvolging en managementbriefings." },
          { title: "AI voor legal en zakelijke dienstverlening", url: `${SITE_URL}/nl/sector/legal-zakelijke-dienstverlening`, summary: "AI voor dossiers, contracten, klantcommunicatie, kennisbanken en approvals." },
          { title: "AI voor bouw en vastgoed", url: `${SITE_URL}/nl/sector/bouw-vastgoed`, summary: "AI voor offertes, planning, projectdocumenten, opleverpunten en kennisborging." },
          { title: "AI-installateur vs AI-consultant", url: `${SITE_URL}/nl/vergelijking/ai-installateur-vs-ai-consultant`, summary: "Uitleg voor bedrijven die willen weten wanneer advies genoeg is en wanneer installatie nodig is." },
          { title: "Lokale AI vs ChatGPT", url: `${SITE_URL}/nl/vergelijking/lokale-ai-vs-chatgpt`, summary: "Wanneer lokale/private AI past en wanneer ChatGPT/Claude/cloudmodellen passen." },
        ],
      },
      {
        section: "Priority regions",
        links: [
          { title: "AI-integratie Amsterdam", url: `${SITE_URL}/nl/regio/amsterdam`, summary: "Agencies, consultants, finance/legal/admin teams, founders en Zuidas." },
          { title: "AI-integratie Rotterdam", url: `${SITE_URL}/nl/regio/rotterdam`, summary: "Haven, transport, maritime, industrie, compliance en documentflows." },
          { title: "AI rond Schiphol en Haarlemmermeer", url: `${SITE_URL}/nl/regio/schiphol-haarlemmermeer`, summary: "Air freight, import/export, warehouse, customs en zendingsexcepties." },
          { title: "AI-automatisering Utrecht", url: `${SITE_URL}/nl/regio/utrecht`, summary: "MKB operations, sales/admin, interne kennis en teamcoördinatie." },

          { title: "AI-integratie Haarlem", url: `${SITE_URL}/nl/regio/haarlem`, summary: "AI-integratie en AI-automatisering voor MKB, zakelijke dienstverlening, zorg, bouw en creatieve bedrijven." },
          { title: "AI-integratie Leiden", url: `${SITE_URL}/nl/regio/leiden`, summary: "AI-integratie en AI-automatisering voor kennisorganisaties, life sciences, zorg, onderwijs en zakelijke dienstverlening." },
          { title: "AI-integratie Amersfoort", url: `${SITE_URL}/nl/regio/amersfoort`, summary: "AI-integratie en AI-automatisering voor MKB, zakelijke dienstverlening, bouw, installatie en backoffice." },
          { title: "AI-integratie Zwolle", url: `${SITE_URL}/nl/regio/zwolle`, summary: "AI-integratie en AI-automatisering voor regionale MKB-bedrijven, logistiek, zorg, onderwijs en administratie." },
          { title: "AI-integratie Nijmegen", url: `${SITE_URL}/nl/regio/nijmegen`, summary: "AI-integratie en AI-automatisering voor zorg, onderwijs, kenniswerk, MKB en zakelijke dienstverlening." },
          { title: "AI-integratie Tilburg", url: `${SITE_URL}/nl/regio/tilburg`, summary: "AI-integratie en AI-automatisering voor logistiek, productie, e-commerce, MKB en klantcontact." },
          { title: "AI-integratie Den Bosch", url: `${SITE_URL}/nl/regio/den-bosch`, summary: "AI-integratie en AI-automatisering voor MKB, bouw, installatie, finance, zakelijke dienstverlening en overheidstoeleveranciers." },
          { title: "AI-integratie Maastricht", url: `${SITE_URL}/nl/regio/maastricht`, summary: "AI-integratie en AI-automatisering voor hospitality, zorg, onderwijs, internationale dienstverlening en MKB." },
          { title: "AI-integratie Enschede", url: `${SITE_URL}/nl/regio/enschede`, summary: "AI-integratie en AI-automatisering voor techniek, maakindustrie, onderwijs, startups en MKB." },
          { title: "AI-integratie Almere", url: `${SITE_URL}/nl/regio/almere`, summary: "AI-integratie en AI-automatisering voor groeiend MKB, e-commerce, klantcontact, bouw en backoffice." },
          { title: "AI-integratie Den Haag", url: `${SITE_URL}/nl/regio/den-haag`, summary: "Legal, compliance, zakelijke dienstverlening en kennisorganisaties." },
          { title: "AI-automatisering Breda", url: `${SITE_URL}/nl/regio/breda`, summary: "MKB, logistiek, bouw, installatie, sales en backoffice." },
          { title: "AI-oplossingen Groningen", url: `${SITE_URL}/nl/regio/groningen`, summary: "MKB, energie, support, administratie en operations." },
          { title: "AI-integratie Arnhem", url: `${SITE_URL}/nl/regio/arnhem`, summary: "MKB, techniek, zakelijke dienstverlening en backoffice." },
          { title: "Private AI Eindhoven/Brainport", url: `${SITE_URL}/nl/regio/eindhoven-brainport`, summary: "Technische documentatie, manufacturing, R&D workflows en lokale/private AI." },
        ],
      },
    ],
    lastUpdated: new Date().toISOString().split("T")[0],
  });
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
