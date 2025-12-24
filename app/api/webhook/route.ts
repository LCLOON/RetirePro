import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout completed:', session.id);
      
      // Send payment confirmation email
      if (session.customer_details?.email) {
        const plan = session.metadata?.plan || 'Pro';
        const billingPeriod = session.metadata?.billingPeriod || 'monthly';
        const amount = session.amount_total || 0;
        
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'payment-confirmation',
              to: session.customer_details.email,
              data: {
                userName: session.customer_details.name,
                plan,
                amount,
                billingPeriod,
              },
            }),
          });
          console.log('Payment confirmation email sent to:', session.customer_details.email);
        } catch (emailError) {
          console.error('Failed to send payment confirmation email:', emailError);
          // Don't fail the webhook if email fails
        }
      }
      
      // TODO: Update user subscription in your database
      // - session.customer (Stripe customer ID)
      // - session.subscription (Stripe subscription ID)
      // - session.metadata.plan (pro/premium)
      break;
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription updated:', subscription.id);
      // TODO: Update subscription status in database
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription canceled:', subscription.id);
      // TODO: Downgrade user to free plan in database
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      console.log('Payment failed:', invoice.id);
      
      // Send payment failure email
      if (invoice.customer_email) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'payment-failed',
              to: invoice.customer_email,
              data: {
                userName: invoice.customer_name,
                plan: invoice.lines.data[0]?.description || 'Pro',
                amount: invoice.amount_due || 0,
                retryDate: invoice.next_payment_attempt 
                  ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString()
                  : undefined,
              },
            }),
          });
          console.log('Payment failed email sent to:', invoice.customer_email);
        } catch (emailError) {
          console.error('Failed to send payment failed email:', emailError);
        }
      }
      
      // TODO: Notify user of failed payment
      break;
    }
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
