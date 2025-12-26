# SaaS Launch Playbook

**Template Version:** 1.0  
**Based on:** RetirePro (retirepro.io)  
**Last Updated:** December 26, 2025  

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14+ | React SSR, API routes, App Router |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| State | React Context + useReducer | Client-side state management |
| Payments | Stripe | Subscriptions, checkout |
| Email | Resend | Transactional emails |
| AI | xAI (Grok) | AI-powered features |
| Hosting | Vercel | Deployment, edge functions |
| Domain | Your registrar | Custom domain |

---

## 📁 Project Structure Template

```
project-name/
├── app/
│   ├── globals.css          # Tailwind imports, global styles
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Root redirect logic
│   ├── robots.ts            # SEO robots.txt
│   ├── sitemap.ts           # SEO sitemap.xml
│   │
│   ├── api/
│   │   ├── checkout/route.ts    # Stripe checkout sessions
│   │   ├── webhook/route.ts     # Stripe webhooks
│   │   ├── send-email/route.ts  # Email API
│   │   └── ai-[feature]/route.ts # AI endpoints
│   │
│   ├── app/                 # Main dashboard (authenticated)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── landing/             # Marketing/pricing page
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── success/             # Post-purchase success
│   │   └── page.tsx
│   │
│   ├── privacy/             # Legal pages
│   │   └── page.tsx
│   │
│   └── terms/
│       └── page.tsx
│
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── FeatureGate.tsx  # Subscription gating
│   │   └── index.ts         # Barrel exports
│   │
│   ├── layout/              # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── index.ts
│   │
│   └── tabs/                # Feature tabs/sections
│       ├── [Feature]Tab.tsx
│       └── index.ts
│
├── lib/
│   ├── types.ts             # TypeScript types + defaults
│   ├── store.tsx            # React Context + useReducer
│   ├── calculations.ts      # Business logic
│   ├── stripe.ts            # Stripe client
│   ├── email.ts             # Resend client
│   ├── email-templates.tsx  # HTML email templates
│   ├── subscription.tsx     # Feature tier logic
│   └── rate-limit.ts        # API rate limiting
│
├── public/
│   ├── manifest.json        # PWA manifest
│   └── robots.txt           # Fallback robots
│
├── docs/
│   ├── ENVIRONMENT_VARIABLES.md
│   ├── MARKETING_PLAN.md
│   └── LAUNCH_PLAYBOOK.md
│
├── tests/
│   └── *.test.ts
│
├── .env.local               # Local environment (gitignored)
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

---

## 📦 Core Dependencies

### package.json essentials

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "stripe": "^14.0.0",
    "resend": "^2.0.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "eslint": "^8.0.0",
    "vitest": "^1.0.0"
  }
}
```

### Install Commands

```bash
# Core
npm install next react react-dom

# Payments & Email
npm install stripe resend

# Icons
npm install lucide-react

# Dev tools
npm install -D typescript @types/react @types/node
npm install -D tailwindcss postcss
npm install -D eslint vitest
```

---

## 🔑 Environment Variables Template

### .env.local (Development)

```bash
# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASIC_MONTHLY=price_...
STRIPE_PRICE_BASIC_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...

# Email
RESEND_API_KEY=re_...

# AI (Optional)
XAI_API_KEY=xai_...
# or OPENAI_API_KEY=sk_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel Production Variables

```bash
# Stripe (Live Mode) - NEVER commit these
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASIC_MONTHLY=price_...
STRIPE_PRICE_BASIC_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...

# Email
RESEND_API_KEY=re_...

# AI
XAI_API_KEY=xai_...

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 🛠️ Core Code Patterns

### 1. lib/types.ts - Types + Defaults

```typescript
// Always pair types with defaults for easy initialization

export interface UserData {
  name: string;
  email: string;
  plan: 'free' | 'basic' | 'pro';
  createdAt: string;
}

export const DEFAULT_USER_DATA: UserData = {
  name: '',
  email: '',
  plan: 'free',
  createdAt: new Date().toISOString(),
};

export interface AppState {
  user: UserData;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
}

export const DEFAULT_APP_STATE: AppState = {
  user: DEFAULT_USER_DATA,
  isLoading: false,
  hasUnsavedChanges: false,
};
```

### 2. lib/store.tsx - State Management

