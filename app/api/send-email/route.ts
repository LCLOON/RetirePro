import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { welcomeEmail, paymentConfirmationEmail, paymentFailedEmail } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, data } = body;

    if (!to || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: to, type' },
        { status: 400 }
      );
    }

    let html: string;
    let subject: string;

    switch (type) {
      case 'welcome':
        subject = 'Welcome to RetirePro! 🎯';
        html = welcomeEmail(data?.userName);
        break;

      case 'payment-confirmation':
        subject = '✓ Payment Confirmed - RetirePro';
        html = paymentConfirmationEmail({
          userName: data?.userName,
          plan: data?.plan || 'Pro',
          amount: data?.amount || 0,
          billingPeriod: data?.billingPeriod || 'monthly',
          nextBillingDate: data?.nextBillingDate,
        });
        break;

      case 'payment-failed':
        subject = '⚠️ Payment Update Required - RetirePro';
        html = paymentFailedEmail({
          userName: data?.userName,
          plan: data?.plan || 'Pro',
          amount: data?.amount || 0,
          retryDate: data?.retryDate,
        });
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    const result = await sendEmail({
      to,
      subject,
      html,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Send email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
