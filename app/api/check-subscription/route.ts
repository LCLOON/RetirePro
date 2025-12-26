import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    // Find customer by email
    const customers = await stripe.customers.list({
      email: email.toLowerCase(),
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({
        found: false,
        tier: 'free',
        message: 'No subscription found for this email',
      });
    }

    const customer = customers.data[0];

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 10,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        found: false,
        tier: 'free',
        message: 'No active subscription found',
      });
    }

    // Check the subscription to determine tier
    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0]?.price?.id;

    // Determine tier based on price ID
    // Premium prices
    const premiumPrices = [
      'price_1Siczj8WMeXEKMhb1AEnTWNt', // Premium Monthly
      'price_1Siczr8WMeXEKMhb8pkuN1KH', // Premium Yearly
    ];
    
    // Pro prices
    const proPrices = [
      'price_1ShAIv8WMeXEKMhbq7JZAvCJ', // Pro Monthly
      'price_1SiczK8WMeXEKMhbr7KcYJDZ', // Pro Yearly
    ];

    let tier: 'free' | 'pro' | 'premium' = 'free';
    
    if (premiumPrices.includes(priceId)) {
      tier = 'premium';
    } else if (proPrices.includes(priceId)) {
      tier = 'pro';
    }

    return NextResponse.json({
      found: true,
      tier,
      message: `Active ${tier} subscription found!`,
      subscriptionId: subscription.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentPeriodEnd: (subscription as any).current_period_end,
    });

  } catch (error) {
    console.error('Check subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    );
  }
}
