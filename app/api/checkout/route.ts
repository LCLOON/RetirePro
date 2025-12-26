import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - use IP or forwarded IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const rateLimitResult = rateLimit(`checkout:${ip}`, RATE_LIMITS.checkout);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many checkout attempts. Please wait a moment and try again.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)),
          }
        }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Missing STRIPE_SECRET_KEY.' },
        { status: 500 }
      );
    }

    const { priceId, billingPeriod, plan } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Check if priceId looks valid (starts with price_)
    if (!priceId.startsWith('price_')) {
      return NextResponse.json(
        { error: `Invalid price ID format: ${priceId}. Environment variables may not be configured.` },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://retirepro.io';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      // Omitting payment_method_types lets Stripe show all methods enabled in Dashboard
      // This includes: Card, Link, Amazon Pay, Apple Pay, Cash App, etc.
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/success?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?canceled=true`,
      metadata: {
        plan,
        billingPeriod,
      },
      // Enable phone number collection for Link verification
      phone_number_collection: {
        enabled: true,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Checkout failed: ${message}` },
      { status: 500 }
    );
  }
}
