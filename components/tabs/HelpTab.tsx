'use client';

import { Card, CardGrid } from '@/components/ui';

export function HelpTab() {
  const faqs = [
    {
      question: 'How do I get started?',
      answer: 'Start by entering your basic information in the Data Entry tab. Fill in your current age, retirement age, savings, and expected expenses. Then click Calculate to see your projections.',
    },
    {
      question: 'What is Monte Carlo simulation?',
      answer: 'Monte Carlo simulation runs thousands of scenarios with random market returns to estimate the probability of your retirement plan succeeding. A success rate above 80% is generally considered good.',
    },
    {
      question: 'What does "success rate" mean?',
      answer: 'The success rate represents the percentage of simulations where your money lasted through your entire retirement. A 90% success rate means that in 90% of scenarios, you didn\'t run out of money.',
    },
    {
      question: 'How should I interpret the results?',
      answer: 'Look at the expected, optimistic, and pessimistic scenarios. The expected scenario uses your entered return rates. Optimistic adds 2% and pessimistic subtracts 2% to show a range of outcomes.',
    },
    {
      question: 'What return rate should I use?',
      answer: 'A balanced portfolio historically returns around 6-8% before inflation. For pre-retirement, you might use 7%. For post-retirement, a more conservative 5-6% is common.',
    },
    {
      question: 'Should I include Social Security?',
      answer: 'Yes! Social Security provides a guaranteed income floor in retirement. Use the Social Security tab to estimate your benefits and include them in your calculations.',
    },
    {
      question: 'How often should I recalculate?',
      answer: 'Review your plan at least annually, or whenever there\'s a major life change (job change, inheritance, market crash, etc.).',
    },
    {
      question: 'What is the 4% rule?',
      answer: 'The 4% rule suggests withdrawing 4% of your portfolio in the first year of retirement, then adjusting for inflation each year. It\'s a starting point, but Monte Carlo gives more nuanced results.',
    },
  ];
  
  const keyTerms = [
    { term: 'PIA', definition: 'Primary Insurance Amount - your Social Security benefit at full retirement age.' },
    { term: 'FRA', definition: 'Full Retirement Age - when you\'re eligible for 100% of your Social Security benefit (67 for those born 1960+).' },
    { term: 'AIME', definition: 'Average Indexed Monthly Earnings - your top 35 years of earnings, indexed for inflation.' },
    { term: 'RMD', definition: 'Required Minimum Distribution - mandatory withdrawals from retirement accounts starting at age 73.' },
    { term: 'COLA', definition: 'Cost of Living Adjustment - annual increase to Social Security benefits based on inflation.' },
    { term: 'Safe Withdrawal Rate', definition: 'The amount you can withdraw annually without depleting your portfolio.' },
  ];
  
  return (
    <div className="space-y-6">
      {/* Quick Start Guide */}
      <Card title="Quick Start Guide" subtitle="Get started with RetirePro in 5 minutes">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex gap-4 p-4 bg-blue-900/30 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              1
            </div>
            <div>
              <h4 className="font-medium text-white">Enter Your Data</h4>
              <p className="text-sm text-slate-400 mt-1">
                Go to the Data Entry tab and fill in your current financial situation.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 p-4 bg-green-900/30 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              2
            </div>
            <div>
              <h4 className="font-medium text-white">Calculate</h4>
              <p className="text-sm text-slate-400 mt-1">
                Click the Calculate button to run projections and Monte Carlo simulations.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 p-4 bg-purple-900/30 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              3
            </div>
            <div>
              <h4 className="font-medium text-white">Review Results</h4>
              <p className="text-sm text-slate-400 mt-1">
                Check Results and Charts tabs to see if you&apos;re on track for retirement.
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* FAQs */}
      <Card title="Frequently Asked Questions">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details 
              key={index} 
              className="group border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                <svg 
                  className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-4 pb-4 text-sm text-slate-400">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </Card>
      
      {/* Key Terms */}
      <Card title="Key Terms" subtitle="Common retirement planning terminology">
        <CardGrid columns={2}>
          {keyTerms.map((item, index) => (
            <div key={index} className="p-4 bg-slate-700/50 rounded-lg">
              <h4 className="font-bold text-gray-900 dark:text-white">{item.term}</h4>
              <p className="text-sm text-slate-400 mt-1">{item.definition}</p>
            </div>
          ))}
        </CardGrid>
      </Card>
      
      {/* Tips */}
      <Card title="Pro Tips" subtitle="Get the most out of RetirePro">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-3 p-4 border border-green-800 bg-green-900/30 rounded-lg">
            <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-green-200">Save Regularly</h4>
              <p className="text-sm text-green-300">
                Use the Save button to store your data locally. Export to JSON for backups.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 p-4 border border-blue-800 bg-blue-900/30 rounded-lg">
            <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <h4 className="font-medium text-blue-200">Try Different Scenarios</h4>
              <p className="text-sm text-blue-300">
                Adjust retirement age, expenses, and return rates to see how changes affect outcomes.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 p-4 border border-purple-800 bg-purple-900/30 rounded-lg">
            <svg className="w-6 h-6 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div>
              <h4 className="font-medium text-purple-200">Track Your Progress</h4>
              <p className="text-sm text-purple-300">
                Use Net Worth tab to monitor your total wealth over time.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 p-4 border border-amber-800 bg-amber-900/30 rounded-lg">
            <svg className="w-6 h-6 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-amber-200">Optimize Social Security</h4>
              <p className="text-sm text-amber-300">
                Delaying Social Security to 70 can increase lifetime benefits significantly.
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Disclaimer */}
      <Card title="Disclaimer">
        <div className="p-4 bg-slate-700/50 rounded-lg text-sm text-slate-400">
          <p className="mb-3">
            <strong className="text-gray-900 dark:text-white">Important:</strong> RetirePro is for educational and planning purposes only. 
            It is not financial advice.
          </p>
          <p className="mb-3">
            The calculations and projections provided are estimates based on the information you enter and historical averages. 
            Actual results will vary based on market performance, inflation, taxes, and other factors.
          </p>
          <p>
            Always consult with a qualified financial advisor before making important financial decisions. 
            Past performance does not guarantee future results.
          </p>
        </div>
      </Card>
    </div>
  );
}