```typescript
'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, DEFAULT_APP_STATE } from './types';

type Action =
  | { type: 'SET_USER'; payload: Partial<UserData> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { 
        ...state, 
        user: { ...state.user, ...action.payload },
        hasUnsavedChanges: true 
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'RESET':
      return DEFAULT_APP_STATE;
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Helper functions
  updateUser: (data: Partial<UserData>) => void;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_APP_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('app-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'SET_USER', payload: parsed });
      } catch (e) {
        console.error('Failed to load saved data');
      }
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (state.hasUnsavedChanges) {
      localStorage.setItem('app-data', JSON.stringify(state.user));
    }
  }, [state]);

  const updateUser = (data: Partial<UserData>) => {
    dispatch({ type: 'SET_USER', payload: data });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, updateUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
```

### 3. lib/stripe.ts - Stripe Client

```typescript
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Price IDs - hardcode if env vars cause issues
export const PRICE_IDS = {
  BASIC_MONTHLY: process.env.STRIPE_PRICE_BASIC_MONTHLY || 'price_xxx',
  BASIC_YEARLY: process.env.STRIPE_PRICE_BASIC_YEARLY || 'price_xxx',
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_xxx',
  PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_xxx',
};

// Validate price ID
export function isValidPriceId(priceId: string): boolean {
  return Object.values(PRICE_IDS).includes(priceId);
}
```

### 4. lib/email.ts - Resend Client

```typescript
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Update these for your project
export const FROM_EMAIL = 'YourApp <onboarding@yourdomain.com>';
export const REPLY_TO = 'support@yourdomain.com';
```

### 5. lib/email-templates.tsx - Email Templates

```typescript
interface EmailTemplateProps {
  customerName?: string;
  planName?: string;
  amount?: string;
}

export function getEmailTemplate(
  type: 'welcome' | 'payment-confirmation' | 'payment-failed',
  props: EmailTemplateProps
): { subject: string; html: string } {
  const templates = {
    'welcome': {
      subject: 'Welcome to YourApp!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; }
            .content { padding: 20px; }
            .button { background: #10b981; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to YourApp!</h1>
            </div>
            <div class="content">
              <p>Hi ${props.customerName || 'there'},</p>
              <p>Thanks for signing up! You're now on the ${props.planName || 'Pro'} plan.</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/app" class="button">
                Get Started
              </a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
    // Add more templates...
  };

  return templates[type];
}
```

### 6. app/api/checkout/route.ts - Checkout API

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe, isValidPriceId } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { priceId, customerEmail } = await request.json();

    if (!priceId || !isValidPriceId(priceId)) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/landing`,
      customer_email: customerEmail,
      metadata: {
        priceId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
```

