import crypto from 'node:crypto';
import { LRUCache } from 'lru-cache';
import { createClient } from '@/utils/supabase/server';

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

const MODERATION_MODEL =
  process.env.CLOUDFLARE_GUESTBOOK_MODERATION_MODEL || '@cf/meta/llama-3.1-8b-instruct';
const MODERATION_API_URL = process.env.CLOUDFLARE_GUESTBOOK_MODERATION_URL;
const MODERATION_SHARED_SECRET = process.env.CLOUDFLARE_GUESTBOOK_MODERATION_SECRET;
const MODERATION_TIMEOUT_MS = 8000;
const BLOCKED_TERMS_TTL_MS = 1000 * 60 * 5;

function parseDegradedMode(value: string | undefined): ModerationDegradedMode {
  const normalized = (value ?? 'heuristic_allow').trim().toLowerCase();
  if (normalized === 'block') return 'block';
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
];

const moderationCache = new LRUCache<string, ModerationOutcome>({
  max: 5000,
  ttl: 1000 * 60 * 60 * 24,
});

let blockedTermsCache: { fetchedAt: number; terms: any[] } | null = null;

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

function uniqueMatches(matches: any[]): any[] {
  return Array.from(new Map(matches.map((match) => [match.term, match])).values());
}

function findMatchedRuleTerms(normalizedMessage: string): any[] {
  const matches: any[] = [];
  for (const rule of HEURISTIC_RULES) {
    for (const term of rule.terms) {
      if (termToPattern(term).test(normalizedMessage)) {
        matches.push({ term, reason: rule.reason });
      }
    }
  }
  return uniqueMatches(matches);
}

function runHeuristicModeration(normalizedMessage: string): ModerationOutcome {
  const matched = HEURISTIC_RULES.filter((rule) => rule.pattern.test(normalizedMessage)).map((rule) => rule.reason);
  return { blocked: matched.length > 0, reasons: matched };
}

async function getPersistentCache(cacheKey: string): Promise<ModerationOutcome | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('guestbook_moderation_cache')
        .select('*')
        .eq('content_hash', cacheKey)
        .single();

    if (error || !data) return null;

    // Update hits
    await supabase
        .from('guestbook_moderation_cache')
        .update({
            hits: (data.hits || 0) + 1,
            last_seen_at: new Date().toISOString()
        })
        .eq('content_hash', cacheKey);

    return {
      blocked: data.blocked,
      reasons: data.reasons as string[],
    };
  } catch (error) {
    console.error('[GUESTBOOK_MODERATION] Cache read error:', error);
    return null;
  }
}

async function setPersistentCache(cacheKey: string, normalizedMessage: string, outcome: ModerationOutcome) {
  try {
    const supabase = await createClient();
    await supabase
        .from('guestbook_moderation_cache')
        .upsert({
            content_hash: cacheKey,
            normalized_message: normalizedMessage,
            blocked: outcome.blocked,
            reasons: outcome.reasons,
            model: MODERATION_MODEL,
            hits: 1,
            last_seen_at: new Date().toISOString(),
        }, { onConflict: 'content_hash' });
  } catch (error) {
    console.error('[GUESTBOOK_MODERATION] Cache write failed:', error);
  }
}

async function getBlockedTerms(): Promise<any[]> {
  if (blockedTermsCache && Date.now() - blockedTermsCache.fetchedAt < BLOCKED_TERMS_TTL_MS) {
    return blockedTermsCache.terms;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('guestbook_blocked_terms')
        .select('*')
        .order('normalized_term', { ascending: true });

    if (error) throw error;

    const terms = data || [];
    blockedTermsCache = {
      fetchedAt: Date.now(),
      terms,
    };

    return terms;
  } catch (error) {
    console.error('[GUESTBOOK_MODERATION] Blocked term read error:', error);
    return blockedTermsCache?.terms || [];
  }
}

