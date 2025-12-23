import { NextRequest, NextResponse } from 'next/server';

const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';

const SYSTEM_PROMPT = `You are RetirePro AI Advisor, an expert retirement planning assistant. You provide personalized, actionable financial guidance based on the user's specific retirement data.

Your personality:
- Friendly, knowledgeable, and encouraging
- Use clear, jargon-free language
- Provide specific numbers and calculations when relevant
- Use emojis sparingly for visual structure (📊 💰 🎯 ✅ ⚠️)
- Format responses with markdown for readability (headers, bullets, bold)

Key IRS rules and limits for 2024-2025:
- 401(k) contribution limit: $23,000 ($30,500 if 50+)
- IRA contribution limit: $7,000 ($8,000 if 50+)
- Social Security Full Retirement Age: 67 for those born 1960+
- Early SS claiming (62) reduces benefits by ~30%
- Delayed SS (to 70) increases benefits by ~24%
- Medicare eligibility: Age 65
- Penalty-free 401k/IRA withdrawals: Age 59½
- Required Minimum Distributions (RMDs): Age 73
- Inherited IRA: 10-year rule for non-spouse beneficiaries

When discussing:
- Social Security: Consider claiming age, break-even analysis, spousal benefits
- Withdrawals: Discuss tax-efficient order (taxable → traditional → Roth)
- Savings: Compare against maximums, mention employer match
- Investments: Consider risk tolerance, time horizon, diversification
- Taxes: Roth conversions, tax-loss harvesting, asset location

Always provide specific, personalized advice based on the user's data provided in the context.
Acknowledge limitations - you're not a licensed financial advisor and recommend consulting professionals for major decisions.`;

interface RetirementContext {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentSavingsPreTax: number;
  currentSavingsRoth: number;
  currentSavingsAfterTax: number;
  annualContributionPreTax: number;
  annualContributionRoth: number;
  annualContributionAfterTax: number;
  employerMatch: number;
  expectedReturn: number;
  inflationRate: number;
  retirementExpenses: number;
  socialSecurityBenefit: number;
  socialSecurityStartAge: number;
  pensionIncome: number;
  safeWithdrawalRate: number;
  hasSpouse?: boolean;
  spouseSocialSecurityBenefit?: number;
  inheritedIRA?: {
    balance: number;
    yearInherited: number;
    beneficiaryAge: number;
    withdrawalStrategy: string;
    expectedGrowthRate: number;
  };
  dividendPortfolio?: {
    totalValue: number;
    annualIncome: number;
    yieldPercent: number;
    dividendGrowthRate: number;
  };
  cryptoHoldings?: {
    totalValue: number;
    expectedGrowthRate: number;
  };
}

function buildContextMessage(context: RetirementContext): string {
  const yearsToRetire = context.retirementAge - context.currentAge;
  const totalSavings = context.currentSavingsPreTax + context.currentSavingsRoth + context.currentSavingsAfterTax +
    (context.inheritedIRA?.currentValue || 0) +
    (context.dividendPortfolio?.currentValue || 0) +
    (context.cryptoHoldings?.totalValue || 0);
  const totalContrib = context.annualContributionPreTax + context.annualContributionRoth + context.annualContributionAfterTax + context.employerMatch;

  let contextMsg = `
USER'S RETIREMENT PROFILE:
==========================
Age & Timeline:
- Current Age: ${context.currentAge}
- Retirement Age: ${context.retirementAge} (${yearsToRetire} years away)
- Life Expectancy: ${context.lifeExpectancy}
- Years in Retirement: ${context.lifeExpectancy - context.retirementAge}

Current Savings:
- Pre-tax (401k/Traditional IRA): $${context.currentSavingsPreTax.toLocaleString()}
- Roth: $${context.currentSavingsRoth.toLocaleString()}
- After-tax/Brokerage: $${context.currentSavingsAfterTax.toLocaleString()}
- TOTAL SAVINGS: $${totalSavings.toLocaleString()}

Annual Contributions:
- Pre-tax (401k): $${context.annualContributionPreTax.toLocaleString()}/year
- Roth IRA: $${context.annualContributionRoth.toLocaleString()}/year
- After-tax Brokerage: $${context.annualContributionAfterTax.toLocaleString()}/year
- Employer Match: $${context.employerMatch.toLocaleString()}/year
- TOTAL CONTRIBUTIONS: $${totalContrib.toLocaleString()}/year

Investment Assumptions:
- Expected Return: ${(context.expectedReturn * 100).toFixed(1)}%
- Inflation Rate: ${(context.inflationRate * 100).toFixed(1)}%
- Safe Withdrawal Rate: ${context.safeWithdrawalRate}%

Retirement Income:
- Annual Expenses Goal: $${context.retirementExpenses.toLocaleString()}
- Social Security: $${context.socialSecurityBenefit.toLocaleString()}/year (claiming at age ${context.socialSecurityStartAge})
- Pension: $${context.pensionIncome.toLocaleString()}/year`;

  if (context.hasSpouse && context.spouseSocialSecurityBenefit) {
    contextMsg += `
- Spouse SS: $${context.spouseSocialSecurityBenefit.toLocaleString()}/year`;
  }

  if (context.inheritedIRA && context.inheritedIRA.balance > 0) {
    contextMsg += `

Inherited IRA:
- Balance: $${context.inheritedIRA.balance.toLocaleString()}
- Year Inherited: ${context.inheritedIRA.yearInherited}
- Beneficiary Age at Inheritance: ${context.inheritedIRA.beneficiaryAge}
- Withdrawal Strategy: ${context.inheritedIRA.withdrawalStrategy}
- Expected Growth Rate: ${(context.inheritedIRA.expectedGrowthRate * 100).toFixed(1)}%`;
  }

  if (context.dividendPortfolio && context.dividendPortfolio.totalValue > 0) {
    contextMsg += `

Dividend Portfolio:
- Total Value: $${context.dividendPortfolio.totalValue.toLocaleString()}
- Annual Dividend Income: $${context.dividendPortfolio.annualIncome.toLocaleString()}
- Yield: ${context.dividendPortfolio.yieldPercent.toFixed(2)}%
- Dividend Growth Rate: ${(context.dividendPortfolio.dividendGrowthRate * 100).toFixed(1)}%`;
  }

  if (context.cryptoHoldings && context.cryptoHoldings.totalValue > 0) {
    contextMsg += `

Cryptocurrency Holdings:
- Total Value: $${context.cryptoHoldings.totalValue.toLocaleString()}
- Expected Growth Rate: ${(context.cryptoHoldings.expectedGrowthRate * 100).toFixed(1)}%`;
  }

  return contextMsg;
}

export async function POST(request: NextRequest) {
  try {
    if (!XAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, context, conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build the context message from retirement data
    const contextMessage = context ? buildContextMessage(context) : '';

    // Build messages array
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add context as first user message if available
    if (contextMessage) {
      messages.push({
        role: 'user',
        content: `Here is my retirement profile for context:\n${contextMessage}\n\nPlease use this information to provide personalized advice.`
      });
      messages.push({
        role: 'assistant',
        content: "I've reviewed your retirement profile. I'm ready to help with personalized advice based on your specific situation. What questions do you have?"
      });
    }

    // Add conversation history
    for (const msg of conversationHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    // Call xAI API
    const response = await fetch(XAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-3-latest',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'AI service error', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error('AI Advisor error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
