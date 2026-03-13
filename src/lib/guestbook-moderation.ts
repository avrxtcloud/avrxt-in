import crypto from 'node:crypto';
import { LRUCache } from 'lru-cache';
import { createAdminClient } from '@/utils/supabase/admin';

type ModerationOutcome = {
  blocked: boolean;
  reasons: string[];
};

type ModerationDegradedMode = 'block' | 'heuristic_allow';

type CloudflareWorkerModerationResponse = {
  blocked?: boolean;
  reasons?: unknown;
  categories?: unknown;
  model?: string;
};

type ModerationCacheRow = {
  blocked: boolean | null;
  reasons: unknown;
  hits: number | null;
};

type BlockedTermRow = {
  id: number;
  term: string;
  normalized_term: string;
  reason: string;
  hits: number | null;
};

type BlockedTermMatch = {
  term: string;
  reason: string;
};

const MODERATION_MODEL =
  process.env.CLOUDFLARE_GUESTBOOK_MODERATION_MODEL || '@cf/meta/llama-3.1-8b-instruct';
const MODERATION_API_URL = process.env.CLOUDFLARE_GUESTBOOK_MODERATION_URL;
const MODERATION_SHARED_SECRET = process.env.CLOUDFLARE_GUESTBOOK_MODERATION_SECRET;
const MODERATION_TIMEOUT_MS = 8000;
const CACHE_TABLE = 'guestbook_moderation_cache';
const BLOCKED_TERMS_TABLE = 'guestbook_blocked_terms';
const BLOCKED_TERMS_TTL_MS = 1000 * 60 * 5;

function parseDegradedMode(value: string | undefined): ModerationDegradedMode {
  const normalized = (value ?? 'heuristic_allow').trim().toLowerCase();

  if (normalized === 'block') return 'block';
  if (
    normalized === 'heuristic_allow' ||
    normalized === 'heuristic-allow' ||
    normalized === 'heuristic' ||
    normalized === 'allow'
  ) {
    return 'heuristic_allow';
  }

  return 'heuristic_allow';
}

const MODERATION_DEGRADED_MODE: ModerationDegradedMode = parseDegradedMode(
  process.env.GUESTBOOK_MODERATION_DEGRADED_MODE
);

const HEURISTIC_RULES: Array<{ reason: string; terms: string[]; pattern: RegExp }> = [
  {
    reason: 'heuristic_hate_speech',
    terms: ['nigger', 'faggot', 'kike', 'paki', 'spic', 'chink'],
    pattern: /\b(?:nigger|faggot|kike|paki|spic|chink)\b/i,
  },
  {
    reason: 'heuristic_harassment',
    terms: ['kill yourself', 'kys', 'go die', 'you should die', 'piece of shit', 'fuck you'],
    pattern: /\b(?:kill yourself|kys|go die|you should die|piece of shit|fuck you)\b/i,
  },
  {
    reason: 'heuristic_sexual_content',
    terms: ['rape', 'porn', 'nude', 'nudes', 'naked pic', 'naked pics', 'sexual favor', 'sexual favors'],
    pattern: /\b(?:rape|porn|nudes?|naked pics?|sexual favors?)\b/i,
  },
  {
    reason: 'heuristic_violence',
    terms: ['i will kill', 'shoot you', 'stab you', 'burn you alive'],
    pattern: /\b(?:i will kill|shoot you|stab you|burn you alive)\b/i,
  },
  {
    reason: 'heuristic_self_harm',
    terms: ['suicide method', 'suicide methods', 'self-harm', 'cut myself', 'end my life'],
    pattern: /\b(?:suicide methods?|self-harm|cut myself|end my life)\b/i,
  },
  {
    reason: 'heuristic_toxic_language',
    terms: ['bitch', 'whore', 'slut', 'asshole', 'retard'],
    pattern: /\b(?:bitch|whore|slut|asshole|retard)\b/i,
  },
];

const moderationCache = new LRUCache<string, ModerationOutcome>({
  max: 5000,
  ttl: 1000 * 60 * 60 * 24,
});

