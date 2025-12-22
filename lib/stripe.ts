import Stripe from 'stripe';

// Only initialize Stripe if the secret key is available
// This prevents build errors when env vars aren't set
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null;

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