### 7. app/api/webhook/route.ts - Stripe Webhook

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      // Send welcome email, update database, etc.
      console.log('Payment successful:', session.customer_email);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      // Send payment failed email
      console.log('Payment failed:', invoice.customer_email);
      break;
    }
    case 'customer.subscription.deleted': {
      // Handle cancellation
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

### 8. components/ui/FeatureGate.tsx - Subscription Gating

```typescript
'use client';

import { useApp } from '@/lib/store';
import { ReactNode } from 'react';

interface FeatureGateProps {
  featureId: string;
  children: ReactNode;
  fallback?: ReactNode;
}

// Define which features require which tier
const FEATURE_TIERS: Record<string, 'free' | 'basic' | 'pro'> = {
  'basic-features': 'free',
  'export': 'basic',
  'ai-advisor': 'pro',
  'unlimited': 'pro',
};

export function FeatureGate({ featureId, children, fallback }: FeatureGateProps) {
  const { state } = useApp();
  const requiredTier = FEATURE_TIERS[featureId] || 'pro';
  
  const tierOrder = ['free', 'basic', 'pro'];
  const userTierIndex = tierOrder.indexOf(state.user.plan);
  const requiredTierIndex = tierOrder.indexOf(requiredTier);
  
  const hasAccess = userTierIndex >= requiredTierIndex;

  if (hasAccess) {
    return <>{children}</>;
  }

  return fallback || (
    <div className="p-4 bg-slate-800 rounded-lg text-center">
      <p className="text-slate-400">Upgrade to {requiredTier} to access this feature</p>
    </div>
  );
}
```

---

## 🚀 Launch Checklist

### Phase 1: Development

- [ ] Set up Next.js project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Create folder structure
- [ ] Build core UI components
- [ ] Implement state management
- [ ] Build main features
- [ ] Add authentication/subscription logic
- [ ] Write tests

### Phase 2: Integrations

- [ ] **Stripe Setup**
  - [ ] Create Stripe account
  - [ ] Create products & prices (test mode)
  - [ ] Implement checkout API
  - [ ] Implement webhook handler
  - [ ] Test with Stripe CLI locally

- [ ] **Email Setup**
  - [ ] Create Resend account
  - [ ] Verify domain (add DNS records)
  - [ ] Create email templates
  - [ ] Implement send-email API
  - [ ] Test email delivery

- [ ] **AI Setup (if applicable)**
  - [ ] Get API key (xAI, OpenAI, etc.)
  - [ ] Implement AI endpoint
  - [ ] Add rate limiting
  - [ ] Test responses

### Phase 3: Deployment

- [ ] Create Vercel project
- [ ] Connect GitHub repo
- [ ] Add environment variables (Production)
- [ ] Deploy to preview
- [ ] Test all features on preview
- [ ] Add custom domain

### Phase 4: Go Live

- [ ] **Stripe Live Mode**
  - [ ] Complete Stripe account verification
  - [ ] Create live products & prices
  - [ ] Update price IDs in code
  - [ ] Create live webhook endpoint
  - [ ] Add live webhook secret to Vercel
  - [ ] **Do card test with real card**
  - [ ] Refund test purchase

- [ ] **Final Checks**
  - [ ] Test all payment flows
  - [ ] Verify emails are received
  - [ ] Check mobile responsiveness
  - [ ] Test SEO (sitemap, robots, meta)
  - [ ] Check analytics tracking

### Phase 5: Marketing

- [ ] Set up Google Analytics 4
- [ ] Set up Google Search Console
- [ ] Create social media accounts
- [ ] Write launch announcement
- [ ] Prepare Google Ads campaigns
- [ ] Launch!

---

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Check for errors

# Stripe CLI (Testing)
stripe login
stripe listen --forward-to localhost:3000/api/webhook
stripe trigger checkout.session.completed

# Stripe CLI (Create Products - Live)
stripe products create --name="Basic" --live
stripe prices create --product=prod_xxx --unit-amount=900 --currency=usd --recurring[interval]=month --live

# Vercel
vercel                   # Preview deploy
vercel --prod            # Production deploy
vercel env pull          # Pull env vars to .env.local
vercel logs [url]        # View logs

# Git
git add .
git commit -m "message"
git push origin main
```

---

## 🐛 Common Issues & Fixes

### 1. PowerShell Corrupts Environment Variables
**Problem:** `\r\n` gets added to env vars  
**Solution:** Hardcode values in code or use Vercel Dashboard

### 2. NEXT_PUBLIC_ Vars Not Updating
**Problem:** Client-side env vars cached at build time  
**Solution:** Redeploy after changing NEXT_PUBLIC_ vars

### 3. Webhook Signature Fails
**Problem:** `No signatures found matching the expected signature`  
**Solution:** Make sure you're using the correct webhook secret (test vs live)

### 4. Resend Emails Go to Spam
**Problem:** Emails not delivered  
**Solution:** Verify domain with SPF, DKIM, DMARC records

### 5. Stripe "No such price"
**Problem:** Price ID not found  
**Solution:** Confirm you're using test prices in test mode, live in live mode

---

## 📊 Revenue Tracking

### Stripe Dashboard Metrics
- MRR (Monthly Recurring Revenue)
- Churn rate
- Average Revenue Per User (ARPU)
- Lifetime Value (LTV)

### Key Formulas
```
MRR = (Monthly Subscribers × Price) + (Yearly Subscribers × Price / 12)
Churn Rate = (Cancellations / Total Subscribers) × 100
LTV = ARPU × Average Customer Lifespan
CAC = Total Marketing Spend / New Customers
```

---

## 📝 Project Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user-profile.tsx` |
| Components | PascalCase | `UserProfile` |
| Functions | camelCase | `getUserData` |
| Constants | SCREAMING_SNAKE | `DEFAULT_USER` |
| Types | PascalCase | `UserData` |
| CSS classes | kebab-case | `user-profile-card` |

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| Next.js Docs | https://nextjs.org/docs |
| Tailwind Docs | https://tailwindcss.com/docs |
| Stripe Docs | https://stripe.com/docs |
| Resend Docs | https://resend.com/docs |
| Vercel Docs | https://vercel.com/docs |
| Lucide Icons | https://lucide.dev/icons |

---

*Use this playbook as a starting point for new SaaS projects. Copy the patterns, update the specifics, and ship faster!*
