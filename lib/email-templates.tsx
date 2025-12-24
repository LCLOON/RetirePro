// Email template functions that return HTML strings

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #1e293b;
  max-width: 600px;
  margin: 0 auto;
`;

const buttonStyles = `
  display: inline-block;
  padding: 14px 28px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  margin: 24px 0;
`;

export function welcomeEmail(userName?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Welcome to RetirePro</title>
      </head>
      <body style="${baseStyles} background-color: #f8fafc; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #10b981; font-size: 32px; margin: 0;">🎯 RetirePro</h1>
          </div>

          <!-- Greeting -->
          <h2 style="color: #1e293b; font-size: 24px; margin-bottom: 16px;">
            Welcome${userName ? `, ${userName}` : ''}! 👋
          </h2>

          <p style="font-size: 16px; color: #475569; margin-bottom: 16px;">
            Thank you for joining RetirePro! We're excited to help you plan your retirement with confidence.
          </p>

          <!-- Getting Started -->
          <div style="background: #f1f5f9; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #1e293b; font-size: 18px; margin-top: 0;">🚀 Get Started in 3 Steps</h3>
            <ol style="color: #475569; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 12px;">
                <strong>Enter your financial information</strong> - Add your current savings, retirement accounts, and income sources
              </li>
              <li style="margin-bottom: 12px;">
                <strong>Set your retirement goals</strong> - Define when you want to retire and your expected expenses
              </li>
              <li style="margin-bottom: 12px;">
                <strong>Review your projections</strong> - See your year-by-year retirement plan with RMDs, taxes, and more
              </li>
            </ol>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://retirepro.io" style="${buttonStyles}">
              Start Planning Your Retirement →
            </a>
          </div>

          <!-- Features Highlight -->
          <h3 style="color: #1e293b; font-size: 18px; margin-top: 32px;">✨ What You Can Do:</h3>
          <ul style="color: #475569; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Calculate Required Minimum Distributions (RMDs)</li>
            <li style="margin-bottom: 8px;">Model multiple retirement scenarios</li>
            <li style="margin-bottom: 8px;">Track inherited IRA distributions (SECURE Act compliant)</li>
            <li style="margin-bottom: 8px;">Run Monte Carlo simulations for market volatility</li>
            <li style="margin-bottom: 8px;">Project Social Security, pension, and rental income</li>
            <li style="margin-bottom: 8px;">Plan mortgage payoffs and healthcare costs</li>
          </ul>

          <!-- Support -->
          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin-top: 32px; border-radius: 4px;">
            <p style="margin: 0; color: #065f46;">
              <strong>Need help?</strong> Reply to this email or contact us at 
              <a href="mailto:support@retirepro.io" style="color: #10b981;">support@retirepro.io</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 14px;">
            <p style="margin: 8px 0;">RetirePro - Professional Retirement Planning</p>
            <p style="margin: 8px 0;">
              <a href="https://retirepro.io" style="color: #10b981; text-decoration: none;">retirepro.io</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function paymentConfirmationEmail(details: {
  userName?: string;
  plan: string;
  amount: number;
  billingPeriod: string;
  nextBillingDate?: string;
}): string {
  const { userName, plan, amount, billingPeriod, nextBillingDate } = details;
  const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
  const formattedAmount = (amount / 100).toFixed(2); // Convert cents to dollars

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Payment Confirmation - RetirePro</title>
      </head>
      <body style="${baseStyles} background-color: #f8fafc; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #10b981; font-size: 32px; margin: 0;">🎯 RetirePro</h1>
          </div>

          <!-- Success Icon -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: #d1fae5; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; font-size: 40px;">
              ✓
            </div>
          </div>

          <!-- Greeting -->
          <h2 style="color: #1e293b; font-size: 24px; margin-bottom: 16px; text-align: center;">
            Payment Confirmed${userName ? `, ${userName}` : ''}! 🎉
          </h2>

          <p style="font-size: 16px; color: #475569; text-align: center; margin-bottom: 24px;">
            Thank you for upgrading to RetirePro ${planName}. Your subscription is now active!
          </p>

          <!-- Payment Details -->
          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #1e293b; font-size: 18px; margin-top: 0; margin-bottom: 16px;">📋 Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Plan:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">
                  RetirePro ${planName}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Amount:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">
                  $${formattedAmount}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Billing:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">
                  ${billingPeriod.charAt(0).toUpperCase() + billingPeriod.slice(1)}
                </td>
              </tr>
              ${nextBillingDate ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Next Billing:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">
                  ${nextBillingDate}
                </td>
              </tr>
              ` : ''}
            </table>
          </div>

          <!-- What's Unlocked -->
          <div style="background: #f0fdf4; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #059669; font-size: 18px; margin-top: 0;">✨ What You've Unlocked</h3>
            <ul style="color: #065f46; margin: 0; padding-left: 20px;">
              ${plan === 'pro' ? `
                <li style="margin-bottom: 8px;">Unlimited retirement scenarios</li>
                <li style="margin-bottom: 8px;">Advanced tax optimization tools</li>
                <li style="margin-bottom: 8px;">Monte Carlo simulations</li>
                <li style="margin-bottom: 8px;">Comprehensive projections</li>
                <li style="margin-bottom: 8px;">Priority email support</li>
                <li style="margin-bottom: 8px;">Export & PDF reports</li>
              ` : `
                <li style="margin-bottom: 8px;">Everything in Pro</li>
                <li style="margin-bottom: 8px;">AI-powered retirement advisor</li>
                <li style="margin-bottom: 8px;">Custom scenario modeling</li>
                <li style="margin-bottom: 8px;">White-glove support</li>
                <li style="margin-bottom: 8px;">Annual financial review</li>
              `}
            </ul>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://retirepro.io" style="${buttonStyles}">
              Access Your Dashboard →
            </a>
          </div>

          <!-- Support -->
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-top: 32px; border-radius: 4px;">
            <p style="margin: 0; color: #78350f;">
              <strong>Questions about your subscription?</strong> Contact us at 
              <a href="mailto:support@retirepro.io" style="color: #f59e0b;">support@retirepro.io</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 14px;">
            <p style="margin: 8px 0;">You can manage your subscription anytime in your account settings.</p>
            <p style="margin: 8px 0;">RetirePro - Professional Retirement Planning</p>
            <p style="margin: 8px 0;">
              <a href="https://retirepro.io" style="color: #10b981; text-decoration: none;">retirepro.io</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function paymentFailedEmail(details: {
  userName?: string;
  plan: string;
  amount: number;
  retryDate?: string;
}): string {
  const { userName, plan, amount, retryDate } = details;
  const formattedAmount = (amount / 100).toFixed(2);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Payment Failed - RetirePro</title>
      </head>
      <body style="${baseStyles} background-color: #f8fafc; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #10b981; font-size: 32px; margin: 0;">🎯 RetirePro</h1>
          </div>

          <!-- Alert Icon -->
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: #fee2e2; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; font-size: 40px;">
              ⚠️
            </div>
          </div>

          <!-- Message -->
          <h2 style="color: #1e293b; font-size: 24px; margin-bottom: 16px; text-align: center;">
            Payment Update Required${userName ? `, ${userName}` : ''}
          </h2>

          <p style="font-size: 16px; color: #475569; text-align: center; margin-bottom: 24px;">
            We couldn't process your payment of <strong>$${formattedAmount}</strong> for RetirePro ${plan}.
          </p>

          <!-- Action Required -->
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 24px 0; border-radius: 4px;">
            <h3 style="color: #991b1b; font-size: 16px; margin-top: 0;">Action Required</h3>
            <p style="color: #7f1d1d; margin-bottom: 12px;">
              Your subscription will remain active until ${retryDate || 'the next billing attempt'}. 
              To avoid service interruption, please update your payment method.
            </p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://retirepro.io/settings/billing" style="${buttonStyles}">
              Update Payment Method →
            </a>
          </div>

          <!-- Common Reasons -->
          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #1e293b; font-size: 16px; margin-top: 0;">Common Reasons for Payment Failure:</h3>
            <ul style="color: #64748b; font-size: 14px; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Card expired or reaching expiration</li>
              <li style="margin-bottom: 8px;">Insufficient funds</li>
              <li style="margin-bottom: 8px;">Card declined by bank</li>
              <li style="margin-bottom: 8px;">Incorrect billing information</li>
            </ul>
          </div>

          <!-- Support -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 32px;">
            <p style="color: #64748b; font-size: 14px; text-align: center;">
              Need help? Contact us at 
              <a href="mailto:support@retirepro.io" style="color: #10b981;">support@retirepro.io</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="margin-top: 24px; text-align: center; color: #94a3b8; font-size: 14px;">
            <p style="margin: 8px 0;">RetirePro - Professional Retirement Planning</p>
            <p style="margin: 8px 0;">
              <a href="https://retirepro.io" style="color: #10b981; text-decoration: none;">retirepro.io</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
