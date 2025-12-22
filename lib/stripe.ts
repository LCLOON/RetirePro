import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

export const PLANS = {
  pro: {
    monthly: {
      priceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
      price: 9,
    },
    yearly: {
      priceId: process.env.STRIPE_PRICE_PRO_YEARLY!,
      price: 7, // per month, billed annually
    },
  },
  premium: {
    monthly: {
      priceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY!,
      price: 19,
    },
    yearly: {
      priceId: process.env.STRIPE_PRICE_PREMIUM_YEARLY!,
      price: 15, // per month, billed annually
    },
  },
};
