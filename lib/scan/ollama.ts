// Server-side Ollama client — calls our Big Mac tunnel.
// Env: OLLAMA_TUNNEL_URL, OLLAMA_PROXY_TOKEN.

export const OLLAMA_URL = process.env.OLLAMA_TUNNEL_URL || "";
export const OLLAMA_TOKEN = process.env.OLLAMA_PROXY_TOKEN || "";

export type OllamaStreamChunk = {
  model: string;
  response: string;
  done: boolean;
};

export async function ollamaGenerate(
  model: string,
  prompt: string,
  opts: { temperature?: number; num_predict?: number; system?: string } = {},
): Promise<string> {
  if (!OLLAMA_URL || !OLLAMA_TOKEN) throw new Error("Ollama not configured");
  const body: any = {
    model,
    prompt,
    stream: false,
    options: {
      temperature: opts.temperature ?? 0.4,
      num_predict: opts.num_predict ?? 800,
    },
  };
  if (opts.system) body.system = opts.system;

  const r = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Proxy-Token": OLLAMA_TOKEN,
    },
    body: JSON.stringify(body),
    // 4 minute timeout — large models can be slow
    signal: AbortSignal.timeout(240_000),
  });
  if (!r.ok) throw new Error(`Ollama HTTP ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return String(j.response || "");
}

export async function ollamaStream(
  model: string,
  prompt: string,
  opts: { temperature?: number; num_predict?: number; system?: string } = {},
): Promise<ReadableStream<Uint8Array>> {
  if (!OLLAMA_URL || !OLLAMA_TOKEN) throw new Error("Ollama not configured");
  const body: any = {
    model,
    prompt,
    stream: true,
    options: {
      temperature: opts.temperature ?? 0.4,
      num_predict: opts.num_predict ?? 800,
    },
  };
  if (opts.system) body.system = opts.system;

  const r = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Proxy-Token": OLLAMA_TOKEN,
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Ollama HTTP ${r.status}`);
  if (!r.body) throw new Error("No stream body");

  // Re-encode Ollama's NDJSON into a simpler text stream for client SSE.
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  return new ReadableStream({
    async start(controller) {
      const reader = r.body!.getReader();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line) continue;
          try {
            const j = JSON.parse(line);
            if (j.response) controller.enqueue(enc.encode(j.response));
            if (j.done) {
              controller.close();
              return;
            }
          } catch {}
        }
      }
      controller.close();
    },
  });
}
