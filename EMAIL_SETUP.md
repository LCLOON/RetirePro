# Email Setup Guide - RetirePro

## Quick Start Email Integration ✉️

This guide will help you set up Resend for transactional emails in RetirePro.

---

## 1. Get Your Resend API Key

1. Go to [resend.com](https://resend.com) and sign up (free tier includes 3,000 emails/month)
2. Verify your email address
3. Navigate to **API Keys** in the dashboard
4. Click **Create API Key**
5. Give it a name (e.g., "RetirePro Production")
6. Copy the API key (starts with `re_`)

---

## 2. Add Domain (Recommended for Production)

**For Development:** Use the default `onboarding@resend.dev` sender (no domain needed)

**For Production:**
1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `retirepro.io`)
4. Add the DNS records they provide to your domain registrar
5. Wait for verification (usually 5-10 minutes)
6. Update `FROM_EMAIL` in `lib/email.ts` to use your domain

---

## 3. Configure Environment Variables

Add your Resend API key to `.env.local`:

\`\`\`bash
RESEND_API_KEY=re_your_actual_api_key_here
\`\`\`

**For Vercel Production:**
\`\`\`bash
vercel env add RESEND_API_KEY
# Enter your API key when prompted
# Select: Production, Preview, Development (all)
\`\`\`

---

## 4. Test Your Setup

### Test Welcome Email (Newsletter Signup)
1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000`
3. Scroll to the newsletter section
4. Enter your email and click "Subscribe Free"
5. Check your inbox for the welcome email

### Test Payment Confirmation
1. Complete a test payment via Stripe
2. Webhook will automatically send payment confirmation email
3. Check the email recipient's inbox

### Test via API Directly
\`\`\`bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "to": "your-email@example.com",
    "data": {"userName": "Test User"}
  }'
\`\`\`

---

## 5. Email Types Implemented

### ✓ Welcome Email
- **Trigger:** Newsletter signup on landing page
- **Contains:** Getting started guide, feature highlights, support info
- **Template:** `lib/email-templates.tsx` → `welcomeEmail()`

### ✓ Payment Confirmation
- **Trigger:** Stripe `checkout.session.completed` webhook
- **Contains:** Plan details, amount paid, billing period, unlocked features
- **Template:** `lib/email-templates.tsx` → `paymentConfirmationEmail()`

### ✓ Payment Failed
- **Trigger:** Stripe `invoice.payment_failed` webhook
- **Contains:** Failure reason, retry date, update payment method CTA
- **Template:** `lib/email-templates.tsx` → `paymentFailedEmail()`

---

## 6. Files Created/Modified

### New Files:
- `lib/email.ts` - Resend client and sending utilities
- `lib/email-templates.tsx` - HTML email templates
- `app/api/send-email/route.ts` - Email API endpoint
- `EMAIL_SETUP.md` - This guide

### Modified Files:
- `app/api/webhook/route.ts` - Added email triggers for payment events
- `app/landing/page.tsx` - Added newsletter signup with welcome email
- `.env.local` - Added RESEND_API_KEY placeholder

---

## 7. Customization Tips

### Update Sender Email
Edit `FROM_EMAIL` in `lib/email.ts`:
\`\`\`typescript
export const FROM_EMAIL = 'RetirePro <hello@yourdomain.com>';
\`\`\`

### Customize Email Templates
Edit templates in `lib/email-templates.tsx`:
- Change colors, fonts, and styling
- Add/remove sections
- Update copy and messaging

### Add More Email Types
1. Create new template function in `lib/email-templates.tsx`
2. Add new case in `app/api/send-email/route.ts`
3. Call the API from your trigger point

---

## 8. Production Checklist

- [ ] Add Resend API key to Vercel environment variables
- [ ] Verify custom domain in Resend (if using)
- [ ] Update `FROM_EMAIL` to use your domain
- [ ] Test all email types in production
- [ ] Set up email monitoring/logging
- [ ] Configure Resend webhooks for bounce/complaint tracking
- [ ] Add unsubscribe links (for marketing emails)
- [ ] Review email templates on mobile devices

---

## 9. Monitoring & Analytics

**Resend Dashboard:**
- View sent emails
- Track delivery rates
- Monitor bounces and complaints
- Check API usage

**Add Custom Logging:**
\`\`\`typescript
// In lib/email.ts, the sendEmail function already logs:
console.log('Email sent successfully:', data?.id);
\`\`\`

---

## 10. Cost Estimate

**Resend Free Tier:**
- 3,000 emails/month
- 100 emails/day
- Perfect for starting out

**Paid Plans:**
- Pro: $20/mo → 50,000 emails
- Business: $80/mo → 200,000 emails

**RetirePro Estimate:**
- 100 new users/month × 1 welcome email = 100 emails
- 50 paid conversions/month × 1 confirmation = 50 emails
- 10 failed payments/month × 1 alert = 10 emails
- **Total: ~160 emails/month (well within free tier)**

---

## Support

- **Resend Docs:** https://resend.com/docs
- **Resend API Reference:** https://resend.com/docs/api-reference/emails/send-email
- **RetirePro Support:** support@retirepro.app

---

## Next Steps: Future Email Features

Want to add more? Here are ideas:

1. **Monthly Retirement Review** - "Your retirement plan this month"
2. **RMD Reminders** - Alert users when RMDs are due
3. **Market Volatility Alerts** - Notify on significant market changes
4. **Quarterly Tips** - Retirement planning education series
5. **Anniversary Emails** - "You've been planning for 1 year!"
6. **Referral Program** - "Invite friends, get rewards"
7. **Trial Expiry Warnings** - Conversion emails for free users
8. **Feature Announcements** - "New: HSA tracking added!"

Let me know which features you'd like to implement next!
