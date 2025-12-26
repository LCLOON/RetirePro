'use client';

import { ReactNode, useState } from 'react';
import { Card, CardGrid } from '@/components/ui';
import { Button } from '@/components/ui';
import { useApp, Theme } from '@/lib/store';
import { useSubscription, TIER_INFO, SubscriptionTier, PRO_FEATURES, PREMIUM_FEATURES } from '@/lib/subscription';
import { formatCurrency } from '@/lib/calculations';
import Link from 'next/link';

// Report Generator Component
function ReportGenerator({ state }: { state: ReturnType<typeof useApp>['state'] }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const data = state.retirementData;
  const results = state.scenarioResults;
  const mcResults = state.monteCarloResults;
  const netWorth = state.netWorthData;

  const totalSavings = data.currentSavingsPreTax + data.currentSavingsRoth + data.currentSavingsAfterTax +
    (data.hasInheritedIRA ? data.inheritedIRA.balance : 0) +
    (data.hasDividendPortfolio ? data.dividendPortfolio.currentValue : 0) +
    (data.hasCryptoHoldings ? data.cryptoHoldings.currentValue : 0);
  const totalContributions = data.annualContributionPreTax + data.annualContributionRoth + 
    data.annualContributionAfterTax + data.employerMatch;
  const yearsToRetirement = data.retirementAge - data.currentAge;

  // Calculate net worth from all categories
  const propertyValue = netWorth.properties.reduce((sum, p) => sum + p.currentValue, 0);
  const propertyDebt = netWorth.properties.reduce((sum, p) => sum + (p.mortgageBalance || 0), 0);
  const vehicleValue = netWorth.vehicles.reduce((sum, v) => sum + v.currentValue, 0);
  const vehicleDebt = netWorth.vehicles.reduce((sum, v) => sum + (v.loanBalance || 0), 0);
  const bankValue = netWorth.bankAccounts.reduce((sum, b) => sum + b.balance, 0);
  const brokerageValue = netWorth.brokerageAccounts.reduce((sum, b) => sum + b.balance, 0);
  const cryptoValue = netWorth.cryptoHoldings.reduce((sum, c) => sum + c.currentValue, 0);
  const retirementValue = netWorth.retirementAccounts.reduce((sum, r) => sum + r.balance, 0);
  const personalValue = netWorth.personalAssets.reduce((sum, p) => sum + p.currentValue, 0);
  const otherDebts = netWorth.debts.reduce((sum, d) => sum + d.balance, 0);

  const totalAssets = propertyValue + vehicleValue + bankValue + brokerageValue + cryptoValue + retirementValue + personalValue + totalSavings;
  const totalLiabilities = propertyDebt + vehicleDebt + otherDebts;
  const netWorthValue = totalAssets - totalLiabilities;

  const handlePrint = () => {
    setIsGenerating(true);
    
    // Generate the same HTML report content
    const reportHTML = generateReportHTML();
    
    // Open in new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        setIsGenerating(false);
      }, 500);
    } else {
      // Fallback: download as HTML if popup blocked
      generateHTMLReport();
      setIsGenerating(false);
    }
  };

  // Shared HTML generation function
  const generateReportHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>RetirePro Retirement Plan Report - ${new Date().toLocaleDateString()}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px; color: #1e293b; line-height: 1.6; }
    h1 { color: #059669; border-bottom: 3px solid #059669; padding-bottom: 10px; margin-bottom: 0; }
    h2 { color: #334155; margin-top: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    h3 { color: #475569; margin-top: 20px; }
    .header { text-align: center; margin-bottom: 40px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); padding: 30px; border-radius: 12px; }
    .logo { font-size: 48px; margin-bottom: 10px; }
    .subtitle { color: #059669; font-size: 18px; margin-top: 5px; }
    .date { color: #64748b; font-size: 14px; margin-top: 10px; }
    .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 20px 0; }
    .summary-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0; }
    .stat-card { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-card.highlight { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-color: #a7f3d0; }
    .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 22px; font-weight: bold; color: #0f172a; margin-top: 4px; }
    .stat-value.success { color: #059669; }
    .stat-value.warning { color: #f59e0b; }
    .stat-value.danger { color: #dc2626; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    tr:hover { background: #f8fafc; }
    .total-row { background: #f0fdf4 !important; font-weight: bold; }
    .total-row td, .total-row th { border-top: 2px solid #059669; }
    .section { page-break-inside: avoid; margin-bottom: 30px; }
    .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    .progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-top: 8px; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #059669, #10b981); border-radius: 4px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge.success { background: #d1fae5; color: #059669; }
    .badge.warning { background: #fef3c7; color: #b45309; }
    .badge.danger { background: #fee2e2; color: #dc2626; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; }
    .disclaimer { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-top: 30px; font-size: 12px; }
    .disclaimer strong { color: #92400e; }
    .callout { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .callout.success { background: #f0fdf4; border-color: #059669; }
    @media print { 
      body { padding: 20px; } 
      .section { page-break-inside: avoid; }
      h2 { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">💎</div>
    <h1>Retirement Plan Report</h1>
    <p class="subtitle">Comprehensive Financial Analysis</p>
    <p class="date">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="section">
    <h2>📊 Executive Summary</h2>
    <div class="summary-grid-4">
      <div class="stat-card highlight">
        <div class="stat-label">Net Worth</div>
        <div class="stat-value success">${formatCurrency(netWorthValue)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Investments</div>
        <div class="stat-value">${formatCurrency(totalSavings)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Years to Retire</div>
        <div class="stat-value">${yearsToRetirement}</div>
      </div>
      <div class="stat-card ${mcResults ? (mcResults.successRate >= 80 ? 'highlight' : '') : ''}">
        <div class="stat-label">Success Rate</div>
        <div class="stat-value ${mcResults ? (mcResults.successRate >= 80 ? 'success' : mcResults.successRate >= 60 ? 'warning' : 'danger') : ''}">${mcResults ? mcResults.successRate.toFixed(0) + '%' : 'N/A'}</div>
      </div>
    </div>
    
    <div class="summary-grid">
      <div class="stat-card">
        <div class="stat-label">Current Age → Retirement Age</div>
        <div class="stat-value">${data.currentAge} → ${data.retirementAge}</div>
        <div class="progress-bar"><div class="progress-fill" style="width: ${Math.min(100, (data.currentAge / data.retirementAge) * 100)}%"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Projected at Retirement</div>
        <div class="stat-value success">${results ? formatCurrency(results.expected.atRetirement) : 'Run Analysis'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>💰 Investment Accounts</h2>
    <table>
      <tr><th>Account Type</th><th>Current Balance</th><th>Annual Contribution</th><th>% of Total</th></tr>
      <tr>
        <td>Pre-Tax (401k/Traditional IRA)</td>
        <td>${formatCurrency(data.currentSavingsPreTax)}</td>
        <td>${formatCurrency(data.annualContributionPreTax)}</td>
        <td>${totalSavings > 0 ? ((data.currentSavingsPreTax / totalSavings) * 100).toFixed(1) : 0}%</td>
      </tr>
      <tr>
        <td>Roth (401k/IRA)</td>
        <td>${formatCurrency(data.currentSavingsRoth)}</td>
        <td>${formatCurrency(data.annualContributionRoth)}</td>
        <td>${totalSavings > 0 ? ((data.currentSavingsRoth / totalSavings) * 100).toFixed(1) : 0}%</td>
      </tr>
      <tr>
        <td>After-Tax/Brokerage</td>
        <td>${formatCurrency(data.currentSavingsAfterTax)}</td>
        <td>${formatCurrency(data.annualContributionAfterTax)}</td>
        <td>${totalSavings > 0 ? ((data.currentSavingsAfterTax / totalSavings) * 100).toFixed(1) : 0}%</td>
      </tr>
      ${data.currentHSA > 0 ? `<tr>
        <td>Health Savings Account (HSA)</td>
        <td>${formatCurrency(data.currentHSA)}</td>
        <td>${formatCurrency(data.annualHSAContribution)}</td>
        <td>-</td>
      </tr>` : ''}
      ${data.hasInheritedIRA ? `<tr>
        <td>Inherited IRA</td>
        <td>${formatCurrency(data.inheritedIRA.balance)}</td>
        <td>-</td>
        <td>${totalSavings > 0 ? ((data.inheritedIRA.balance / totalSavings) * 100).toFixed(1) : 0}%</td>
      </tr>` : ''}
      ${data.hasDividendPortfolio ? `<tr>
        <td>Dividend Portfolio</td>
        <td>${formatCurrency(data.dividendPortfolio.currentValue)}</td>
        <td>Yield: ${(data.dividendPortfolio.yieldOnCost * 100).toFixed(1)}%</td>
        <td>${totalSavings > 0 ? ((data.dividendPortfolio.currentValue / totalSavings) * 100).toFixed(1) : 0}%</td>
      </tr>` : ''}
      ${data.hasCryptoHoldings ? `<tr>
        <td>Cryptocurrency</td>
        <td>${formatCurrency(data.cryptoHoldings.currentValue)}</td>
        <td>-</td>
        <td>${totalSavings > 0 ? ((data.cryptoHoldings.currentValue / totalSavings) * 100).toFixed(1) : 0}%</td>
      </tr>` : ''}
      <tr>
        <td>Employer Match</td>
        <td>-</td>
        <td>${formatCurrency(data.employerMatch)}</td>
        <td>-</td>
      </tr>
      <tr class="total-row">
        <td><strong>TOTAL</strong></td>
        <td><strong>${formatCurrency(totalSavings)}</strong></td>
        <td><strong>${formatCurrency(totalContributions)}</strong></td>
        <td><strong>100%</strong></td>
      </tr>
    </table>
  </div>

  ${mcResults ? `
  <div class="section">
    <h2>🎲 Monte Carlo Analysis</h2>
    <div class="callout ${mcResults.successRate >= 80 ? 'success' : ''}">
      Based on 1,000 simulations with varying market conditions, your retirement plan has a 
      <strong>${mcResults.successRate.toFixed(1)}%</strong> probability of success through age ${data.lifeExpectancy}.
    </div>
    <div class="summary-grid-4">
      <div class="stat-card">
        <div class="stat-label">Success Rate</div>
        <div class="stat-value ${mcResults.successRate >= 80 ? 'success' : mcResults.successRate >= 60 ? 'warning' : 'danger'}">${mcResults.successRate.toFixed(1)}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Median Outcome</div>
        <div class="stat-value">${formatCurrency(mcResults.median)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">10th Percentile (Worst)</div>
        <div class="stat-value warning">${formatCurrency(mcResults.percentile10)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">90th Percentile (Best)</div>
        <div class="stat-value success">${formatCurrency(mcResults.percentile90)}</div>
      </div>
    </div>
  </div>
  ` : ''}

  <div class="section">
    <h2>🏦 Retirement Income Sources</h2>
    <table>
      <tr><th>Income Source</th><th>Annual Amount</th><th>Monthly</th><th>Start Age</th></tr>
      <tr>
        <td>Your Social Security</td>
        <td>${formatCurrency(data.socialSecurityBenefit)}</td>
        <td>${formatCurrency(data.socialSecurityBenefit / 12)}</td>
        <td>${data.socialSecurityStartAge}</td>
      </tr>
      ${data.hasSpouse ? `<tr>
        <td>Spouse Social Security</td>
        <td>${formatCurrency(data.spouseSocialSecurityBenefit)}</td>
        <td>${formatCurrency(data.spouseSocialSecurityBenefit / 12)}</td>
        <td>${data.spouseSocialSecurityStartAge}</td>
      </tr>` : ''}
      ${data.hasPension ? `<tr>
        <td>Pension</td>
        <td>${formatCurrency(data.pensionIncome)}</td>
        <td>${formatCurrency(data.pensionIncome / 12)}</td>
        <td>${data.pensionStartAge}</td>
      </tr>` : ''}
    </table>
  </div>

  <div class="section">
    <h2>🏠 Net Worth Statement</h2>
    <div class="two-column">
      <div>
        <h3>Assets</h3>
        <table>
          <tr><th>Asset</th><th>Value</th></tr>
          <tr><td>Investment Accounts</td><td>${formatCurrency(totalSavings)}</td></tr>
          ${netWorth.properties.filter(p => p.currentValue > 0).map(p => `<tr><td>${p.name || 'Real Estate'}</td><td>${formatCurrency(p.currentValue)}</td></tr>`).join('')}
          ${netWorth.vehicles.filter(v => v.currentValue > 0).map(v => `<tr><td>${v.name || 'Vehicle'}</td><td>${formatCurrency(v.currentValue)}</td></tr>`).join('')}
          ${netWorth.bankAccounts.filter(b => b.balance > 0).map(b => `<tr><td>${b.name || 'Bank Account'}</td><td>${formatCurrency(b.balance)}</td></tr>`).join('')}
          ${netWorth.brokerageAccounts.filter(b => b.balance > 0).map(b => `<tr><td>${b.name || 'Brokerage'}</td><td>${formatCurrency(b.balance)}</td></tr>`).join('')}
          ${netWorth.personalAssets.filter(p => p.currentValue > 0).map(p => `<tr><td>${p.name || 'Personal Asset'}</td><td>${formatCurrency(p.currentValue)}</td></tr>`).join('')}
          <tr class="total-row"><td><strong>Total Assets</strong></td><td><strong>${formatCurrency(totalAssets)}</strong></td></tr>
        </table>
      </div>
      <div>
        <h3>Liabilities</h3>
        <table>
          <tr><th>Liability</th><th>Balance</th></tr>
          ${netWorth.properties.filter(p => (p.mortgageBalance || 0) > 0).map(p => `<tr><td>${p.name || 'Mortgage'}</td><td>${formatCurrency(p.mortgageBalance || 0)}</td></tr>`).join('')}
          ${netWorth.vehicles.filter(v => (v.loanBalance || 0) > 0).map(v => `<tr><td>${v.name || 'Auto Loan'}</td><td>${formatCurrency(v.loanBalance || 0)}</td></tr>`).join('')}
          ${netWorth.debts.filter(d => d.balance > 0).map(d => `<tr><td>${d.name || 'Debt'}</td><td>${formatCurrency(d.balance)}</td></tr>`).join('')}
          ${totalLiabilities === 0 ? '<tr><td colspan="2" style="text-align:center; color:#64748b;">No liabilities recorded</td></tr>' : ''}
          <tr class="total-row"><td><strong>Total Liabilities</strong></td><td><strong>${formatCurrency(totalLiabilities)}</strong></td></tr>
        </table>
      </div>
    </div>
    <div class="stat-card highlight" style="margin-top: 16px; text-align: center;">
      <div class="stat-label">NET WORTH</div>
      <div class="stat-value success" style="font-size: 32px;">${formatCurrency(netWorthValue)}</div>
      <div style="color: #64748b; font-size: 12px; margin-top: 4px;">Debt-to-Asset Ratio: ${totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : 0}%</div>
    </div>
  </div>

  <div class="section">
    <h2>📈 Planning Assumptions</h2>
    <div class="two-column">
      <table>
        <tr><th>Growth & Returns</th><th>Rate</th></tr>
        <tr><td>Pre-Retirement Return</td><td>${(data.preRetirementReturn * 100).toFixed(1)}%</td></tr>
        <tr><td>Post-Retirement Return</td><td>${(data.postRetirementReturn * 100).toFixed(1)}%</td></tr>
        <tr><td>Inflation Rate</td><td>${(data.inflationRate * 100).toFixed(1)}%</td></tr>
      </table>
      <table>
        <tr><th>Spending & Withdrawal</th><th>Amount</th></tr>
        <tr><td>Annual Retirement Expenses</td><td>${formatCurrency(data.retirementExpenses)}</td></tr>
        <tr><td>Safe Withdrawal Rate</td><td>${(data.safeWithdrawalRate * 100).toFixed(1)}%</td></tr>
        <tr><td>Life Expectancy</td><td>${data.lifeExpectancy} years</td></tr>
        <tr><td>Withdrawal Strategy</td><td>${data.drawdownStrategy === 'traditional' ? 'Traditional' : data.drawdownStrategy === 'proportional' ? 'Proportional' : data.drawdownStrategy === 'roth_first' ? 'Roth First' : data.drawdownStrategy === 'tax_efficient' ? 'Tax Efficient' : 'Custom'}</td></tr>
      </table>
    </div>
  </div>

  ${results ? `
  <div class="section">
    <h2>📊 Scenario Projections</h2>
    <table>
      <tr><th>Scenario</th><th>At Retirement (Age ${data.retirementAge})</th><th>At Life Expectancy (Age ${data.lifeExpectancy})</th><th>Status</th></tr>
      <tr>
        <td><strong>Expected</strong> (base case)</td>
        <td>${formatCurrency(results.expected.atRetirement)}</td>
        <td>${formatCurrency(results.expected.atEnd)}</td>
        <td><span class="badge ${results.expected.atEnd > 0 ? 'success' : 'danger'}">${results.expected.atEnd > 0 ? 'Funded' : 'Shortfall'}</span></td>
      </tr>
      <tr>
        <td><strong>Optimistic</strong> (+2% return)</td>
        <td>${formatCurrency(results.optimistic.atRetirement)}</td>
        <td>${formatCurrency(results.optimistic.atEnd)}</td>
        <td><span class="badge success">Funded</span></td>
      </tr>
      <tr>
        <td><strong>Pessimistic</strong> (-2% return)</td>
        <td>${formatCurrency(results.pessimistic.atRetirement)}</td>
        <td>${formatCurrency(results.pessimistic.atEnd)}</td>
        <td><span class="badge ${results.pessimistic.atEnd > 0 ? 'warning' : 'danger'}">${results.pessimistic.atEnd > 0 ? 'Marginal' : 'Shortfall'}</span></td>
      </tr>
    </table>
  </div>
  ` : ''}

  <div class="disclaimer">
    <strong>⚠️ Important Disclaimer:</strong> This report is generated for educational and informational purposes only. It does not constitute financial, investment, tax, or legal advice. 
    All projections are based on the assumptions you provided and historical data patterns—actual results may vary significantly. Market conditions, tax laws, 
    inflation, and personal circumstances can change. <strong>Please consult with qualified financial advisors, tax professionals, and legal counsel</strong> before making 
    any significant financial decisions. Past performance does not guarantee future results. RetirePro is not responsible for any financial decisions made based on this report.
  </div>

  <div class="footer">
    <p style="font-size: 24px; margin-bottom: 10px;">💎</p>
    <p><strong>Generated by RetirePro</strong></p>
    <p>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString()}</p>
    <p style="margin-top: 10px;">© ${new Date().getFullYear()} RetirePro. All rights reserved.</p>
    <p style="color: #94a3b8; margin-top: 10px;">https://retirepro.io</p>
  </div>
</body>
</html>`;
  };

  const generateHTMLReport = () => {
    const reportHTML = generateReportHTML();
    
    // Create blob and download
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RetirePro_Report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card title="📄 Report Generator" subtitle="Generate a professional retirement plan report">
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          Create a comprehensive retirement plan report that you can print or save as PDF.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handlePrint}
            disabled={isGenerating}
            className="flex items-center justify-center gap-3 p-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <div className="text-left">
              <p className="font-semibold">Print / Save as PDF</p>
              <p className="text-xs text-emerald-200">Use browser print dialog</p>
            </div>
          </button>
          
          <button
            onClick={generateHTMLReport}
            className="flex items-center justify-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <div className="text-left">
              <p className="font-semibold">Download HTML Report</p>
              <p className="text-xs text-blue-200">Open in any browser</p>
            </div>
          </button>
        </div>

        {/* Quick Summary Preview */}
        <div className="p-4 bg-slate-800/50 rounded-lg">
          <h4 className="font-medium text-white mb-3">Report Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Current Savings</p>
              <p className="text-white font-semibold">{formatCurrency(totalSavings)}</p>
            </div>
            <div>
              <p className="text-slate-400">Annual Contributions</p>
              <p className="text-white font-semibold">{formatCurrency(totalContributions)}</p>
            </div>
            <div>
              <p className="text-slate-400">At Retirement</p>
              <p className="text-emerald-400 font-semibold">
                {results ? formatCurrency(results.expected.atRetirement) : 'Run calculations'}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Success Rate</p>
              <p className={`font-semibold ${mcResults && mcResults.successRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {mcResults ? `${mcResults.successRate.toFixed(0)}%` : 'Run analysis'}
              </p>
            </div>
          </div>
        </div>

        {!results && (
          <div className="p-3 bg-amber-900/30 border border-amber-600/50 rounded-lg">
            <p className="text-amber-300 text-sm">
              💡 Tip: Run calculations first to include projection results in your report.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

export function SettingsTab() {
  const { state, setTheme, saveToLocalStorage, loadFromLocalStorage, resetAll, exportToJSON } = useApp();
  const { tier, setTier } = useSubscription();
  
  const themes: { id: Theme; label: string; icon: ReactNode }[] = [
    {
      id: 'light',
      label: 'Light',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'medium',
      label: 'Medium',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0zM12 8a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      ),
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
    },
  ];
  
  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card title="Appearance" subtitle="Customize how RetirePro looks">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                    ${state.theme === theme.id
                      ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 bg-gray-50 dark:bg-transparent'
                    }
                  `}
                >
                  <div className={`
                    p-3 rounded-lg
                    ${state.theme === theme.id
                      ? 'bg-blue-500 dark:bg-blue-800 text-white dark:text-blue-300'
                      : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-400'
                    }
                  `}>
                    {theme.icon}
                  </div>
                  <span className={`
                    text-sm font-medium
                    ${state.theme === theme.id
                      ? 'text-blue-600 dark:text-blue-300'
                      : 'text-gray-600 dark:text-slate-300'
                    }
                  `}>
                    {theme.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Data Management */}
      <Card title="Data Management" subtitle="Save, load, and export your data">
        <CardGrid columns={2}>
          <div className="p-4 bg-gray-100 dark:bg-slate-700/50 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Local Storage</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Save your data to browser storage for quick access.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={saveToLocalStorage}>
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={loadFromLocalStorage}>
                Load
              </Button>
            </div>
          </div>
          
          <div className="p-4 bg-gray-100 dark:bg-slate-700/50 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Export Data</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Download your data as a JSON file for backup.
            </p>
            <Button variant="outline" size="sm" onClick={exportToJSON}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Export JSON
            </Button>
          </div>
        </CardGrid>
      </Card>

      {/* Report Generator */}
      <ReportGenerator state={state} />
      
      {/* Reset */}
      <Card title="Reset" subtitle="Clear all data and start fresh">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-red-700 dark:text-red-200 mb-1">Danger Zone</h4>
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                This action will reset all your data to defaults. This cannot be undone.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                    resetAll();
                  }
                }}
                className="border-red-700 text-red-400 hover:bg-red-900/40"
              >
                Reset All Data
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Subscription Management */}
      <Card title="Subscription" subtitle="Manage your RetirePro subscription">
        <div className="space-y-6">
          {/* Current Plan */}
          <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-slate-700/50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Plan</p>
              <p className={`text-xl font-bold ${TIER_INFO[tier].color}`}>
                {TIER_INFO[tier].name}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full ${TIER_INFO[tier].badge}`}>
              {TIER_INFO[tier].price}
            </div>
          </div>

          {/* Plan Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Change Plan
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(['free', 'pro', 'premium'] as SubscriptionTier[]).map((planTier) => (
                <button
                  key={planTier}
                  onClick={() => setTier(planTier)}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                    ${tier === planTier
                      ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/30'
                      : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 bg-gray-50 dark:bg-transparent'
                    }
                  `}
                >
                  <span className="text-2xl">
                    {planTier === 'free' ? '🆓' : planTier === 'pro' ? '⭐' : '💎'}
                  </span>
                  <span className={`
                    text-sm font-medium
                    ${tier === planTier
                      ? 'text-emerald-600 dark:text-emerald-300'
                      : 'text-gray-600 dark:text-slate-300'
                    }
                  `}>
                    {TIER_INFO[planTier].name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {TIER_INFO[planTier].price}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              * For testing purposes. In production, this will sync with Stripe.
            </p>
          </div>

          {/* Feature List */}
          {tier !== 'premium' && (
            <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-purple-500/10 border border-emerald-500/20 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Upgrade to {tier === 'free' ? 'Pro' : 'Premium'} for:
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {(tier === 'free' ? PRO_FEATURES : PREMIUM_FEATURES).slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link 
                href="/#pricing"
                className="inline-block mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                View Pricing
              </Link>
            </div>
          )}
        </div>
      </Card>
      
      {/* About */}
      <Card title="About RetirePro" subtitle="Version and information">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">RetirePro</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Version 3.0 Web</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            A comprehensive retirement planning calculator with Monte Carlo simulations.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            © 2025 RetirePro. All rights reserved.
          </p>
        </div>
      </Card>
    </div>
  );
}
