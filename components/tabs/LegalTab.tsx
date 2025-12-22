'use client';

import { Card } from '@/components/ui/Card';

export function LegalTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">⚖️</span>
          Legal Information & Estate Planning
        </h1>
        <p className="text-slate-400 mt-1">Important legal considerations for retirement planning</p>
      </div>

      {/* Disclaimer */}
      <Card title="⚠️ Important Disclaimer" icon="⚠️">
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-amber-200 leading-relaxed">
            <strong>This application is for informational and educational purposes only.</strong> The information provided 
            does not constitute financial, tax, or legal advice. RetirePro is not a registered investment advisor, 
            broker-dealer, or tax professional. Always consult with qualified professionals before making any 
            financial decisions.
          </p>
        </div>
      </Card>

      {/* Estate Planning Basics */}
      <Card title="📜 Estate Planning Basics" icon="📜">
        <div className="space-y-4">
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📝</span>
              <h4 className="text-white font-medium">Will & Testament</h4>
            </div>
            <p className="text-slate-300 text-sm">
              A will specifies how you want your assets distributed after death. Without one, 
              state laws determine asset distribution, which may not align with your wishes.
            </p>
          </div>

          <div className="p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🏛️</span>
              <h4 className="text-white font-medium">Trusts</h4>
            </div>
            <p className="text-slate-300 text-sm">
              Trusts can help avoid probate, reduce estate taxes, and provide more control over 
              asset distribution. Common types include revocable living trusts and irrevocable trusts.
            </p>
          </div>

          <div className="p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📋</span>
              <h4 className="text-white font-medium">Power of Attorney</h4>
            </div>
            <p className="text-slate-300 text-sm">
              Designates someone to make financial decisions on your behalf if you become incapacitated. 
              A durable POA remains effective even if you become mentally incompetent.
            </p>
          </div>

          <div className="p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🏥</span>
              <h4 className="text-white font-medium">Healthcare Directive</h4>
            </div>
            <p className="text-slate-300 text-sm">
              Also known as a living will, this document specifies your wishes for medical treatment 
              if you cannot communicate them yourself. Includes healthcare power of attorney.
            </p>
          </div>

          <div className="p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">👤</span>
              <h4 className="text-white font-medium">Beneficiary Designations</h4>
            </div>
            <p className="text-slate-300 text-sm">
              Review beneficiaries on retirement accounts, life insurance, and other assets regularly. 
              These designations override your will, so keep them updated.
            </p>
          </div>
        </div>
      </Card>

      {/* Tax Considerations */}
      <Card title="💰 Retirement Tax Considerations" icon="💰">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <h4 className="text-emerald-400 font-medium mb-2">Pre-Tax Accounts (401k, Traditional IRA)</h4>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Contributions reduce current taxable income</li>
              <li>• Withdrawals taxed as ordinary income</li>
              <li>• Required Minimum Distributions (RMDs) at age 73</li>
              <li>• 10% penalty for early withdrawal before 59½</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-700/50 rounded-lg">
            <h4 className="text-blue-400 font-medium mb-2">Roth Accounts (Roth 401k, Roth IRA)</h4>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Contributions made with after-tax dollars</li>
              <li>• Qualified withdrawals are tax-free</li>
              <li>• No RMDs for Roth IRAs (Roth 401k has RMDs)</li>
              <li>• 5-year rule applies for tax-free earnings</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-700/50 rounded-lg">
            <h4 className="text-purple-400 font-medium mb-2">Social Security Taxation</h4>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Up to 85% of benefits may be taxable</li>
              <li>• Based on "combined income" thresholds</li>
              <li>• Strategic withdrawal planning can minimize taxes</li>
              <li>• Some states don&apos;t tax SS benefits</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-700/50 rounded-lg">
            <h4 className="text-amber-400 font-medium mb-2">Estate & Inheritance Tax</h4>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Federal exemption: $13.61M (2024)</li>
              <li>• Some states have lower exemption thresholds</li>
              <li>• Annual gift exclusion: $18,000 per recipient</li>
              <li>• Spousal portability of unused exemption</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Required Actions Checklist */}
      <Card title="✅ Estate Planning Checklist" icon="✅">
        <div className="space-y-3">
          {[
            { item: 'Create or update your will', icon: '📝' },
            { item: 'Review beneficiary designations', icon: '👥' },
            { item: 'Establish power of attorney', icon: '📋' },
            { item: 'Create healthcare directive/living will', icon: '🏥' },
            { item: 'Consider a trust if appropriate', icon: '🏛️' },
            { item: 'Document account information for heirs', icon: '📁' },
            { item: 'Review life insurance coverage', icon: '🛡️' },
            { item: 'Plan for long-term care needs', icon: '🏠' },
            { item: 'Discuss plans with family members', icon: '👨‍👩‍👧‍👦' },
            { item: 'Schedule annual review of documents', icon: '📅' },
          ].map((item, index) => (
            <label key={index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-xl">{item.icon}</span>
              <span className="text-slate-300">{item.item}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Important Resources */}
      <Card title="🔗 Important Resources" icon="🔗">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a href="https://www.ssa.gov" target="_blank" rel="noopener noreferrer" 
             className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🏛️</span>
              <h4 className="text-white font-medium group-hover:text-emerald-400">Social Security Admin</h4>
            </div>
            <p className="text-slate-400 text-sm">ssa.gov</p>
          </a>

          <a href="https://www.irs.gov" target="_blank" rel="noopener noreferrer"
             className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">💰</span>
              <h4 className="text-white font-medium group-hover:text-emerald-400">IRS</h4>
            </div>
            <p className="text-slate-400 text-sm">irs.gov - Tax information</p>
          </a>

          <a href="https://www.medicare.gov" target="_blank" rel="noopener noreferrer"
             className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🏥</span>
              <h4 className="text-white font-medium group-hover:text-emerald-400">Medicare</h4>
            </div>
            <p className="text-slate-400 text-sm">medicare.gov</p>
          </a>

          <a href="https://www.finra.org" target="_blank" rel="noopener noreferrer"
             className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📊</span>
              <h4 className="text-white font-medium group-hover:text-emerald-400">FINRA</h4>
            </div>
            <p className="text-slate-400 text-sm">Investor protection</p>
          </a>

          <a href="https://www.sec.gov" target="_blank" rel="noopener noreferrer"
             className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📈</span>
              <h4 className="text-white font-medium group-hover:text-emerald-400">SEC</h4>
            </div>
            <p className="text-slate-400 text-sm">Securities regulation</p>
          </a>

          <a href="https://www.cfpb.gov" target="_blank" rel="noopener noreferrer"
             className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🛡️</span>
              <h4 className="text-white font-medium group-hover:text-emerald-400">CFPB</h4>
            </div>
            <p className="text-slate-400 text-sm">Consumer protection</p>
          </a>
        </div>
      </Card>

      {/* Terms of Use */}
      <Card title="📄 Terms of Use" icon="📄">
        <div className="prose prose-invert prose-sm max-w-none">
          <p className="text-slate-300 leading-relaxed">
            By using RetirePro, you acknowledge and agree to the following:
          </p>
          <ul className="text-slate-400 space-y-2 mt-4">
            <li>All calculations are estimates based on the information you provide and assumptions about future events.</li>
            <li>Past performance does not guarantee future results.</li>
            <li>Market returns, inflation rates, and other variables may differ significantly from projections.</li>
            <li>You are responsible for verifying the accuracy of all data entered.</li>
            <li>This tool does not replace professional financial, tax, or legal advice.</li>
            <li>We are not responsible for any decisions made based on information from this application.</li>
            <li>Your data is stored locally in your browser and is not transmitted to our servers.</li>
            <li>We recommend consulting with a CFP®, CPA, or attorney for personalized advice.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
