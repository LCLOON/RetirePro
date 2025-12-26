# RetirePro - Master Project Instructions

**Project:** RetirePro - Professional Retirement Planning SaaS  
**URL:** https://retirepro.io  
**Domain:** retirepro.io  
**Business Entity:** Static State Energy LLC  
**Last Updated:** December 26, 2025  
**Status:** ✅ LIVE IN PRODUCTION  

---

## 🎯 Project Overview

RetirePro is a freemium retirement planning tool for Americans aged 45-70. It runs entirely client-side for calculations with server-side API routes for payments, emails, and AI features.

### Business Model
| Plan | Monthly | Yearly | Features |
|------|---------|--------|----------|
| Free | $0 | $0 | Basic projections, limited Monte Carlo |
| Pro | $9 | $84 | Full Monte Carlo, exports, charts |
| Premium | $19 | $180 | AI Advisor, all features |

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14+ | React SSR, API routes, App Router |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS v4 | Dark-first design, emerald accent |
| State | React Context + useReducer | Client-side, localStorage persistence |
| Payments | Stripe (Live Mode) | Subscriptions, checkout |
| Email | Resend | Transactional emails from retirepro.io |
| AI | xAI (Grok) | AI-powered retirement advisor |
| Hosting | Vercel | Deployment, edge functions |

---

## 📁 Project Structure

```
retirepro-web/
├── app/
│   ├── globals.css          # Tailwind imports
│   ├── layout.tsx           # Root layout with AppProvider
│   ├── page.tsx             # Redirect logic
│   ├── robots.ts            # SEO
│   ├── sitemap.ts           # SEO
│   │
│   ├── api/
│   │   ├── ai-advisor/route.ts  # xAI Grok integration
│   │   ├── checkout/route.ts    # Stripe checkout
│   │   ├── webhook/route.ts     # Stripe webhooks → emails
│   │   └── send-email/route.ts  # Resend API
│   │
│   ├── app/                 # Main dashboard
│   ├── landing/             # Marketing & pricing
│   ├── success/             # Post-purchase
│   ├── privacy/             # Legal
│   └── terms/               # Legal
│
├── components/
│   ├── ui/                  # Button, Card, Input, Select, FeatureGate
│   ├── layout/              # Sidebar, TopBar, DashboardLayout
│   └── tabs/                # All feature tabs
│
├── lib/
│   ├── types.ts             # Types + DEFAULT_* constants
│   ├── store.tsx            # React Context state
│   ├── calculations.ts      # Financial math engine
│   ├── stripe.ts            # Stripe client
│   ├── email.ts             # Resend client
│   ├── email-templates.tsx  # HTML email templates
│   ├── subscription.tsx     # Feature tier gating
│   └── rate-limit.ts        # API protection
│
├── docs/
│   ├── ENVIRONMENT_VARIABLES.md
│   ├── MARKETING_PLAN.md
│   └── LAUNCH_PLAYBOOK.md
│
└── tests/
```

---

## 🔑 Environment Variables (Production)

```bash
# Stripe (Live Mode)
STRIPE_SECRET_KEY=sk_live_51SfjfQ8WMeXEKMhb...
STRIPE_WEBHOOK_SECRET=whsec_ejtBTT2i6T0ORWefmf1wVyKaoHcWkMf7

# Email
RESEND_API_KEY=re_...

# AI
XAI_API_KEY=xai_...

# App
NEXT_PUBLIC_APP_URL=https://retirepro.io
```

### Stripe Live Price IDs (Hardcoded in landing/page.tsx)
```typescript
const PRICE_IDS = {
  PRO_MONTHLY: 'price_1ShAIv8WMeXEKMhbq7JZAvCJ',      // $9/mo
  PRO_YEARLY: 'price_1SiczK8WMeXEKMhbr7KcYJDZ',       // $84/yr
  PREMIUM_MONTHLY: 'price_1Siczj8WMeXEKMhb1AEnTWNt',  // $19/mo
  PREMIUM_YEARLY: 'price_1Siczr8WMeXEKMhb8pkuN1KH',   // $180/yr
};
```

---

## 📊 Core Data Flow

```
User Input → store.tsx (Context) → calculations.ts → Results Display
     ↓
localStorage (persistence)
```

### State Management Pattern
```tsx
// Always use helper functions, never dispatch directly
const { updateRetirementData, updateNetWorthData, runCalculations } = useApp();
updateRetirementData({ currentAge: 45 }); // Triggers hasUnsavedChanges
```

### Types & Defaults Pattern
All types in `lib/types.ts` are paired with `DEFAULT_*` constants:
```typescript
export interface RetirementData { ... }
export const DEFAULT_RETIREMENT_DATA: RetirementData = { ... };
```

When adding new fields:
1. Add to interface
2. Add default value
3. Add migration in `store.tsx` → `migrateData()`

---

## 🧮 Calculations Engine

`lib/calculations.ts` contains actuarially-validated financial math:
- `calculateScenarioResults()` - Main 30-year projection
- `performMonteCarloProjection()` - 1,000 stochastic simulations
- Social Security optimization
- RMD calculations (SECURE Act compliant)
- Inherited IRA (10-year rule)
- Roth conversion strategies

