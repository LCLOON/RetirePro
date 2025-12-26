# RetirePro Environment Variables

## 🔑 All Environment Variables

### Stripe (Payments)

| Variable | Purpose | Live Value |
|----------|---------|------------|
| `STRIPE_SECRET_KEY` | Server-side API access | `sk_live_51SfjfQ8WMeXEKMhb...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | `whsec_ejtBTT2i6T0ORWefmf1wVyKaoHcWkMf7` |
| `STRIPE_PRICE_PRO_MONTHLY` | Pro monthly price ID | `price_1ShAIv8WMeXEKMhbq7JZAvCJ` |
| `STRIPE_PRICE_PRO_YEARLY` | Pro yearly price ID | `price_1SiczK8WMeXEKMhbr7KcYJDZ` |
| `STRIPE_PRICE_PREMIUM_MONTHLY` | Premium monthly price ID | `price_1Siczj8WMeXEKMhb1AEnTWNt` |
| `STRIPE_PRICE_PREMIUM_YEARLY` | Premium yearly price ID | `price_1Siczr8WMeXEKMhb8pkuN1KH` |

### Resend (Emails)

| Variable | Purpose | Status |
|----------|---------|--------|
| `RESEND_API_KEY` | Email sending API | Set in Vercel |

### xAI (AI Advisor)

| Variable | Purpose | Status |
|----------|---------|--------|
| `XAI_API_KEY` | Grok AI for retirement advice | Set in Vercel |

### App Configuration

| Variable | Purpose | Value |
|----------|---------|-------|
| `NEXT_PUBLIC_APP_URL` | Base URL for redirects & emails | `https://retirepro.io` |

---

## 📍 Where They're Used

| File | Variables Used |
|------|----------------|
| `lib/stripe.ts` | `STRIPE_SECRET_KEY`, `STRIPE_PRICE_*` |
| `lib/email.ts` | `RESEND_API_KEY` |
| `app/api/webhook/route.ts` | `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL` |
| `app/api/checkout/route.ts` | `NEXT_PUBLIC_APP_URL` |
| `app/api/ai-advisor/route.ts` | `XAI_API_KEY` |

---

## 🔒 Hardcoded Values (Not Environment Variables)

| File | Value | Purpose |
|------|-------|---------|
| `app/landing/page.tsx` | Price IDs | Live price IDs for checkout |
| `lib/email.ts` | `onboarding@retirepro.io` | Sender email |
| `lib/email.ts` | `lcloon@roadrunner.com` | Reply-to email |

---

## ✅ Vercel Production Environment Variables

```
STRIPE_SECRET_KEY=sk_live_51SfjfQ8WMeXEKMhb...
STRIPE_WEBHOOK_SECRET=whsec_ejtBTT2i6T0ORWefmf1wVyKaoHcWkMf7
STRIPE_PRICE_PRO_MONTHLY=price_1ShAIv8WMeXEKMhbq7JZAvCJ
STRIPE_PRICE_PRO_YEARLY=price_1SiczK8WMeXEKMhbr7KcYJDZ
STRIPE_PRICE_PREMIUM_MONTHLY=price_1Siczj8WMeXEKMhb1AEnTWNt
STRIPE_PRICE_PREMIUM_YEARLY=price_1Siczr8WMeXEKMhb8pkuN1KH
RESEND_API_KEY=re_...
XAI_API_KEY=xai_...
NEXT_PUBLIC_APP_URL=https://retirepro.io
```

---

## 🌐 External Dashboards

| Service | Dashboard URL |
|---------|---------------|
| Stripe | https://dashboard.stripe.com |
| Resend | https://resend.com/emails |
| Vercel | https://vercel.com/lewis-loons-projects/retirepro-web |
| xAI | https://console.x.ai |

---

## 🔄 Webhook Endpoint

**URL:** `https://retirepro.io/api/webhook`

**Events Handled:**
- `checkout.session.completed` → Sends payment confirmation email
- `invoice.payment_succeeded` → Logs successful renewal
- `invoice.payment_failed` → Sends payment failed email
- `customer.subscription.updated` → Logs subscription changes
- `customer.subscription.deleted` → Logs cancellation

---

## 📧 Email Configuration

**Sender:** `RetirePro <onboarding@retirepro.io>`

**Reply-To:** `lcloon@roadrunner.com`

**Email Types:**
- `welcome` - Welcome email for new signups
- `payment-confirmation` - Sent after successful payment
- `payment-failed` - Sent when payment fails

---

## 🏢 Account & Domain Info

| Item | Value |
|------|-------|
| **Domain** | `retirepro.io` |
| **Stripe Account** | Static State Energy LLC |
| **Vercel Project** | `retirepro-web` |
| **Resend Domain** | `retirepro.io` (verified) |

---

## 🛠️ Common Commands

```bash
# Run locally
npm run dev

# Deploy to production
vercel --prod

# Force deploy (clear cache)
vercel --prod --force

# Check Vercel logs
vercel logs retirepro.io

# Run API tests
node test-api.mjs
```

---

## 📞 Support Contacts

| Role | Email |
|------|-------|
| Customer support | support@retirepro.io |
| Reply-to (forwards to you) | lcloon@roadrunner.com |
