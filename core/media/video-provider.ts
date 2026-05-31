export type VideoProvider = 'grok' | 'kling';

export type ImageToVideoRequest = {
  imageUrl: string;
  prompt: string;
  durationSeconds?: number;
  provider?: VideoProvider;
  fallbackProvider?: VideoProvider;
  idempotencyKey?: string;
};

export type VideoGenerationResult = {
  provider: VideoProvider;
  status: 'submitted' | 'failed';
  id?: string;
  videoUrl?: string;
  model?: string;
  durationSeconds: number;
  estimatedCostUsd?: number;
  latencyMs: number;
  fallbackUsed?: boolean;
  failureReason?: string;
};

export const DEFAULT_VIDEO_PROVIDER: VideoProvider = 'grok';
export const DEFAULT_FALLBACK_VIDEO_PROVIDER: VideoProvider = 'kling';
export const GROK_IMAGE_TO_VIDEO_MODEL = 'grok-imagine-video';
export const GROK_PRICE_PER_SECOND_USD = 0.05;

export function redactVideoProviderError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? 'unknown error');
  return raw
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, 'Bearer [REDACTED]')
    .replace(/xai-[A-Za-z0-9._\-]+/gi, '[REDACTED]')
    .replace(/sk-[A-Za-z0-9._\-]+/gi, '[REDACTED]')
    .slice(0, 500);
}

function validateRequest(request: ImageToVideoRequest) {
  if (!request.imageUrl || !/^https?:\/\//i.test(request.imageUrl)) {
    throw new Error('imageUrl must be a public http(s) URL for image-to-video generation');
  }
  if (!request.prompt?.trim()) throw new Error('prompt is required for image-to-video generation');
}

export function estimateVideoCostUsd(provider: VideoProvider, durationSeconds = 12): number | undefined {
  if (provider === 'grok') return Number((Math.max(1, durationSeconds) * GROK_PRICE_PER_SECOND_USD).toFixed(2));
  return undefined;
}

async function generateWithGrok(request: ImageToVideoRequest): Promise<VideoGenerationResult> {
  validateRequest(request);
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error('XAI_API_KEY is not configured');
  const durationSeconds = request.durationSeconds || 12;
  const started = Date.now();
  const response = await fetch('https://api.x.ai/v1/video/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(request.idempotencyKey ? { 'Idempotency-Key': request.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      model: GROK_IMAGE_TO_VIDEO_MODEL,
      prompt: request.prompt,
      image_url: request.imageUrl,
      duration: durationSeconds,
    }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`xAI Grok video request failed ${response.status}: ${text}`);
  const data = text ? JSON.parse(text) : {};
  return {
    provider: 'grok',
    status: 'submitted',
    id: data.id || data.generation_id,
    videoUrl: data.video_url || data.output?.video_url || data.data?.[0]?.url,
    model: GROK_IMAGE_TO_VIDEO_MODEL,
    durationSeconds,
    estimatedCostUsd: estimateVideoCostUsd('grok', durationSeconds),
    latencyMs: Date.now() - started,
  };
}

async function generateWithKlingFallback(request: ImageToVideoRequest, failureReason?: string): Promise<VideoGenerationResult> {
  validateRequest(request);
  const durationSeconds = request.durationSeconds || 12;
  const started = Date.now();
  // Existing Kling production is currently asset/manual-pipeline based. Keep it as the explicit fallback contract
  // until the upstream Kling API credentials/endpoint are wired here.
  return {
    provider: 'kling',
    status: 'failed',
    durationSeconds,
    latencyMs: Date.now() - started,
    fallbackUsed: true,
    failureReason: failureReason || 'Kling fallback selected; external Kling API adapter not configured in this repo yet.',
  };
}

export async function generateImageToVideo(request: ImageToVideoRequest): Promise<VideoGenerationResult> {
  const provider = request.provider || DEFAULT_VIDEO_PROVIDER;
  const fallbackProvider = request.fallbackProvider || DEFAULT_FALLBACK_VIDEO_PROVIDER;
  try {
    if (provider === 'grok') return await generateWithGrok(request);
    return await generateWithKlingFallback(request);
  } catch (error) {
    const failureReason = redactVideoProviderError(error);
    if (provider !== fallbackProvider && fallbackProvider === 'kling') {
      return generateWithKlingFallback(request, failureReason);
    }
    return {
      provider,
      status: 'failed',
      durationSeconds: request.durationSeconds || 12,
      estimatedCostUsd: estimateVideoCostUsd(provider, request.durationSeconds || 12),
      latencyMs: 0,
      failureReason,
    };
  }
}
