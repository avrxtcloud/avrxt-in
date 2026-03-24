-- Persistent blocked term memory for guestbook moderation.
-- This short-circuits known abusive words/phrases before calling Workers AI.

create table if not exists public.guestbook_blocked_terms (
  id bigint generated always as identity primary key,
  term text not null,
  normalized_term text not null unique,
  reason text not null,
  source text not null default 'seed',
  hits bigint not null default 0,
  first_seen_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now())
);

create index if not exists guestbook_blocked_terms_reason_idx
  on public.guestbook_blocked_terms (reason);

create index if not exists guestbook_blocked_terms_last_seen_idx
  on public.guestbook_blocked_terms (last_seen_at desc);

alter table public.guestbook_blocked_terms enable row level security;

insert into public.guestbook_blocked_terms (term, normalized_term, reason, source)
values
  ('nigger', 'nigger', 'heuristic_hate_speech', 'seed'),
  ('faggot', 'faggot', 'heuristic_hate_speech', 'seed'),
  ('kike', 'kike', 'heuristic_hate_speech', 'seed'),
  ('paki', 'paki', 'heuristic_hate_speech', 'seed'),
  ('spic', 'spic', 'heuristic_hate_speech', 'seed'),
  ('chink', 'chink', 'heuristic_hate_speech', 'seed'),
  ('kill yourself', 'kill yourself', 'heuristic_harassment', 'seed'),
  ('kys', 'kys', 'heuristic_harassment', 'seed'),
  ('go die', 'go die', 'heuristic_harassment', 'seed'),
  ('you should die', 'you should die', 'heuristic_harassment', 'seed'),
  ('piece of shit', 'piece of shit', 'heuristic_harassment', 'seed'),
  ('fuck you', 'fuck you', 'heuristic_harassment', 'seed'),
  ('rape', 'rape', 'heuristic_sexual_content', 'seed'),
  ('porn', 'porn', 'heuristic_sexual_content', 'seed'),
  ('nude', 'nude', 'heuristic_sexual_content', 'seed'),
  ('nudes', 'nudes', 'heuristic_sexual_content', 'seed'),
  ('naked pic', 'naked pic', 'heuristic_sexual_content', 'seed'),
  ('naked pics', 'naked pics', 'heuristic_sexual_content', 'seed'),
  ('sexual favor', 'sexual favor', 'heuristic_sexual_content', 'seed'),
  ('sexual favors', 'sexual favors', 'heuristic_sexual_content', 'seed'),
  ('i will kill', 'i will kill', 'heuristic_violence', 'seed'),
  ('shoot you', 'shoot you', 'heuristic_violence', 'seed'),
  ('stab you', 'stab you', 'heuristic_violence', 'seed'),
  ('burn you alive', 'burn you alive', 'heuristic_violence', 'seed'),
  ('suicide method', 'suicide method', 'heuristic_self_harm', 'seed'),
  ('suicide methods', 'suicide methods', 'heuristic_self_harm', 'seed'),
  ('self-harm', 'self-harm', 'heuristic_self_harm', 'seed'),
  ('cut myself', 'cut myself', 'heuristic_self_harm', 'seed'),
  ('end my life', 'end my life', 'heuristic_self_harm', 'seed'),
  ('bitch', 'bitch', 'heuristic_toxic_language', 'seed'),
  ('whore', 'whore', 'heuristic_toxic_language', 'seed'),
  ('slut', 'slut', 'heuristic_toxic_language', 'seed'),
  ('asshole', 'asshole', 'heuristic_toxic_language', 'seed'),
  ('retard', 'retard', 'heuristic_toxic_language', 'seed')
on conflict (normalized_term) do nothing;

-- No public policies by default:
-- service role key bypasses RLS and is used by server-side moderation reads/writes.
