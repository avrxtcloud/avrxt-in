-- Persistent moderation memory for guestbook messages
-- Run this in Supabase SQL editor (or via Supabase migrations) before enabling production use.

create table if not exists public.guestbook_moderation_cache (
  content_hash text primary key,
  normalized_message text not null,
  blocked boolean not null,
  reasons jsonb not null default '[]'::jsonb,
  model text not null,
  hits bigint not null default 1,
  first_seen_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now())
);

create index if not exists guestbook_moderation_cache_last_seen_idx
  on public.guestbook_moderation_cache (last_seen_at desc);

create index if not exists guestbook_moderation_cache_blocked_idx
  on public.guestbook_moderation_cache (blocked);

alter table public.guestbook_moderation_cache enable row level security;

-- No public policies by default:
-- service role key bypasses RLS and is used by server-side moderation cache writes/reads.
