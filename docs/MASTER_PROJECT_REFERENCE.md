# RetirePro - Master Project Reference

**Print-Ready Documentation**

---

## 📋 Project Identity

| Field | Value |
|-------|-------|
| **Project Name** | RetirePro |
| **URL** | https://retirepro.io |
| **Business Entity** | Static State Energy LLC |
| **Project Status** | ✅ LIVE IN PRODUCTION |
| **Last Updated** | December 26, 2025 |

---

## 💰 Pricing Structure

| Plan | Monthly | Yearly | Stripe Price ID |
|------|---------|--------|-----------------|
| **Free** | $0 | $0 | N/A |
| **Pro** | $9 | $84 | `price_1ShAIv8WMeXEKMhbq7JZAvCJ` (mo) / `price_1SiczK8WMeXEKMhbr7KcYJDZ` (yr) |
| **Premium** | $19 | $180 | `price_1Siczj8WMeXEKMhb1AEnTWNt` (mo) / `price_1Siczr8WMeXEKMhb8pkuN1KH` (yr) |

---

## 🔑 API Keys & Secrets

⚠️ **SENSITIVE - DO NOT SHARE**

| Service | Variable | Where Stored |
|---------|----------|--------------|
| Stripe Secret | `STRIPE_SECRET_KEY` | Vercel Dashboard |
| Stripe Webhook | `STRIPE_WEBHOOK_SECRET` | Vercel Dashboard |
| Resend API | `RESEND_API_KEY` | Vercel Dashboard |
| xAI (Grok) | `XAI_API_KEY` | Vercel Dashboard |
| App URL | `NEXT_PUBLIC_APP_URL` | Vercel Dashboard |

### Current Webhook Secret
```
whsec_ejtBTT2i6T0ORWefmf1wVyKaoHcWkMf7
```

---

## 🌐 External Dashboards

| Service | URL | Login |
|---------|-----|-------|
| **Stripe** | https://dashboard.stripe.com | Email/Password |
| **Resend** | https://resend.com/emails | Email/Password |
| **Vercel** | https://vercel.com/lewis-loons-projects/retirepro-web | GitHub |
| **xAI** | https://console.x.ai | Email/Password |
| **Domain** | (your registrar) | - |

---

## 📧 Email Configuration

| Setting | Value |
|---------|-------|
| Provider | Resend |
| Domain | retirepro.io (verified) |
| From Address | `RetirePro <onboarding@retirepro.io>` |
| Reply-To | `lcloon@roadrunner.com` |

### Email Templates
1. `welcome` - New user signup
2. `payment-confirmation` - Successful payment
3. `payment-failed` - Failed payment attempt

---

## 🏗️ Tech Stack Summary

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 14+ |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 |
| State | React Context | - |
| Payments | Stripe | Live Mode |
| Email | Resend | - |
| AI | xAI (Grok) | - |
| Hosting | Vercel | - |
| Testing | Vitest | - |

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| `app/landing/page.tsx` | Pricing page, checkout buttons |
| `app/api/checkout/route.ts` | Creates Stripe sessions |
| `app/api/webhook/route.ts` | Handles Stripe events |
| `app/api/send-email/route.ts` | Sends emails via Resend |
| `app/api/ai-advisor/route.ts` | AI chat via xAI |
| `lib/types.ts` | All TypeScript types + defaults |
| `lib/store.tsx` | State management (Context) |
| `lib/calculations.ts` | Financial math engine |
| `lib/stripe.ts` | Stripe client config |
| `lib/email.ts` | Resend client config |
| `lib/email-templates.tsx` | Email HTML templates |
| `lib/subscription.tsx` | Feature tier definitions |

---

## 🔧 Essential Commands

### Development
```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint check
npm run test             # Run tests
```

### Deployment
```bash
vercel --prod            # Deploy to production
vercel logs retirepro.io # View production logs
vercel env pull          # Pull env vars to .env.local
```

### Testing
```bash
node test-api.mjs        # Test all API endpoints
```

### Git
```bash
git add .
git commit -m "message"
git push origin main
```

---

## 📊 Stripe Webhook Events

| Event | Action Taken |
|-------|--------------|
| `checkout.session.completed` | Send payment confirmation email |
| `invoice.payment_failed` | Send payment failed email |
| `customer.subscription.updated` | Log to console |
| `customer.subscription.deleted` | Log cancellation |

### Webhook Endpoint
```
https://retirepro.io/api/webhook
```

---

## ✅ Feature Checklist (All Complete)

### Core Features
- [x] 30-year retirement projections
- [x] Monte Carlo simulations (1,000 runs)
- [x] Social Security optimization
- [x] RMD calculations (SECURE Act)
- [x] Inherited IRA (10-year rule)
- [x] Roth conversion strategies

### Additional Features
- [x] Net worth tracking
- [x] Budget analysis
- [x] Tax planning
- [x] Mortgage calculator
- [x] Dark/Light/Medium themes

### Premium Features
- [x] AI Retirement Advisor (xAI Grok)
- [x] Export to PDF
- [x] Advanced charts

### Infrastructure
- [x] Stripe Live Mode payments
- [x] All 4 price tiers configured
- [x] Email notifications (Resend)
- [x] Webhook handler
- [x] Rate limiting
- [x] SEO (sitemap, robots, meta)
- [x] Cookie consent
- [x] Privacy & Terms pages
- [x] Mobile responsive

---

## 🐛 Known Issues & Solutions

| Issue | Solution |
|-------|----------|
| PowerShell corrupts env vars | Hardcode values or use Vercel Dashboard |
| NEXT_PUBLIC_ not updating | Redeploy after changes |
| Webhook signature fails | Check test vs live secret |
| Emails go to spam | Verify domain DNS records |

---

## 📞 Support Contacts

| Role | Contact |
|------|---------|
| Customer Reply-To | lcloon@roadrunner.com |
| App From Address | onboarding@retirepro.io |

---

## 🗂️ Documentation Files

| File | Contents |
|------|----------|
| `.github/copilot-instructions.md` | AI coding instructions |
| `docs/ENVIRONMENT_VARIABLES.md` | All env vars documented |
| `docs/MARKETING_PLAN.md` | Marketing strategy |
| `docs/LAUNCH_PLAYBOOK.md` | SaaS launch template |
| `docs/MASTER_PROJECT_REFERENCE.md` | This file (print copy) |

---

## 📈 Revenue Tracking Formulas

```
MRR = (Monthly Subs × Price) + (Yearly Subs × Price ÷ 12)
Churn Rate = (Cancellations ÷ Total Subscribers) × 100
LTV = ARPU × Average Customer Lifespan
CAC = Total Marketing Spend ÷ New Customers
```

---

## 🚀 Launch Status

| Item | Status |
|------|--------|
| Stripe Live Mode | ✅ Active |
| Products Created | ✅ Pro + Premium |
| Prices Created | ✅ Monthly + Yearly (4 total) |
| Webhook Endpoint | ✅ https://retirepro.io/api/webhook |
| Email Domain | ✅ retirepro.io verified |
| AI Advisor | ✅ Working |
| All APIs | ✅ Tested |

### Next Steps
1. [ ] Real credit card test ($9 purchase)
2. [ ] Verify email received
3. [ ] Refund test purchase
4. [ ] Roll Stripe secret key (was exposed)
5. [ ] Begin marketing

---

*Printed: December 26, 2025*
*Keep this document secure - contains sensitive configuration data*
