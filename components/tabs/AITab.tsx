'use client';

import { useApp } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function AITab() {
  const { state } = useApp();
  const data = state.retirementData;
  
  const totalSavings = data.currentSavingsPreTax + data.currentSavingsRoth + data.currentSavingsAfterTax +
    (data.hasInheritedIRA ? data.inheritedIRA.balance : 0) +
    (data.hasDividendPortfolio && data.dividendPortfolio.includeInProjections ? data.dividendPortfolio.currentValue : 0) +
    (data.hasCryptoHoldings && data.cryptoHoldings.includeInProjections ? data.cryptoHoldings.currentValue : 0);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `👋 Hello! I'm your RetirePro AI Advisor, powered by Grok.\n\nI've reviewed your retirement profile:\n• Age: ${data.currentAge} → Retiring at ${data.retirementAge} (${data.retirementAge - data.currentAge} years away)\n• Total Savings: $${totalSavings.toLocaleString()}\n• Social Security: $${data.socialSecurityBenefit.toLocaleString()}/year at age ${data.socialSecurityStartAge}\n• Retirement Expenses: $${data.retirementExpenses.toLocaleString()}/year\n\nAsk me anything about your retirement plan! I can help with:\n• Social Security optimization\n• Withdrawal strategies\n• Tax planning\n• Investment allocation\n• Savings goals\n• And much more!`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build context object from retirement data
  const buildContext = () => {
    return {
      currentAge: data.currentAge,
      retirementAge: data.retirementAge,
      lifeExpectancy: data.lifeExpectancy,
      currentSavingsPreTax: data.currentSavingsPreTax,
      currentSavingsRoth: data.currentSavingsRoth,
      currentSavingsAfterTax: data.currentSavingsAfterTax,
      annualContributionPreTax: data.annualContributionPreTax,
      annualContributionRoth: data.annualContributionRoth,
      annualContributionAfterTax: data.annualContributionAfterTax,
      employerMatch: data.employerMatch,
      expectedReturn: data.preRetirementReturn,
      inflationRate: data.inflationRate,
      retirementExpenses: data.retirementExpenses,
      socialSecurityBenefit: data.socialSecurityBenefit,
      socialSecurityStartAge: data.socialSecurityStartAge,
      pensionIncome: data.pensionIncome,
      safeWithdrawalRate: data.safeWithdrawalRate,
      hasSpouse: data.hasSpouse,
      spouseSocialSecurityBenefit: data.spouseSocialSecurityBenefit,
      inheritedIRA: data.inheritedIRA,
      dividendPortfolio: data.dividendPortfolio,
      cryptoHoldings: data.cryptoHoldings,
    };
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setIsTyping(true);
    setError(null);
    
    try {
      // Build conversation history (exclude the initial welcome message for cleaner context)
      const conversationHistory = messages.slice(1).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: buildContext(),
          conversationHistory,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to get response');
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: responseData.response 
      }]);
    } catch (err) {
      console.error('AI Advisor error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ I apologize, but I encountered an error. Please try again in a moment.' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `👋 Hello! I'm your RetirePro AI Advisor, powered by Grok.\n\nI've reviewed your retirement profile:\n• Age: ${data.currentAge} → Retiring at ${data.retirementAge} (${data.retirementAge - data.currentAge} years away)\n• Total Savings: $${totalSavings.toLocaleString()}\n• Social Security: $${data.socialSecurityBenefit.toLocaleString()}/year at age ${data.socialSecurityStartAge}\n• Retirement Expenses: $${data.retirementExpenses.toLocaleString()}/year\n\nHow can I help you today?`
      }
    ]);
    setError(null);
  };

  const quickQuestions = [
    'When should I claim Social Security?',
    'Am I saving enough for retirement?',
    'What withdrawal strategy is best for me?',
    'How can I reduce taxes in retirement?',
    'Should I do a Roth conversion?',
    'What is my retirement readiness score?',
  ];

  // Simple markdown-like formatting
  const formatMessage = (content: string) => {
    // Convert **bold** to strong
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert headers
    formatted = formatted.replace(/^### (.*$)/gim, '<h4 class="text-emerald-400 font-semibold mt-3 mb-1">$1</h4>');
    formatted = formatted.replace(/^## (.*$)/gim, '<h3 class="text-emerald-400 font-semibold text-lg mt-3 mb-1">$1</h3>');
    // Convert bullet points
    formatted = formatted.replace(/^• (.*$)/gim, '<li class="ml-4">$1</li>');
    formatted = formatted.replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>');
    // Convert numbered lists
    formatted = formatted.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>');
    
    return formatted;
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            AI Retirement Advisor
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">Powered by Grok</span>
          </h1>
          <p className="text-slate-400 mt-1">Get personalized insights and recommendations</p>
        </div>
        <Button variant="secondary" onClick={handleClearChat}>
          🔄 New Chat
        </Button>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Main Chat */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-[450px] max-h-[calc(100vh-220px)] overflow-hidden" noWrapper>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-emerald-500 text-white rounded-br-md'
                        : 'bg-slate-700 text-slate-200 rounded-bl-md'
                    }`}
                  >
                    <div 
                      className="whitespace-pre-wrap text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-slate-200 p-4 rounded-2xl rounded-bl-md">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400">Grok is thinking</span>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error display */}
            {error && (
              <div className="mx-4 mb-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-slate-700 p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask about your retirement plan..."
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={isTyping}
                />
                <Button 
                  variant="primary" 
                  onClick={handleSend} 
                  disabled={!inputValue.trim() || isTyping}
                >
                  {isTyping ? '...' : 'Send'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 overflow-y-auto">
          {/* Quick Questions */}
          <Card title="💡 Quick Questions" icon="💡">
            <div className="space-y-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInputValue(question);
                  }}
                  disabled={isTyping}
                  className="w-full text-left p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 text-sm transition-colors disabled:opacity-50"
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
                <span className="text-slate-400">Life Expectancy</span>
                <span className="text-white">{data.lifeExpectancy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Savings</span>
                <span className="text-emerald-400">${totalSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Annual Expenses</span>
                <span className="text-white">${data.retirementExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SS Benefit</span>
                <span className="text-white">${data.socialSecurityBenefit.toLocaleString()}/yr</span>
              </div>
              {data.hasSpouse && data.spouseSocialSecurityBenefit > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Spouse SS</span>
                  <span className="text-white">${data.spouseSocialSecurityBenefit.toLocaleString()}/yr</span>
                </div>
              )}
              {data.inheritedIRA && data.inheritedIRA.balance > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Inherited IRA</span>
                  <span className="text-white">${data.inheritedIRA.balance.toLocaleString()}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Disclaimer */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-start gap-2">
              <span className="text-amber-400">⚠️</span>
              <p className="text-amber-200 text-xs">
                This AI advisor provides general guidance only and is not a substitute for professional financial advice. Consult with a qualified financial advisor for personalized recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
