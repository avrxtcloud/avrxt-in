import crypto from 'node:crypto';
import { LRUCache } from 'lru-cache';
import { createAdminClient } from '@/utils/supabase/admin';

type ModerationOutcome = {
  blocked: boolean;
  reasons: string[];
};

type OpenAIModerationResponse = {
  results?: Array<{
    flagged?: boolean;
    categories?: Record<string, boolean | null | undefined>;
  }>;
};

type ModerationCacheRow = {
  blocked: boolean | null;
  reasons: unknown;
  hits: number | null;
};

const MODERATION_MODEL = process.env.OPENAI_MODERATION_MODEL || 'omni-moderation-latest';
const MODERATION_TIMEOUT_MS = 8000;
const TARGET_CATEGORY_PREFIXES = ['hate', 'harassment', 'sexual', 'violence', 'self-harm'];
const CACHE_TABLE = 'guestbook_moderation_cache';

const moderationCache = new LRUCache<string, ModerationOutcome>({
  max: 5000,
  ttl: 1000 * 60 * 60 * 24,
});

function normalizeMessage(message: string): string {
  return message.trim().toLowerCase().replace(/\s+/g, ' ');
}

function hashMessage(message: string): string {
  return crypto.createHash('sha256').update(message).digest('hex');
}

function extractMatchedCategories(categories: Record<string, boolean | null | undefined> | undefined): string[] {
  if (!categories) return [];

  return Object.entries(categories)
    .filter(([category, isFlagged]) => {
      if (!isFlagged) return false;
      return TARGET_CATEGORY_PREFIXES.some((prefix) => category === prefix || category.startsWith(`${prefix}/`));
    })
    .map(([category]) => category);
}

function parseReasons(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

async function getPersistentCache(cacheKey: string): Promise<ModerationOutcome | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(CACHE_TABLE)
      .select('blocked,reasons,hits')
      .eq('content_hash', cacheKey)
      .maybeSingle<ModerationCacheRow>();

    if (error || !data) {
      if (error) {
        console.error('[GUESTBOOK_MODERATION] Supabase cache read error:', error.message);
      }
      return null;
    }

    const outcome: ModerationOutcome = {
      blocked: Boolean(data.blocked),
      reasons: parseReasons(data.reasons),
    };

    await supabase
      .from(CACHE_TABLE)
      .update({
        hits: (data.hits || 0) + 1,
        last_seen_at: new Date().toISOString(),
      })
      .eq('content_hash', cacheKey);

    return outcome;
  } catch (error) {
    console.error('[GUESTBOOK_MODERATION] Supabase cache unavailable:', error);
    return null;
  }
}

async function setPersistentCache(cacheKey: string, normalizedMessage: string, outcome: ModerationOutcome) {
  try {
    const supabase = createAdminClient();
    await supabase.from(CACHE_TABLE).upsert(
      {
        content_hash: cacheKey,
        normalized_message: normalizedMessage,
        blocked: outcome.blocked,
        reasons: outcome.reasons,
        model: MODERATION_MODEL,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'content_hash' }
    );
  } catch (error) {
    console.error('[GUESTBOOK_MODERATION] Supabase cache write failed:', error);
  }
}

export async function moderateGuestbookMessage(message: string): Promise<ModerationOutcome & { cached: boolean }> {
  const normalized = normalizeMessage(message);
  if (!normalized) {
    return { blocked: false, reasons: [], cached: true };
  }

  const cacheKey = hashMessage(normalized);
  const cached = moderationCache.get(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }

  const persistent = await getPersistentCache(cacheKey);
  if (persistent) {
    moderationCache.set(cacheKey, persistent);
    return { ...persistent, cached: true };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const outcome: ModerationOutcome = {
      blocked: true,
      reasons: ['moderation_not_configured'],
    };
    moderationCache.set(cacheKey, outcome);
    await setPersistentCache(cacheKey, normalized, outcome);
    return { ...outcome, cached: false };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MODERATION_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODERATION_MODEL,
        input: normalized,
      }),
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      const outcome: ModerationOutcome = {
        blocked: true,
        reasons: ['moderation_api_unavailable'],
      };
      moderationCache.set(cacheKey, outcome);
      await setPersistentCache(cacheKey, normalized, outcome);
      return { ...outcome, cached: false };
    }

    const data = (await response.json()) as OpenAIModerationResponse;
    const result = data.results?.[0];
    const matched = extractMatchedCategories(result?.categories);
    const blocked = matched.length > 0 || Boolean(result?.flagged && matched.length === 0);
    const reasons = matched.length > 0 ? matched : blocked ? ['flagged'] : [];

    const outcome: ModerationOutcome = { blocked, reasons };
    moderationCache.set(cacheKey, outcome);
    await setPersistentCache(cacheKey, normalized, outcome);
    return { ...outcome, cached: false };
  } catch (error) {
    console.error('[GUESTBOOK_MODERATION] API call failed:', error);
    const outcome: ModerationOutcome = {
      blocked: true,
      reasons: ['moderation_api_error'],
    };
    moderationCache.set(cacheKey, outcome);
    await setPersistentCache(cacheKey, normalized, outcome);
    return { ...outcome, cached: false };
  } finally {
    clearTimeout(timer);
  }
}