async function recordBlockedTermHits(terms: any[]) {
  if (terms.length === 0) return;
  try {
    const supabase = await createClient();
    for (const { term } of uniqueMatches(terms)) {
      // Get current hits
      const { data } = await supabase
        .from('guestbook_blocked_terms')
        .select('hits')
        .eq('normalized_term', term)
        .single();
        
      await supabase
          .from('guestbook_blocked_terms')
          .update({ 
              hits: (data?.hits || 0) + 1, 
              last_seen_at: new Date().toISOString() 
          })
          .where('normalized_term', 'eq', term);
    }
    blockedTermsCache = null;
  } catch (error) {
    console.error('[GUESTBOOK_MODERATION] Hit update failed:', error);
  }
}

async function upsertBlockedTerms(terms: any[], source: 'heuristic' | 'worker') {
  if (terms.length === 0) return;
  try {
    const supabase = await createClient();
    for (const { term, reason } of uniqueMatches(terms)) {
      // Get current hits if exists
      const { data: existing } = await supabase
        .from('guestbook_blocked_terms')
        .select('hits')
        .eq('normalized_term', term)
        .single();

      await supabase
          .from('guestbook_blocked_terms')
          .upsert({
              term,
              normalized_term: term,
              reason,
              source,
              hits: (existing?.hits || 0) + 1,
              last_seen_at: new Date().toISOString()
          }, { onConflict: 'normalized_term' });
    }
    blockedTermsCache = null;
  } catch (error) {
    console.error('[GUESTBOOK_MODERATION] Blocked term upsert failed:', error);
  }
}

export async function moderateGuestbookMessage(message: string): Promise<ModerationOutcome & { cached: boolean }> {
  const normalized = normalizeMessage(message);
  if (!normalized) return { blocked: false, reasons: [], cached: true };

  const cacheKey = hashMessage(normalized);
  const cached = moderationCache.get(cacheKey);
  if (cached) return { ...cached, cached: true };

  const persistent = await getPersistentCache(cacheKey);
  if (persistent) {
    moderationCache.set(cacheKey, persistent);
    return { ...persistent, cached: true };
  }

  const blockedTerms = await getBlockedTerms();
  const matchedBlockedTerms = blockedTerms
      .filter((term) => termToPattern(term.normalized_term || term.normalizedTerm).test(normalized))
      .map((term) => ({ term: term.normalized_term || term.normalizedTerm, reason: term.reason }));

  if (matchedBlockedTerms.length > 0) {
    await recordBlockedTermHits(matchedBlockedTerms);
    const outcome = { blocked: true, reasons: matchedBlockedTerms.map((m) => `blocked_term:${m.term}`) };
    moderationCache.set(cacheKey, outcome);
    await setPersistentCache(cacheKey, normalized, outcome);
    return { ...outcome, cached: false };
  }

  if (!MODERATION_API_URL || !MODERATION_SHARED_SECRET) {
      const heuristic = runHeuristicModeration(normalized);
      moderationCache.set(cacheKey, heuristic);
      await setPersistentCache(cacheKey, normalized, heuristic);
      return { ...heuristic, cached: false };
  }

  try {
    const response = await fetch(MODERATION_API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${MODERATION_SHARED_SECRET}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: normalized }),
    });

    if (!response.ok) {
        const heuristic = runHeuristicModeration(normalized);
        return { ...heuristic, cached: false };
    }

    const data = (await response.json()) as CloudflareWorkerModerationResponse;
    const reasons = parseReasons(data.reasons || data.categories);
    const blocked = Boolean(data.blocked);
    const finalReasons = reasons.length > 0 ? reasons : (blocked ? ['unsafe'] : []);

    if (blocked) {
      await upsertBlockedTerms(findMatchedRuleTerms(normalized), 'worker');
    }

    const outcome: ModerationOutcome = { blocked, reasons: finalReasons };
    moderationCache.set(cacheKey, outcome);
    await setPersistentCache(cacheKey, normalized, outcome);
    return { ...outcome, cached: false };
  } catch (error) {
    const heuristic = runHeuristicModeration(normalized);
    return { ...heuristic, cached: false };
  }
}

