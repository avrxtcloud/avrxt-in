# avrxt-in Analysis Report (Branch: codex/v3fix) 

- Repository: https://github.com/avrxtcloud/avrxt-in
- Branch analyzed: `codex/v3fix` (checked out locally)
- Analysis date (UTC): 2026-03-07
- Environment: Node/npm local install, static checks + manual code review

## 1) Automated Check Results

### Build
- Command: `npm run build`
- Result: PASS
- Notes: Next.js production build completed and all routes generated successfully.

### Lint
- Command: `npm run lint` (also captured as JSON with `npx eslint . -f json -o lint-report.json`)
- Result: FAIL
- Totals: **68 errors**, **58 warnings** (126 total)
- Top failing rules:
  - `@typescript-eslint/no-explicit-any`: 52
  - `@typescript-eslint/no-unused-vars`: 37
  - `@next/next/no-img-element`: 17
  - `react/jsx-no-comment-textnodes`: 6
  - `@typescript-eslint/no-non-null-asserted-optional-chain`: 5

Most affected files:
- `src/app/me/MeClient.tsx`: 25
- `src/app/me/admin/MeAdminClient.tsx`: 23
- `src/app/cloud/[service]/BookingForm.tsx`: 8
- `src/app/guestbook/GuestbookClient.tsx`: 6
- `src/app/cupcake/CupcakeForm.tsx`: 5

### Dependency Security (npm audit)
- Command: `npm audit --json` (saved to `audit-report.json`)
- Result: FAIL
- Totals: **24 vulnerabilities**
  - Critical: 1
  - High: 21
  - Moderate: 1
  - Low: 1

Notable vulnerable packages:
- `next` (direct): vulnerable range includes current `16.1.1`; fix available `16.1.6`
- `fast-xml-parser` (critical, transitive)
- multiple `@aws-sdk/*` transitive high vulnerabilities
- `axios` high, `minimatch` high, `ajv` moderate, `qs` low

## 2) Manual Review Findings (Prioritized)

### [Critical] Price-on-request flow is functionally broken
- Evidence:
  - `src/app/cloud/[service]/BookingForm.tsx:44` sends hardcoded fake payment payload:
    - `razorpay_order_id: 'FREE_TIER'`
    - `razorpay_payment_id: 'LEAD_CAPTURE'`
    - `razorpay_signature: 'VALID'`
  - `src/app/actions/cloud.ts:54-60` always verifies signature cryptographically and rejects mismatch.
- Impact:
  - “Price on Request” submissions will fail verification and never complete as intended.

### [Critical] Server trusts client-provided price for cloud payments
- Evidence:
  - Client sends selected price: `src/app/cloud/[service]/BookingForm.tsx:82,107`
  - Server creates order from user-controlled `amount`: `src/app/actions/cloud.ts:21`
  - Server stores `bookingDetails.amount` directly after signature check: `src/app/actions/cloud.ts:73`
- Impact:
  - Price integrity can be bypassed by tampering request payloads; users can underpay and still create booked records.
- Why signature check is not enough:
  - Signature proves Razorpay signed *an order*, not that server-side expected service price equals paid amount.

### [High] OAuth callback open redirect risk via unsanitized `next`
- Evidence:
  - Reads user-controlled query param: `src/app/auth/callback/route.ts:8`
  - Redirects with `new URL(next, request.url)`: `src/app/auth/callback/route.ts:63`
- Impact:
  - Can redirect authenticated users to attacker-controlled domains if absolute URLs are provided in `next`.

### [High] Spotify OAuth lacks state verification and strong admin gate
- Evidence:
  - OAuth auth URL contains no `state`: `src/app/api/spotify/auth/route.ts:15`
  - Callback does not validate `state`, directly exchanges code and writes tokens:
    - `src/app/api/spotify/callback/route.ts:39-43`
- Impact:
  - Missing CSRF protection in OAuth flow.
  - Token storage endpoint is sensitive but not clearly enforcing admin-only access within route itself.

### [Medium] Cupcake amount persistence trusts client payload
- Evidence:
  - Client sends `amount: finalAmount`: `src/app/cupcake/CupcakeForm.tsx:61`
  - Server stores `tipDetails.amount` directly: `src/app/actions/cupcake.ts:66`
- Impact:
  - Stored/displayed tip amounts can diverge from actual paid amount unless verified against Razorpay order/payment data.

### [Medium] Contact/Hireme APIs inject raw user input into HTML emails
- Evidence:
  - Contact: `${message}` in HTML template at `src/app/api/contact/route.ts:73`
  - Hireme: `${description}` in HTML template at `src/app/api/hireme/route.ts:90`
- Impact:
  - HTML injection in outgoing email content; can lead to phishing-like content in inbox previews/clients.

### [Medium] Weak anti-abuse posture on public form APIs
- Evidence:
  - CORS wildcard in OPTIONS: `src/app/api/contact/route.ts:99`, `src/app/api/hireme/route.ts:131`, `src/app/api/subscribe/route.ts:221`
  - Subscribe rate key uses `x-forwarded-for` directly: `src/app/api/subscribe/route.ts:67`
- Impact:
  - Easy origin-agnostic request generation and IP spoofing edge cases can reduce effectiveness of anti-spam controls.

### [Low] Supabase admin client silently falls back to anon key
- Evidence:
  - `src/utils/supabase/admin.ts:15` uses `SUPABASE_SERVICE_ROLE_KEY || NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Impact:
  - Sensitive flows may silently degrade instead of failing fast, making auth behavior inconsistent and harder to reason about.

## 3) Warning/Quality Inventory

Primary quality risks from lint output:
- Type-safety debt (`any`) across server actions and clients.
- Multiple unescaped JSX entities and comment text-node issues that can break UX or fail CI.
- Image optimization and accessibility warnings (`<img>` usage and missing alt text).
- Hook correctness warnings (`react-hooks/exhaustive-deps`, `set-state-in-effect`).

## 4) Generated Artifacts (full data)

- Full ESLint findings (all files, all messages): `lint-report.json`
- Full npm audit payload: `audit-report.json`

## 5) Recommended Fix Order

1. Fix cloud payment integrity and price-on-request flow first (critical business/security impact).
2. Add OAuth state handling and sanitize callback redirects.
3. Enforce strict admin authorization on Spotify token mutation path.
4. Verify persisted payment/tip amount server-side against gateway response/order record.
5. Escape/sanitize user-provided HTML content in mail templates.
6. Reduce lint errors in core admin/client files to stabilize CI and maintainability.
7. Upgrade dependencies (`next` to `16.1.6` and apply audit remediations).
