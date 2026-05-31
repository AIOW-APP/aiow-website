import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY. Refusing to generate placeholder/fallback audio.");
  process.exit(1);
}

const jobs = [
  {
    lang: "nl",
    input: "content/voice/aiow-gpt-briefing-nl.txt",
    output: "public/aiow/audio/aiow-gpt-voice-briefing-nl.mp3",
    instructions: "Speak in natural Dutch, warm, calm and premium. Confident but not salesy. Clear pacing, intimate briefing style, no exaggerated radio voice."
  },
  {
    lang: "en",
    input: "content/voice/aiow-gpt-briefing-en.txt",
    output: "public/aiow/audio/aiow-gpt-voice-briefing-en.mp3",
    instructions: "Speak in natural English, warm, calm and premium. Confident but not salesy. Clear pacing, intimate briefing style, no exaggerated radio voice."
  }
];

const model = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
const voice = process.env.OPENAI_TTS_VOICE || "marin";

for (const job of jobs) {
  const input = await readFile(job.input, "utf8");
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      voice,
      input,
      instructions: job.instructions,
      response_format: "mp3"
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI TTS failed for ${job.lang}: ${response.status} ${text}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const out = resolve(job.output);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, buffer);
  console.log(`Generated ${job.output} (${buffer.length} bytes) with ${model}/${voice}`);
}