Calculations run **client-side only**. Trigger via `runCalculations()`.

---

## 💳 Payment Flow

```
Landing Page → Checkout API → Stripe → Webhook → Send Email
```

### Webhook Events Handled
| Event | Action |
|-------|--------|
| `checkout.session.completed` | Send payment-confirmation email |
| `invoice.payment_failed` | Send payment-failed email |
| `customer.subscription.updated` | Log changes |
| `customer.subscription.deleted` | Log cancellation |

### Webhook URL
```
https://retirepro.io/api/webhook
```

---

## 📧 Email Configuration

| Setting | Value |
|---------|-------|
| Provider | Resend |
| From | `RetirePro <onboarding@retirepro.io>` |
| Reply-To | `lcloon@roadrunner.com` |
| Domain | `retirepro.io` (verified) |

### Email Templates
- `welcome` - New signup
- `payment-confirmation` - Successful purchase
- `payment-failed` - Failed payment

---

## 🎨 Styling Rules

- **Tailwind CSS v4** with dark-first design
- **Primary color:** Emerald (`emerald-*`)
- **Backgrounds:** Slate grays (`slate-900`, `slate-800`)
- **Theme system:** `light | dark | medium` in store

---

## 🔒 Feature Gating

```tsx
<FeatureGate featureId="ai-advisor">
  <AITab />
</FeatureGate>
```

Feature tiers defined in `lib/subscription.tsx` → `FEATURE_TIERS`:
- `free`: Basic projections
- `pro`: Charts, exports, full Monte Carlo
- `premium`: AI Advisor, all features

---

## 📝 Component Patterns

### UI Components (Barrel Export)
```tsx
import { Card, CurrencyInput, PercentInput, Button, Select } from '@/components/ui';
```

### Tab Component Pattern
```tsx
'use client';
import { useApp } from '@/lib/store';
import { Card, CurrencyInput } from '@/components/ui';

export function NewTab() {
  const { state, updateRetirementData } = useApp();
  // Component logic
}
```

---

## ➕ Adding New Features

### Adding a New Tab
1. Create `components/tabs/NewTab.tsx`
2. Export from `components/tabs/index.ts`
3. Add TabId to `lib/types.ts`
4. Add case in `Dashboard.tsx` → `renderTab()`
5. Add to `Sidebar.tsx` navigation
6. If premium: add to `FEATURE_TIERS`

### Adding New Data Fields
1. Add type to interface in `lib/types.ts`
2. Add default in `DEFAULT_*` constant
3. Add migration in `store.tsx` → `migrateData()`

---

## 🔧 Common Commands

```bash
# Development
npm run dev              # http://localhost:3000
npm run build            # Production build
npm run lint             # ESLint check

# Deployment
vercel --prod            # Deploy to production
vercel logs retirepro.io # View logs

# Testing
node test-api.mjs        # Test all API endpoints
npm run test             # Run vitest tests
```

---

## 🐛 Known Issues & Fixes

### PowerShell Corrupts Env Vars
**Problem:** `\r\n` added to values  
**Solution:** Hardcode in code or use Vercel Dashboard

### NEXT_PUBLIC_ Vars Not Updating
**Problem:** Cached at build time  
**Solution:** Redeploy after changes

---

## 🔗 External Dashboards

| Service | URL |
|---------|-----|
| Stripe | https://dashboard.stripe.com |
| Resend | https://resend.com/emails |
| Vercel | https://vercel.com/lewis-loons-projects/retirepro-web |
| xAI | https://console.x.ai |

---

## ✅ Completed Features (December 26, 2025)

- [x] Full retirement projection engine
- [x] Monte Carlo simulations (1,000 runs)
- [x] Social Security optimization
- [x] RMD calculations (SECURE Act)
- [x] Inherited IRA (10-year rule)
- [x] Net worth tracking
- [x] Budget analysis
- [x] Tax planning
- [x] Mortgage calculator
- [x] AI Retirement Advisor (xAI Grok)
- [x] Stripe payments (Live Mode)
- [x] Email notifications (Resend)
- [x] Freemium subscription model
- [x] Dark/Light/Medium themes
- [x] Mobile responsive
- [x] SEO optimized
- [x] Cookie consent
- [x] Privacy & Terms pages

---

## 🚀 Ready for Launch

The app is fully functional with:
- ✅ Live Stripe payments working
- ✅ All 4 price tiers configured
- ✅ Webhook endpoint active
- ✅ Email system ready
- ✅ AI Advisor functional
- ✅ All features tested

**Next Step:** Real credit card test, then roll exposed API key
6. If premium: add to `FEATURE_TIERS` in `lib/subscription.tsx`

### Adding New Data Fields
1. Update type in `lib/types.ts`
2. Add default in `DEFAULT_*` constant
3. Add migration in `store.tsx` if needed for existing users
4. Update relevant tab component to display/edit

## Commands
```bash
npm run dev    # Development server (http://localhost:3000)
npm run build  # Production build
npm run lint   # ESLint check
```
