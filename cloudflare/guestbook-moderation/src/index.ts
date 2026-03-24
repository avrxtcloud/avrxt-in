export interface Env {
  AI: {
    run(model: string, input: unknown): Promise<unknown>;
  };
  MODERATION_SHARED_SECRET: string;
  MODERATION_MODEL?: string;
}

type WorkerModerationRequest = {
  message?: string;
};

type WorkerModerationResult = {
  blocked?: boolean;
  reasons?: unknown;
  categories?: unknown;
  confidence?: string;
};

type WorkerAiTextResponse = {
  response?: string;
};

const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct';
const SAFETY_CATEGORIES = ['hate', 'harassment', 'sexual', 'violence', 'self-harm'] as const;

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
}

function unauthorized(): Response {
  return json({ error: 'Unauthorized' }, { status: 401 });
}

function parseCategories(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function normalizeCategories(categories: string[]): string[] {
  return categories.filter((category) =>
    SAFETY_CATEGORIES.includes(category as (typeof SAFETY_CATEGORIES)[number])
  );
}

function parseModelResponse(raw: string): WorkerModerationResult | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed) as WorkerModerationResult;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as WorkerModerationResult;
    } catch {
      return null;
    }
  }
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'POST' } });
    }

    const authHeader = request.headers.get('Authorization');
    const expected = `Bearer ${env.MODERATION_SHARED_SECRET}`;
    if (!authHeader || authHeader !== expected) {
      return unauthorized();
    }

    let payload: WorkerModerationRequest;
    try {
      payload = (await request.json()) as WorkerModerationRequest;
    } catch {
      return json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const message = payload.message?.trim();
    if (!message) {
      return json({ error: 'Message is required' }, { status: 400 });
    }

    const model = env.MODERATION_MODEL || DEFAULT_MODEL;
    const messages = [
      {
        role: 'system',
        content:
          'You moderate public guestbook messages. Return JSON only with keys blocked:boolean, categories:string[], reasons:string[]. Block messages containing hate, harassment, sexual content, violence, or self-harm. Allow normal greetings, opinions, and non-abusive criticism. Categories must only use: hate, harassment, sexual, violence, self-harm.',
      },
      {
        role: 'user',
        content: `Moderate this guestbook message: ${JSON.stringify(message)}`,
      },
    ];

    try {
      const result = (await env.AI.run(model, {
        messages,
        max_tokens: 128,
        temperature: 0,
      })) as WorkerAiTextResponse;

      const response = parseModelResponse(result.response || '');
      if (!response) {
        throw new Error(`Unparseable model response: ${result.response || '<empty>'}`);
      }

      const categories = normalizeCategories(parseCategories(response?.categories));
      const reasons = parseCategories(response?.reasons);
      const blocked = Boolean(response?.blocked) || categories.length > 0;

      return json({
        blocked,
        reasons: reasons.length > 0 ? reasons : categories,
        categories,
        model,
      });
    } catch (error) {
      console.error('[GUESTBOOK_MODERATION_WORKER] Workers AI call failed:', error);
      return json({ error: 'Workers AI request failed' }, { status: 502 });
    }
  },
};

export default worker;