let blockedTermsCache:
  | {
      fetchedAt: number;
      terms: BlockedTermRow[];
    }
  | null = null;

function normalizeMessage(message: string): string {
  return message.trim().toLowerCase().replace(/\s+/g, ' ');
}

function hashMessage(message: string): string {
  return crypto.createHash('sha256').update(message).digest('hex');
}

function parseReasons(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function termToPattern(term: string): RegExp {
  const escaped = escapeRegExp(term).replace(/\s+/g, '\\s+');
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
}

function uniqueMatches(matches: BlockedTermMatch[]): BlockedTermMatch[] {
  return Array.from(new Map(matches.map((match) => [match.term, match])).values());
}

function findMatchedRuleTerms(normalizedMessage: string): BlockedTermMatch[] {
  const matches: BlockedTermMatch[] = [];

  for (const rule of HEURISTIC_RULES) {
    for (const term of rule.terms) {
      if (termToPattern(term).test(normalizedMessage)) {
        matches.push({
          term,
          reason: rule.reason,
        });
      }
    }
  }

  return uniqueMatches(matches);
}

function runHeuristicModeration(normalizedMessage: string): ModerationOutcome {
  const matched = HEURISTIC_RULES.filter((rule) => rule.pattern.test(normalizedMessage)).map((rule) => rule.reason);
  return {
    blocked: matched.length > 0,
    reasons: matched,
  };
}

function mapApiStatusToReason(status: number): string {
  if (status === 429) return 'moderation_api_rate_limited';
  if (status === 401 || status === 403) return 'moderation_worker_auth_failed';
  if (status === 404) return 'moderation_worker_not_found';
  if (status >= 500) return 'moderation_api_unavailable';
  return 'moderation_worker_error';
}

async function cacheAndReturn(
  cacheKey: string,
  normalizedMessage: string,
  outcome: ModerationOutcome
): Promise<ModerationOutcome & { cached: boolean }> {
  moderationCache.set(cacheKey, outcome);
  await setPersistentCache(cacheKey, normalizedMessage, outcome);
  return { ...outcome, cached: false };
}

async function fallbackOnUnavailable(
  cacheKey: string,
  normalizedMessage: string,
  baseReason: string
): Promise<ModerationOutcome & { cached: boolean }> {
  if (MODERATION_DEGRADED_MODE === 'heuristic_allow') {
    const matchedTerms = findMatchedRuleTerms(normalizedMessage);
    await upsertBlockedTerms(matchedTerms, 'heuristic');
    const heuristicOutcome = runHeuristicModeration(normalizedMessage);
    return cacheAndReturn(cacheKey, normalizedMessage, heuristicOutcome);
  }

  return cacheAndReturn(cacheKey, normalizedMessage, {
    blocked: true,
    reasons: [baseReason],
  });
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

async function getBlockedTerms(): Promise<BlockedTermRow[]> {
  if (blockedTermsCache && Date.now() - blockedTermsCache.fetchedAt < BLOCKED_TERMS_TTL_MS) {
    return blockedTermsCache.terms;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(BLOCKED_TERMS_TABLE)
      .select('id,term,normalized_term,reason,hits')
      .order('normalized_term', { ascending: true });

    if (error) {
      console.error('[GUESTBOOK_MODERATION] Blocked term read error:', error.message);
      return blockedTermsCache?.terms || [];
    }

    const terms = (data || []) as BlockedTermRow[];
    blockedTermsCache = {
      fetchedAt: Date.now(),
      terms,
    };

    return terms;
  } catch (error) {
    console.error('[GUESTBOOK_MODERATION] Blocked term cache unavailable:', error);
    return blockedTermsCache?.terms || [];
  }
}

function findMatchedBlockedTerms(normalizedMessage: string, blockedTerms: BlockedTermRow[]): BlockedTermMatch[] {
  return uniqueMatches(
    blockedTerms
      .filter((term) => termToPattern(term.normalized_term).test(normalizedMessage))
      .map((term) => ({
        term: term.normalized_term,
        reason: term.reason,
      }))
  );
}

async function recordBlockedTermHits(terms: BlockedTermMatch[]) {
  if (terms.length === 0) return;

  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const uniqueTerms = uniqueMatches(terms);

    for (const { term, reason } of uniqueTerms) {
      const { data, error } = await supabase
        .from(BLOCKED_TERMS_TABLE)
        .select('id,hits')
        .eq('normalized_term', term)
        .maybeSingle<{ id: number; hits: number | null }>();

      if (error) {
        console.error('[GUESTBOOK_MODERATION] Blocked term hit read failed:', error.message);
        continue;
      }

      if (!data) {
        await supabase.from(BLOCKED_TERMS_TABLE).insert({
          term,
          normalized_term: term,
          reason,
          hits: 1,
          last_seen_at: now,
        });
        continue;
      }

      await supabase
        .from(BLOCKED_TERMS_TABLE)
        .update({
          hits: (data.hits || 0) + 1,
          last_seen_at: now,
        })
        .eq('id', data.id);
    }

    blockedTermsCache = null;
  } catch (error) {
    console.error('[GUESTBOOK_MODERATION] Blocked term hit update failed:', error);
  }
}

async function upsertBlockedTerms(terms: BlockedTermMatch[], source: 'heuristic' | 'worker') {
  if (terms.length === 0) return;

  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const uniqueTerms = uniqueMatches(terms);

    for (const { term, reason } of uniqueTerms) {
      const { data, error } = await supabase
        .from(BLOCKED_TERMS_TABLE)
        .select('id,hits')
        .eq('normalized_term', term)
        .maybeSingle<{ id: number; hits: number | null }>();

      if (error) {
        console.error('[GUESTBOOK_MODERATION] Blocked term write read failed:', error.message);
        continue;
      }

      if (!data) {
        await supabase.from(BLOCKED_TERMS_TABLE).insert({
          term,
          normalized_term: term,
          reason,
          source,
          hits: 1,
          last_seen_at: now,
        });
        continue;
      }

      await supabase
        .from(BLOCKED_TERMS_TABLE)
        .update({
          reason,
          source,
          hits: (data.hits || 0) + 1,
          last_seen_at: now,
        })
        .eq('id', data.id);
    }

    blockedTermsCache = null;
  } catch (error) {
    console.error('[GUESTBOOK_MODERATION] Blocked term upsert failed:', error);
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

  const blockedTerms = await getBlockedTerms();
  const matchedBlockedTerms = findMatchedBlockedTerms(normalized, blockedTerms);
  if (matchedBlockedTerms.length > 0) {
    await recordBlockedTermHits(matchedBlockedTerms);
    return cacheAndReturn(cacheKey, normalized, {
      blocked: true,
      reasons: matchedBlockedTerms.map((match) => `blocked_term:${match.term}`),
    });
  }

  if (!MODERATION_API_URL || !MODERATION_SHARED_SECRET) {
    return fallbackOnUnavailable(cacheKey, normalized, 'moderation_not_configured');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MODERATION_TIMEOUT_MS);

  try {
    const response = await fetch(MODERATION_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MODERATION_SHARED_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: normalized,
      }),
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      return fallbackOnUnavailable(cacheKey, normalized, mapApiStatusToReason(response.status));
    }

    const data = (await response.json()) as CloudflareWorkerModerationResponse;
    const reasons = parseReasons(data.reasons);
    const categories = parseReasons(data.categories);
    const blocked = Boolean(data.blocked);
    const normalizedReasons =
      reasons.length > 0 ? reasons : categories.length > 0 ? categories : blocked ? ['unsafe'] : [];

    if (blocked) {
      await upsertBlockedTerms(findMatchedRuleTerms(normalized), 'worker');
    }

    const outcome: ModerationOutcome = { blocked, reasons: normalizedReasons };
    return cacheAndReturn(cacheKey, normalized, outcome);
  } catch (error) {
    console.error('[GUESTBOOK_MODERATION] API call failed:', error);
    return fallbackOnUnavailable(cacheKey, normalized, 'moderation_api_error');
  } finally {
    clearTimeout(timer);
  }
}
