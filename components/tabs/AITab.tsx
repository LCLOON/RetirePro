'use client';

import { useApp } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function AITab() {
  const { state } = useApp();
  const data = state.retirementData;
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `👋 Hello! I'm your RetirePro AI Advisor. I can help you understand your retirement plan, suggest optimizations, and answer questions about retirement planning.\n\nBased on your current profile:\n• Age: ${data.currentAge}\n• Retirement Age: ${data.retirementAge}\n• Current Savings: $${(data.currentSavingsPreTax + data.currentSavingsRoth + data.currentSavingsAfterTax).toLocaleString()}\n\nHow can I help you today?`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Simulate AI responses based on keywords
  const generateResponse = (question: string): string => {
    const lowerQ = question.toLowerCase();
    
    if (lowerQ.includes('social security') || lowerQ.includes('ss')) {
      return `🏛️ **Social Security Insights**\n\nBased on your settings:\n• Claiming Age: ${data.socialSecurityStartAge}\n• Estimated Benefit: $${data.socialSecurityBenefit.toLocaleString()}/year\n\n**Key Points:**\n• If you claim at 62, benefits are reduced by ~30%\n• Waiting until 70 increases benefits by ~24% vs FRA\n• Your break-even age (claiming early vs late) is typically around 80-82\n\n💡 **Recommendation:** ${data.socialSecurityStartAge < 67 ? 'Consider delaying SS to maximize lifetime benefits, especially if you have other income sources.' : 'Your claiming age looks reasonable!'}`;
    }
    
    if (lowerQ.includes('save') || lowerQ.includes('contribution') || lowerQ.includes('401k')) {
      const totalContrib = data.annualContributionPreTax + data.annualContributionRoth + data.annualContributionAfterTax;
      return `💰 **Savings Analysis**\n\nYour current contributions:\n• Pre-tax: $${data.annualContributionPreTax.toLocaleString()}/year\n• Roth: $${data.annualContributionRoth.toLocaleString()}/year\n• After-tax: $${data.annualContributionAfterTax.toLocaleString()}/year\n• Employer Match: $${data.employerMatch.toLocaleString()}/year\n• **Total: $${totalContrib.toLocaleString()}/year**\n\n💡 **Recommendations:**\n• 2024 401k limit: $23,000 (+ $7,500 catch-up if 50+)\n• IRA limit: $7,000 (+ $1,000 catch-up if 50+)\n• Consider maxing employer match first (free money!)\n• Balance pre-tax vs Roth based on current/future tax rates`;
    }
    
    if (lowerQ.includes('retire') || lowerQ.includes('when')) {
      const yearsToRetire = data.retirementAge - data.currentAge;
      return `🎯 **Retirement Timeline Analysis**\n\n• Current Age: ${data.currentAge}\n• Target Retirement: ${data.retirementAge}\n• Years to Go: ${yearsToRetire}\n\n**Considerations:**\n• Medicare eligibility: Age 65\n• Social Security earliest: Age 62\n• Penalty-free 401k/IRA: Age 59½\n• Required Minimum Distributions: Age 73\n\n💡 **Tip:** ${yearsToRetire < 10 ? 'With less than 10 years to retirement, consider shifting to more conservative investments and building your cash reserve.' : 'You have time on your side! Focus on maximizing growth potential while managing risk.'}`;
    }
    
    if (lowerQ.includes('withdraw') || lowerQ.includes('4%') || lowerQ.includes('spend')) {
      return `📊 **Withdrawal Strategy**\n\nYour settings:\n• Withdrawal Rate: ${data.safeWithdrawalRate}%\n• Annual Expenses: $${data.retirementExpenses.toLocaleString()}\n\n**The 4% Rule:**\n• Historically safe for 30-year retirement\n• Adjust lower (3-3.5%) for longer retirements\n• Consider flexible spending strategies\n\n**Withdrawal Order (Tax Efficiency):**\n1. Taxable accounts first\n2. Tax-deferred (Traditional) next\n3. Roth accounts last (grow tax-free longest)\n\n💡 **Your Rate:** ${data.safeWithdrawalRate > 4 ? '⚠️ Your rate is aggressive. Consider reducing to 4% or less.' : '✅ Your rate looks sustainable!'}`;
    }
    
    if (lowerQ.includes('tax') || lowerQ.includes('roth')) {
      return `💵 **Tax Planning Insights**\n\n**Your Account Mix:**\n• Pre-tax: $${data.currentSavingsPreTax.toLocaleString()}\n• Roth: $${data.currentSavingsRoth.toLocaleString()}\n• After-tax: $${data.currentSavingsAfterTax.toLocaleString()}\n\n**Tax Strategies:**\n• **Roth Conversions:** Consider converting Traditional to Roth in low-income years\n• **Tax-Loss Harvesting:** Offset gains with losses in taxable accounts\n• **Asset Location:** Hold tax-inefficient assets in tax-advantaged accounts\n• **RMD Planning:** Plan for Required Minimum Distributions at 73\n\n💡 **Tip:** A good mix of pre-tax and Roth gives you flexibility to manage tax brackets in retirement.`;
    }
    
    if (lowerQ.includes('inflation') || lowerQ.includes('cost')) {
      return `📈 **Inflation Impact**\n\nYour assumption: ${data.inflationRate}% annually\n\n**Example: $100,000/year expenses**\n• In 10 years: ~$${Math.round(100000 * Math.pow(1.03, 10)).toLocaleString()}\n• In 20 years: ~$${Math.round(100000 * Math.pow(1.03, 20)).toLocaleString()}\n• In 30 years: ~$${Math.round(100000 * Math.pow(1.03, 30)).toLocaleString()}\n\n**Inflation Hedges:**\n• TIPS (Treasury Inflation-Protected Securities)\n• I-Bonds (up to $10K/year)\n• Stocks (historically outpace inflation)\n• Real Estate (rents typically rise with inflation)\n\n💡 **Tip:** Make sure your retirement income sources keep pace with inflation!`;
    }
    
    // Default response
    return `I'd be happy to help with that question! Here are some areas I can provide insights on:\n\n📊 **Analysis Topics:**\n• Social Security optimization\n• Savings & contribution strategies\n• Retirement timing\n• Withdrawal strategies\n• Tax planning\n• Inflation protection\n\n**Quick Stats from Your Plan:**\n• Years to Retirement: ${data.retirementAge - data.currentAge}\n• Total Savings: $${(data.currentSavingsPreTax + data.currentSavingsRoth + data.currentSavingsAfterTax).toLocaleString()}\n• Annual Expenses Goal: $${data.retirementExpenses.toLocaleString()}\n\nTry asking about any of these topics for personalized insights!`;
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      const response = generateResponse(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1000);
  };

  const quickQuestions = [
    'When should I claim Social Security?',
    'Am I saving enough for retirement?',
    'What withdrawal rate is safe?',
    'How can I reduce taxes in retirement?',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            AI Retirement Advisor
          </h1>
          <p className="text-slate-400 mt-1">Get personalized insights and recommendations</p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-emerald-500 text-white rounded-br-md'
                        : 'bg-slate-700 text-slate-200 rounded-bl-md'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-slate-200 p-4 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-slate-700 p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about your retirement plan..."
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button variant="primary" onClick={handleSend} disabled={!inputValue.trim() || isTyping}>
                  Send
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Questions */}
          <Card title="💡 Quick Questions" icon="💡">
            <div className="space-y-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(question)}
                  className="w-full text-left p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 text-sm transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </Card>

          {/* Your Profile Summary */}
          <Card title="📊 Your Profile" icon="📊">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Age</span>
                <span className="text-white">{data.currentAge}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Retire at</span>
                <span className="text-white">{data.retirementAge}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Savings</span>
                <span className="text-emerald-400">${(data.currentSavingsPreTax + data.currentSavingsRoth + data.currentSavingsAfterTax).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Annual Expenses</span>
                <span className="text-white">${data.retirementExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SS Benefit</span>
                <span className="text-white">${data.socialSecurityBenefit.toLocaleString()}/yr</span>
              </div>
            </div>
          </Card>

          {/* Disclaimer */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-start gap-2">
              <span className="text-amber-400">⚠️</span>
              <p className="text-amber-200 text-xs">
                This AI advisor provides general guidance only. Consult with a qualified financial professional for personalized advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
