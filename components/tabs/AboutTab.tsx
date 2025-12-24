'use client';

import { Card } from '@/components/ui/Card';

export function AboutTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl shadow-2xl shadow-emerald-500/25 mb-6">
          <span className="text-5xl">💎</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">RetirePro</h1>
        <p className="text-xl text-emerald-400">Professional Retirement Planning</p>
        <p className="text-slate-400 mt-2">Version 3.0 Web Edition</p>
      </div>

      {/* Description */}
      <Card>
        <div className="text-center p-6">
          <p className="text-slate-300 leading-relaxed max-w-2xl mx-auto">
            RetirePro is a comprehensive retirement planning tool designed to help you visualize, 
            plan, and optimize your path to a secure retirement. Built with the same powerful 
            calculations as our desktop application, now available anywhere in your browser.
          </p>
        </div>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="text-center p-6">
          <span className="text-4xl mb-4 block">📊</span>
          <h3 className="text-white font-semibold mb-2">Advanced Analytics</h3>
          <p className="text-slate-400 text-sm">Monte Carlo simulations, scenario analysis, and detailed projections</p>
        </Card>
        
        <Card className="text-center p-6">
          <span className="text-4xl mb-4 block">🏛️</span>
          <h3 className="text-white font-semibold mb-2">Social Security Optimizer</h3>
          <p className="text-slate-400 text-sm">Find the optimal claiming strategy for maximum lifetime benefits</p>
        </Card>
        
        <Card className="text-center p-6">
          <span className="text-4xl mb-4 block">💰</span>
          <h3 className="text-white font-semibold mb-2">Tax Planning</h3>
          <p className="text-slate-400 text-sm">Roth conversion analysis and tax-efficient withdrawal strategies</p>
        </Card>
        
        <Card className="text-center p-6">
          <span className="text-4xl mb-4 block">🏠</span>
          <h3 className="text-white font-semibold mb-2">Mortgage Calculator</h3>
          <p className="text-slate-400 text-sm">Track home equity and plan for mortgage payoff in retirement</p>
        </Card>
        
        <Card className="text-center p-6">
          <span className="text-4xl mb-4 block">📋</span>
          <h3 className="text-white font-semibold mb-2">Budget Planning</h3>
          <p className="text-slate-400 text-sm">Detailed expense tracking and retirement budget projections</p>
        </Card>
        
        <Card className="text-center p-6">
          <span className="text-4xl mb-4 block">🤖</span>
          <h3 className="text-white font-semibold mb-2">AI Advisor</h3>
          <p className="text-slate-400 text-sm">Get personalized insights and recommendations for your plan</p>
        </Card>
      </div>

      {/* Technology Stack */}
      <Card title="🛠️ Built With" icon="🛠️">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-700/50 rounded-lg text-center">
            <span className="text-3xl block mb-2">⚛️</span>
            <p className="text-white font-medium">React 19</p>
            <p className="text-slate-400 text-sm">UI Framework</p>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg text-center">
            <span className="text-3xl block mb-2">▲</span>
            <p className="text-white font-medium">Next.js 15</p>
            <p className="text-slate-400 text-sm">App Framework</p>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg text-center">
            <span className="text-3xl block mb-2">🎨</span>
            <p className="text-white font-medium">Tailwind CSS</p>
            <p className="text-slate-400 text-sm">Styling</p>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg text-center">
            <span className="text-3xl block mb-2">📈</span>
            <p className="text-white font-medium">Recharts</p>
            <p className="text-slate-400 text-sm">Charts</p>
          </div>
        </div>
      </Card>

      {/* Version History */}
      <Card title="📜 Version History" icon="📜">
        <div className="space-y-4">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-400 font-semibold">v3.0 Web Edition</span>
              <span className="text-slate-400 text-sm">December 2025</span>
            </div>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Complete web application rebuild</li>
              <li>• DividendPro-style dark theme interface</li>
              <li>• All features from desktop version</li>
              <li>• Responsive design for all devices</li>
            </ul>
          </div>
          
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">v2.0 Desktop</span>
              <span className="text-slate-400 text-sm">2024</span>
            </div>
            <ul className="text-slate-400 text-sm space-y-1">
              <li>• PyQt6 desktop application</li>
              <li>• Monte Carlo simulations</li>
              <li>• Advanced tax planning</li>
              <li>• PDF/HTML report generation</li>
            </ul>
          </div>
          
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">v1.0 Original</span>
              <span className="text-slate-400 text-sm">2023</span>
            </div>
            <ul className="text-slate-400 text-sm space-y-1">
              <li>• Initial Python application</li>
              <li>• Basic retirement calculations</li>
              <li>• Simple projections</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Credits */}
      <Card title="👏 Credits" icon="👏">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-medium mb-3">Development</h4>
            <p className="text-slate-400 text-sm">
              RetirePro was developed with a focus on accuracy, usability, and comprehensive 
              retirement planning capabilities. The calculations are based on established 
              financial planning methodologies.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Data Sources</h4>
            <ul className="text-slate-400 text-sm space-y-1">
              <li>• Social Security Administration</li>
              <li>• IRS Tax Tables</li>
              <li>• Historical Market Data</li>
              <li>• Bureau of Labor Statistics</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Contact */}
      <Card title="📧 Contact & Support" icon="📧">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="mailto:support@retirepro.io" className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-center group">
            <span className="text-3xl block mb-2">📧</span>
            <p className="text-white font-medium group-hover:text-emerald-400">Email Support</p>
            <p className="text-slate-400 text-sm">support@retirepro.io</p>
          </a>
          <a href="https://github.com/retirepro" target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-center group">
            <span className="text-3xl block mb-2">💻</span>
            <p className="text-white font-medium group-hover:text-emerald-400">GitHub</p>
            <p className="text-slate-400 text-sm">View Source Code</p>
          </a>
          <a href="https://twitter.com/retirepro" target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-center group">
            <span className="text-3xl block mb-2">🐦</span>
            <p className="text-white font-medium group-hover:text-emerald-400">Twitter</p>
            <p className="text-slate-400 text-sm">@retirepro</p>
          </a>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center py-8 border-t border-slate-700">
        <p className="text-slate-400">© 2025 RetirePro. All rights reserved.</p>
        <p className="text-slate-500 text-sm mt-2">Made with ❤️ for a secure retirement</p>
      </div>
    </div>
  );
}
