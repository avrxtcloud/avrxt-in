# 🌑 PRD: Dark Mesh Bio (Beta) - Premium Personal Engine & Digital Infrastructure

## 1. Executive Summary
**Dark Mesh Bio (Beta)** is a high-performance, full-stack personal infrastructure platform built on the **"Digital Obsidian"** design system. Moving beyond a simple link-in-bio, the Beta version transforms into a comprehensive personal engine, integrating professional documentation, project intake estimators, and an intelligent music synchronization layer.

Designed for creators who operate at the intersection of technology and art, it offers enterprise-grade security, automated SEO orchestration, and real-time telemetry, all controlled through a multi-node admin ecosystem.

---

## 2. Product Vision & Strategy

### 2.1 Mission Statement
To provide a sovereign, high-fidelity digital identity that acts as both a professional folio and a real-time activity hub, blurring the lines between static web presence and live interactive experience.

### 2.2 Core Value Pillars
- **Immersive Presence**: Real-time Spotify and Discord telemetry that makes the site feel "alive."
- **Institutional Quality**: Technical libraries and service intake systems used by professional consultants.
- **Edge-First Architecture**: Optimized for Vercel Edge Network and Cloudflare WAF for sub-second LCP.
- **Data Governance**: 100% user-owned infrastructure with compliance for DPDP Act 2023 and GDPR.

---

## 3. Target Audience
1.  **Professional Consultants**: Needing automated lead capture (`/hireme`) and technical documentation (`/docs`).
2.  **High-End Creators**: Requiring a premium aesthetic that matches their brand's sophistication.
3.  **Infrastructure Engineers**: Users who value hardened security (TLS 1.3, CSP) and self-hosted control.
4.  **Community Leaders**: Wanting verified interaction points (`/guestbook`) with their audience.

---

## 4. Functional Requirements (Advanced Beta Node)

### 4.1 Multi-Node Landing Ecosystem
- **Landing Page (`/`)**: High-impact hero section with glassmorphic depth and micro-animations.
- **Profile Node (`/me`)**: The "Digital Folio" featuring 3D recently played cards and live status.
- **Technical Library (`/docs`)**: A full-scale, markdown-driven documentation system for sharing technical logs or guides.
- **Interaction Hub (`/guestbook`)**: Verified messaging system using GitHub OAuth to prevent spam.

### 4.2 Intelligence Suite
- **Lead Intake Engine (`/hireme`)**: Advanced budget and timeline estimator for service inquiries.
- **Cloud Engineering Node (`/cloud`)**: Specialized tier-based infrastructure services (Discord Bots, Website Redesign).
- **Newsletter Terminal**: Integrated email capture at the edge.

### 4.3 Music Synchronization Engine (V2)
- **Intelligent Dual-Buffer**: Seamlessly transitions between live Spotify playback and local "Uploaded Music" when the user is offline.
- **Playback History Cards**: 3D-perspective cards showing recently played tracks with "Last Seen" timestamps.
- **Visual Flow Rails**: Animated gradient progress bars that react to song duration and state.

### 4.4 Admin Command Center (Multi-Dashboard)
- **Centralized Orchestration**: Management of profile links, docs, and cloud service metadata.
- **Lead Management**: Integration with Google Sheets API for real-time lead tracking.
- **Media Vault**: Secure management of bio assets and documentation images.

---

## 5. Technical Architecture

### 5.1 The Modern Stack
- **Frontend**: Next.js 15+ (App Router), React 19, Tailwind CSS 4.0.
- **Backend/Database**: Next.js Server Actions, Supabase (PostgreSQL), Realtime.
- **Edge Services**: Vercel Edge Network, Cloudflare WAF (Firewall Filtering).
- **External Pipes**: 
    - **Communications**: Resend API, Google Sheets API.
    - **Auth**: Supabase Auth (Email + GitHub OAuth).
    - **Payments**: Razorpay SDK (Non-refundable deposit logic).
    - **Observability**: Vercel Analytics & Speed Insights.

### 5.2 SEO & Discoverability
- **Dynamic Sitemap Generator**: Programmatic `sitemap.ts` for automated crawling of dynamic service nodes.
- **Robot Orchestration**: Dynamic `robots.ts` to manage crawl budgets and shield admin/success paths.
- **Meta Engine**: Server-side metadata injection for high-fidelity social sharing.

---

## 6. UX & Aesthetic Design System

### 6.1 "Dark Mesh" Design Language
- **Base Aesthetics**: Deep Obsidian blacks, slate-950, and blurred backdrop filters.
- **Interactions**: Glassmorphism, 3D hover transforms (perspective: 1000px), and fluid scaling (320px to 4K).
- **Typography**: Typography-driven layouts using high-contrast modern sans-serif fonts.

---

## 7. Product Roadmap (Beta to Production)

### Phase 1: Infrastructure Hardening (Current / Beta)
- [x] Multi-node routing (`/me`, `/docs`, `/hireme`)
- [x] Music Sync Engine V2 (Dual-Buffer)
- [x] GitHub OAuth Interaction Layer
- [x] Automated SEO (Sitemap/Robots)
- [x] GDPR/DPDP Compliance Layer

### Phase 2: Commercial Scalability (Q2 2026)
- [ ] **Native Payment Portal**: In-site checkouts for cloud services via Razorpay.
- [ ] **Collaborator Access**: Team-based management of the Admin Command Center.
- [ ] **Advanced Lead Routing**: Automated Discord/Slack notifications for new inquiries.

### Phase 3: AI & Automation (Q3 2026)
- [ ] **Neural Bio-Generator**: Integrated AI to assist creators in drafting their identity.
- [ ] **Smart Traffic Analysis**: AI-driven insights into visitor behavior and conversion.

---

## 8. Compliance & Security (Harden Layer)
- **Security Protocols**: Enforced TLS 1.3, CSP headers, and zero-index protocols for sensitive routes.
- **Data Residency**: Fully compliant with modern data protection acts (GDPR, DPDP 2023).
- **Zero-Trust Admin**: Authentication-guarded server actions and protected database RLS.

---

<div align="center">
  <p><i>Updated for Beta Branch Analysis - @avrxt </i></p>
</div>


