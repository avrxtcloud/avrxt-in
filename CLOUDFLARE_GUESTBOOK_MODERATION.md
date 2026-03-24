# Guestbook Moderation via Cloudflare Workers AI

This repo now expects guestbook moderation to happen through a small Cloudflare Worker that calls Workers AI with `@cf/meta/llama-3.1-8b-instruct`.

## 1. Cloudflare setup

From `C:\Users\Administrator\Documents\Playground\avrxt-in\cloudflare\guestbook-moderation`:

```bash
npx wrangler login
npx wrangler secret put MODERATION_SHARED_SECRET
npx wrangler deploy
```

Use a long random value for `MODERATION_SHARED_SECRET` and keep the same value in Vercel.

After deploy, copy the Worker URL. Example:

```text
https://avrxt-guestbook-moderation.<your-subdomain>.workers.dev
```

If you want a custom domain, add it in the Cloudflare Worker dashboard after the first deploy.

## 2. Vercel environment variables

Add these server-side variables in Vercel:

```text
CLOUDFLARE_GUESTBOOK_MODERATION_URL=https://your-worker-url.workers.dev
CLOUDFLARE_GUESTBOOK_MODERATION_SECRET=<same secret used in Cloudflare>
CLOUDFLARE_GUESTBOOK_MODERATION_MODEL=@cf/meta/llama-3.1-8b-instruct
SUPABASE_SERVICE_ROLE_KEY=<existing required key for moderation cache>
GUESTBOOK_MODERATION_DEGRADED_MODE=block|heuristic_allow
```

`CLOUDFLARE_GUESTBOOK_MODERATION_MODEL` is optional in Vercel. It is only used for cache metadata in this app. The Worker itself uses `MODERATION_MODEL` from `wrangler.jsonc`.

## 3. Notes

- The Next.js app stays on Vercel.
- The Worker does the model inference on Cloudflare.
- Guestbook moderation still uses the existing in-memory and Supabase-backed cache.
- Apply both Supabase migrations before production use:
  - `supabase/migrations/20260307_guestbook_moderation_cache.sql`
  - `supabase/migrations/20260308_guestbook_blocked_terms.sql`
- If `GUESTBOOK_MODERATION_DEGRADED_MODE=block`, guestbook writes fail closed when the Worker is unavailable.
- If `GUESTBOOK_MODERATION_DEGRADED_MODE=heuristic_allow` (the default), the app falls back to local regex heuristics when the Worker is unavailable.
