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
      console.log('Customer email:', session.customer_details?.email);
      console.log('Session metadata:', session.metadata);
      
      // Check if we've already sent the confirmation email
      // Use subscription metadata as the source of truth (persists across serverless instances)
      if (session.subscription) {
        try {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          if (subscription.metadata?.confirmation_email_sent === 'true') {
            console.log('Confirmation email already sent for subscription:', session.subscription);
            break;
          }
          
          // Mark as sent BEFORE sending to prevent race conditions
          await stripe.subscriptions.update(session.subscription as string, {
            metadata: {
              ...subscription.metadata,
              confirmation_email_sent: 'true',
              confirmation_session_id: session.id,
            },
          });
          console.log('Marked subscription as confirmation_email_sent');
        } catch (subCheckError) {
          console.error('Error checking/updating subscription for dedup:', subCheckError);
          // Continue anyway - better to potentially send duplicate than miss email
        }
      }
      
      // Send payment confirmation email
      if (session.customer_details?.email) {
        // Try to determine plan from metadata, or fetch from line items
        let plan = session.metadata?.plan;
        let billingPeriod = session.metadata?.billingPeriod || 'monthly';
        const amount = session.amount_total || 0;
        
        console.log('Raw metadata plan:', plan, 'billingPeriod:', billingPeriod);
        
        // If no plan in metadata, try to get it from the subscription/line items
        if (!plan && session.subscription) {
          try {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string, {
              expand: ['items.data.price.product'],
            });
            const item = subscription.items.data[0];
            if (item?.price?.product) {
              const product = item.price.product as Stripe.Product;
              const productName = product.name?.toLowerCase() || '';
              plan = productName.includes('premium') ? 'premium' : 'pro';
              // Detect billing period from interval
              billingPeriod = item.price.recurring?.interval === 'year' ? 'yearly' : 'monthly';
            }
            console.log('Detected plan from subscription:', plan, billingPeriod);
          } catch (subError) {
            console.error('Failed to fetch subscription details:', subError);
            plan = 'pro'; // Default fallback
          }
        }
        
        // Normalize and capitalize plan name
        plan = plan || 'pro'; // Final fallback
        const planLower = plan.toLowerCase();
        const planDisplay = planLower === 'premium' ? 'Premium' : 'Pro';
        
        console.log('Final plan for email:', planDisplay, 'billing:', billingPeriod);
        
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://retirepro.io';
        console.log('Sending email via:', `${appUrl}/api/send-email`);
        
        try {
          // Use subscription ID as idempotency key to prevent duplicate emails
          const idempotencyKey = session.subscription 
            ? `payment-confirmation-${session.subscription}` 
            : `payment-confirmation-${session.id}`;
          
          const emailResponse = await fetch(`${appUrl}/api/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'payment-confirmation',
              to: session.customer_details.email,
              idempotencyKey,
              data: {
                userName: session.customer_details.name,
                plan: planDisplay,
                amount,
                billingPeriod,
              },
            }),
          });
          const emailResult = await emailResponse.json();
          console.log('Payment confirmation email result:', emailResult);
        } catch (emailError) {
          console.error('Failed to send payment confirmation email:', emailError);
          // Don't fail the webhook if email fails
        }
      } else {
        console.log('No customer email found in session');
      }
      
      // Log subscription info for debugging
      if (session.subscription) {
        console.log('Subscription ID:', session.subscription);
      }
      if (session.customer) {
        console.log('Customer ID:', session.customer);
      }
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
