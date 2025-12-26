import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

// Price IDs for plan lookup
const PRICE_IDS = {
  PRO_MONTHLY: 'price_1ShAIv8WMeXEKMhbq7JZAvCJ',
  PRO_YEARLY: 'price_1SiczK8WMeXEKMhbr7KcYJDZ',
  PREMIUM_MONTHLY: 'price_1Siczj8WMeXEKMhb1AEnTWNt',
  PREMIUM_YEARLY: 'price_1Siczr8WMeXEKMhb8pkuN1KH',
};

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const { email, newPriceId } = await request.json();

    if (!email || !newPriceId) {
      return NextResponse.json(
        { error: 'Email and newPriceId are required' },
        { status: 400 }
      );
    }

    // Find customer by email
    const customers = await stripe.customers.list({
      email: email.toLowerCase(),
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: 'No customer found with this email' },
        { status: 404 }
      );
    }

    const customer = customers.data[0];

    // Get active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: 'No active subscription found. Please purchase a plan first.' },
        { status: 404 }
      );
    }

    const subscription = subscriptions.data[0];
    const currentPriceId = subscription.items.data[0]?.price?.id;

    // Check if already on the same plan
    if (currentPriceId === newPriceId) {
      return NextResponse.json(
        { error: 'You are already on this plan' },
        { status: 400 }
      );
    }

    // Determine current and new plan tiers
    const premiumPrices = [PRICE_IDS.PREMIUM_MONTHLY, PRICE_IDS.PREMIUM_YEARLY];
    const isCurrentPremium = premiumPrices.includes(currentPriceId || '');
    const isNewPremium = premiumPrices.includes(newPriceId);

    // Prevent downgrade (Premium → Pro)
    if (isCurrentPremium && !isNewPremium) {
      return NextResponse.json(
        { error: 'To downgrade, please cancel your current subscription and resubscribe at the end of your billing period.' },
        { status: 400 }
      );
    }

    // Update the subscription with proration
    // Stripe automatically calculates and charges the prorated difference
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
      // Payment will be collected immediately if there's a balance due
      payment_behavior: 'error_if_incomplete',
    });

    // Get the latest invoice to see what was charged
    const invoices = await stripe.invoices.list({
      subscription: subscription.id,
      limit: 1,
    });
    const prorationAmount = invoices.data[0]?.amount_paid || 0;

    // Determine new tier
    const newTier = isNewPremium ? 'premium' : 'pro';

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${newTier}!`,
      tier: newTier,
      prorationAmount: prorationAmount / 100, // Convert to dollars
      subscriptionId: updatedSubscription.id,
    });

  } catch (error) {
    console.error('Upgrade subscription error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Upgrade failed: ${message}` },
      { status: 500 }
    );
  }
}

// GET endpoint to check if user can upgrade
export async function GET(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find customer by email
    const customers = await stripe.customers.list({
      email: email.toLowerCase(),
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({ hasSubscription: false });
    }

    const customer = customers.data[0];

    // Get active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ hasSubscription: false });
    }

    const subscription = subscriptions.data[0];
    const currentPriceId = subscription.items.data[0]?.price?.id;

    // Determine current tier
    const premiumPrices = [PRICE_IDS.PREMIUM_MONTHLY, PRICE_IDS.PREMIUM_YEARLY];
    const currentTier = premiumPrices.includes(currentPriceId || '') ? 'premium' : 'pro';

    return NextResponse.json({
      hasSubscription: true,
      currentPriceId,
      currentTier,
      canUpgrade: currentTier === 'pro',
    });

  } catch (error) {
    console.error('Preview upgrade error:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    );
  }
}
