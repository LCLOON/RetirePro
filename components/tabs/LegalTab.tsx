'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import type { LegalData, Beneficiary } from '@/lib/types';

// Default legal data
const DEFAULT_LEGAL_DATA: LegalData = {
  executorName: '',
  executorRelationship: '',
  executorPhone: '',
  executorAddress: '',
  backupExecutorName: '',
  backupExecutorPhone: '',
  beneficiaries: [
    { name: '', relationship: '', percentage: 0, contact: '' },
    { name: '', relationship: '', percentage: 0, contact: '' },
    { name: '', relationship: '', percentage: 0, contact: '' },
  ],
  beneficiary401k: '',
  contingent401k: '',
  beneficiaryIRA: '',
  contingentIRA: '',
  beneficiaryLifeInsurance: '',
  willLocation: '',
  willDate: '',
  attorneyName: '',
  attorneyContact: '',
  powerOfAttorney: '',
  healthcareProxy: '',
  primaryBank: '',
  primaryBankContact: '',
  investmentFirm: '',
  investmentContact: '',
  employerHR: '',
  employerContact: '',
  specialInstructions: '',
};

export function LegalTab() {
  const [legalData, setLegalData] = useState<LegalData>(DEFAULT_LEGAL_DATA);
  const [isSaved, setIsSaved] = useState(true);
  const [showSummary, setShowSummary] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('retirepro-legal-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLegalData({ ...DEFAULT_LEGAL_DATA, ...parsed });
      } catch (e) {
        console.error('Failed to load legal data:', e);
      }
    }
  }, []);

  // Auto-save when data changes
  useEffect(() => {
    if (!isSaved) {
      const timer = setTimeout(() => {
        localStorage.setItem('retirepro-legal-data', JSON.stringify(legalData));
        setIsSaved(true);
        console.log('Legal data auto-saved');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [legalData, isSaved]);

  const updateField = useCallback((field: keyof LegalData, value: string) => {
    setLegalData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  }, []);

  const updateBeneficiary = useCallback((index: number, field: keyof Beneficiary, value: string | number) => {
    setLegalData(prev => {
      const newBeneficiaries = [...prev.beneficiaries];
      newBeneficiaries[index] = { ...newBeneficiaries[index], [field]: value };
      return { ...prev, beneficiaries: newBeneficiaries };
    });
    setIsSaved(false);
  }, []);

  const generateSummary = () => {
    setShowSummary(true);
  };

  const printSummary = () => {
    window.print();
  };

  const InputField = ({ 
    label, 
    value, 
    onChange, 
    placeholder = '',
    type = 'text',
    className = ''
  }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    className?: string;
  }) => (
    <div className={className}>
      <label className="block text-slate-400 text-sm mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">⚖️</span>
            Legal Information & Estate Planning
          </h1>
          <p className="text-slate-400 mt-1">Manage your estate planning documents and beneficiary information</p>
        </div>
        <div className="flex items-center gap-3">
          {!isSaved && (
            <span className="text-amber-400 text-sm animate-pulse">Saving...</span>
          )}
          {isSaved && (
            <span className="text-emerald-400 text-sm">✓ Saved</span>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <Card title="⚠️ Important Disclaimer" icon="⚠️">
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-amber-200 leading-relaxed">
            <strong>This section is for your personal record-keeping only.</strong> This information is stored locally 
            in your browser and is not transmitted to any server. While this can help organize your estate planning 
            information, it does not replace proper legal documentation. Always work with qualified attorneys and 
            financial professionals for official estate planning.
          </p>
        </div>
      </Card>

      {/* Personal Representative & Executor */}
      <Card title="👤 Personal Representative & Executor" icon="👤">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm mb-4">
            Your executor/personal representative is responsible for carrying out the instructions in your will.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField 
              label="Executor Name" 
              value={legalData.executorName} 
              onChange={(v) => updateField('executorName', v)}
              placeholder="Full legal name"
            />
            <InputField 
              label="Relationship" 
              value={legalData.executorRelationship} 
              onChange={(v) => updateField('executorRelationship', v)}
              placeholder="e.g., Spouse, Child, Sibling"
            />
            <InputField 
              label="Phone Number" 
              value={legalData.executorPhone} 
              onChange={(v) => updateField('executorPhone', v)}
              placeholder="(555) 123-4567"
              type="tel"
            />
            <InputField 
              label="Address" 
              value={legalData.executorAddress} 
              onChange={(v) => updateField('executorAddress', v)}
              placeholder="Full mailing address"
            />
          </div>
          <div className="pt-4 border-t border-slate-700">
            <h4 className="text-white font-medium mb-3">Backup Executor</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField 
                label="Backup Executor Name" 
                value={legalData.backupExecutorName} 
                onChange={(v) => updateField('backupExecutorName', v)}
                placeholder="Full legal name"
              />
              <InputField 
                label="Backup Executor Phone" 
                value={legalData.backupExecutorPhone} 
                onChange={(v) => updateField('backupExecutorPhone', v)}
                placeholder="(555) 123-4567"
                type="tel"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Primary Beneficiaries */}
      <Card title="👥 Primary Beneficiaries" icon="👥">
        <div className="space-y-6">
          <p className="text-slate-400 text-sm">
            List your primary beneficiaries and their share of your estate. Total percentages should equal 100%.
          </p>
          {legalData.beneficiaries.map((beneficiary, index) => (
            <div key={index} className="p-4 bg-slate-700/30 rounded-lg space-y-4">
              <h4 className="text-white font-medium">Beneficiary {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InputField 
                  label="Name" 
                  value={beneficiary.name} 
                  onChange={(v) => updateBeneficiary(index, 'name', v)}
                  placeholder="Full legal name"
                />
                <InputField 
                  label="Relationship" 
                  value={beneficiary.relationship} 
                  onChange={(v) => updateBeneficiary(index, 'relationship', v)}
                  placeholder="e.g., Spouse, Child"
                />
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={beneficiary.percentage || ''}
                    onChange={(e) => updateBeneficiary(index, 'percentage', Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <InputField 
                  label="Contact Info" 
                  value={beneficiary.contact} 
                  onChange={(v) => updateBeneficiary(index, 'contact', v)}
                  placeholder="Phone or email"
                />
              </div>
            </div>
          ))}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-slate-400">Total:</span>
            <span className={`font-bold ${
              legalData.beneficiaries.reduce((sum, b) => sum + b.percentage, 0) === 100 
                ? 'text-emerald-400' 
                : 'text-amber-400'
            }`}>
              {legalData.beneficiaries.reduce((sum, b) => sum + b.percentage, 0)}%
              {legalData.beneficiaries.reduce((sum, b) => sum + b.percentage, 0) !== 100 && 
                ' (should equal 100%)'}
            </span>
          </div>
        </div>
      </Card>

      {/* Retirement Account Beneficiaries */}
      <Card title="💼 Retirement Account Beneficiaries" icon="💼">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm mb-4">
            Retirement account beneficiary designations override your will. Keep these updated!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-700/30 rounded-lg space-y-4">
              <h4 className="text-emerald-400 font-medium">401(k) Accounts</h4>
              <InputField 
                label="Primary Beneficiary" 
                value={legalData.beneficiary401k} 
                onChange={(v) => updateField('beneficiary401k', v)}
                placeholder="Full name"
              />
              <InputField 
                label="Contingent Beneficiary" 
                value={legalData.contingent401k} 
                onChange={(v) => updateField('contingent401k', v)}
                placeholder="Full name"
              />
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg space-y-4">
              <h4 className="text-blue-400 font-medium">IRA Accounts</h4>
              <InputField 
                label="Primary Beneficiary" 
                value={legalData.beneficiaryIRA} 
                onChange={(v) => updateField('beneficiaryIRA', v)}
                placeholder="Full name"
              />
              <InputField 
                label="Contingent Beneficiary" 
                value={legalData.contingentIRA} 
                onChange={(v) => updateField('contingentIRA', v)}
                placeholder="Full name"
              />
            </div>
          </div>
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <h4 className="text-purple-400 font-medium mb-4">Life Insurance</h4>
            <InputField 
              label="Life Insurance Beneficiary" 
              value={legalData.beneficiaryLifeInsurance} 
              onChange={(v) => updateField('beneficiaryLifeInsurance', v)}
              placeholder="Full name"
            />
          </div>
        </div>
      </Card>

      {/* Important Documents & Legal Info */}
      <Card title="📋 Important Documents & Legal Info" icon="📋">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField 
              label="Will Location" 
              value={legalData.willLocation} 
              onChange={(v) => updateField('willLocation', v)}
              placeholder="e.g., Safe deposit box at First Bank"
            />
            <InputField 
              label="Will Date" 
              value={legalData.willDate} 
              onChange={(v) => updateField('willDate', v)}
              placeholder="Date will was signed"
              type="date"
            />
            <InputField 
              label="Estate Attorney Name" 
              value={legalData.attorneyName} 
              onChange={(v) => updateField('attorneyName', v)}
              placeholder="Full name"
            />
            <InputField 
              label="Attorney Contact" 
              value={legalData.attorneyContact} 
              onChange={(v) => updateField('attorneyContact', v)}
              placeholder="Phone or email"
            />
          </div>
          <div className="pt-4 border-t border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField 
                label="Power of Attorney Designee" 
                value={legalData.powerOfAttorney} 
                onChange={(v) => updateField('powerOfAttorney', v)}
                placeholder="Person designated as POA"
              />
              <InputField 
                label="Healthcare Proxy / Healthcare POA" 
                value={legalData.healthcareProxy} 
                onChange={(v) => updateField('healthcareProxy', v)}
                placeholder="Person designated for healthcare decisions"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Financial Institutions */}
      <Card title="🏦 Financial Institutions" icon="🏦">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm mb-4">
            Key contacts for your financial accounts and benefits.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField 
              label="Primary Bank Name" 
              value={legalData.primaryBank} 
              onChange={(v) => updateField('primaryBank', v)}
              placeholder="Bank name"
            />
            <InputField 
              label="Bank Contact / Account Manager" 
              value={legalData.primaryBankContact} 
              onChange={(v) => updateField('primaryBankContact', v)}
              placeholder="Phone or contact name"
            />
            <InputField 
              label="Investment Firm / Brokerage" 
              value={legalData.investmentFirm} 
              onChange={(v) => updateField('investmentFirm', v)}
              placeholder="Firm name"
            />
            <InputField 
              label="Financial Advisor Contact" 
              value={legalData.investmentContact} 
              onChange={(v) => updateField('investmentContact', v)}
              placeholder="Advisor name and phone"
            />
            <InputField 
              label="Employer HR / Benefits" 
              value={legalData.employerHR} 
              onChange={(v) => updateField('employerHR', v)}
              placeholder="Company name"
            />
            <InputField 
              label="HR Contact" 
              value={legalData.employerContact} 
              onChange={(v) => updateField('employerContact', v)}
              placeholder="HR phone or email"
            />
          </div>
        </div>
      </Card>

      {/* Special Instructions */}
      <Card title="📝 Special Instructions" icon="📝">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            Any special instructions, wishes, or important notes for your family or executor.
          </p>
          <textarea
            value={legalData.specialInstructions}
            onChange={(e) => updateField('specialInstructions', e.target.value)}
            placeholder="Enter any special instructions, wishes, or important notes here..."
            rows={6}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          />
        </div>
      </Card>

      {/* Generate Summary Button */}
      <Card title="📄 Estate Summary" icon="📄">
        <div className="flex flex-col items-center gap-4">
          <p className="text-slate-400 text-sm text-center">
            Generate a summary of your estate planning information that you can print or save.
          </p>
          <button
            onClick={generateSummary}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <span>📄</span>
            Generate Estate Summary
          </button>
        </div>
      </Card>

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 print:p-0 print:bg-white">
          <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto print:max-h-none print:bg-white print:text-black">
            <div className="sticky top-0 bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between print:hidden">
              <h2 className="text-xl font-bold text-white">Estate Planning Summary</h2>
              <div className="flex gap-2">
                <button
                  onClick={printSummary}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>🖨️</span>
                  Print
                </button>
                <button
                  onClick={() => setShowSummary(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 print:text-black">
              <div className="text-center pb-4 border-b border-slate-700 print:border-black">
                <h1 className="text-2xl font-bold text-white print:text-black">Estate Planning Summary</h1>
                <p className="text-slate-400 print:text-gray-600">Generated: {new Date().toLocaleDateString()}</p>
              </div>

              {/* Executor Section */}
              <div>
                <h3 className="text-lg font-bold text-emerald-400 mb-2 print:text-emerald-700">Personal Representative / Executor</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-400 print:text-gray-600">Name:</span> <span className="text-white print:text-black">{legalData.executorName || 'Not specified'}</span></div>
                  <div><span className="text-slate-400 print:text-gray-600">Relationship:</span> <span className="text-white print:text-black">{legalData.executorRelationship || 'Not specified'}</span></div>
                  <div><span className="text-slate-400 print:text-gray-600">Phone:</span> <span className="text-white print:text-black">{legalData.executorPhone || 'Not specified'}</span></div>
                  <div><span className="text-slate-400 print:text-gray-600">Address:</span> <span className="text-white print:text-black">{legalData.executorAddress || 'Not specified'}</span></div>
                </div>
                {legalData.backupExecutorName && (
                  <div className="mt-2 text-sm">
                    <span className="text-slate-400 print:text-gray-600">Backup Executor:</span>{' '}
                    <span className="text-white print:text-black">{legalData.backupExecutorName} ({legalData.backupExecutorPhone})</span>
                  </div>
                )}
              </div>

              {/* Beneficiaries */}
              <div>
                <h3 className="text-lg font-bold text-emerald-400 mb-2 print:text-emerald-700">Primary Beneficiaries</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 print:text-gray-600 border-b border-slate-700 print:border-gray-300">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Relationship</th>
                      <th className="text-left py-2">Percentage</th>
                      <th className="text-left py-2">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="text-white print:text-black">
                    {legalData.beneficiaries.filter(b => b.name).map((b, i) => (
                      <tr key={i} className="border-b border-slate-700/50 print:border-gray-200">
                        <td className="py-2">{b.name}</td>
                        <td className="py-2">{b.relationship}</td>
                        <td className="py-2">{b.percentage}%</td>
                        <td className="py-2">{b.contact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Account Beneficiaries */}
              <div>
                <h3 className="text-lg font-bold text-emerald-400 mb-2 print:text-emerald-700">Retirement Account Beneficiaries</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-blue-400 print:text-blue-700">401(k) Accounts</h4>
                    <div><span className="text-slate-400 print:text-gray-600">Primary:</span> <span className="text-white print:text-black">{legalData.beneficiary401k || 'Not specified'}</span></div>
                    <div><span className="text-slate-400 print:text-gray-600">Contingent:</span> <span className="text-white print:text-black">{legalData.contingent401k || 'Not specified'}</span></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-400 print:text-blue-700">IRA Accounts</h4>
                    <div><span className="text-slate-400 print:text-gray-600">Primary:</span> <span className="text-white print:text-black">{legalData.beneficiaryIRA || 'Not specified'}</span></div>
                    <div><span className="text-slate-400 print:text-gray-600">Contingent:</span> <span className="text-white print:text-black">{legalData.contingentIRA || 'Not specified'}</span></div>
                  </div>
                </div>
                {legalData.beneficiaryLifeInsurance && (
                  <div className="mt-2 text-sm">
                    <span className="text-slate-400 print:text-gray-600">Life Insurance Beneficiary:</span>{' '}
                    <span className="text-white print:text-black">{legalData.beneficiaryLifeInsurance}</span>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-bold text-emerald-400 mb-2 print:text-emerald-700">Important Documents</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-400 print:text-gray-600">Will Location:</span> <span className="text-white print:text-black">{legalData.willLocation || 'Not specified'}</span></div>
                  <div><span className="text-slate-400 print:text-gray-600">Will Date:</span> <span className="text-white print:text-black">{legalData.willDate || 'Not specified'}</span></div>
                  <div><span className="text-slate-400 print:text-gray-600">Estate Attorney:</span> <span className="text-white print:text-black">{legalData.attorneyName || 'Not specified'}</span></div>
                  <div><span className="text-slate-400 print:text-gray-600">Attorney Contact:</span> <span className="text-white print:text-black">{legalData.attorneyContact || 'Not specified'}</span></div>
                  <div><span className="text-slate-400 print:text-gray-600">Power of Attorney:</span> <span className="text-white print:text-black">{legalData.powerOfAttorney || 'Not specified'}</span></div>
                  <div><span className="text-slate-400 print:text-gray-600">Healthcare Proxy:</span> <span className="text-white print:text-black">{legalData.healthcareProxy || 'Not specified'}</span></div>
                </div>
              </div>

              {/* Financial Institutions */}
              <div>
                <h3 className="text-lg font-bold text-emerald-400 mb-2 print:text-emerald-700">Financial Institutions</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-400 print:text-gray-600">Primary Bank:</span> <span className="text-white print:text-black">{legalData.primaryBank || 'Not specified'}</span></div>
                  <div><span className="text-slate-400 print:text-gray-600">Bank Contact:</span> <span className="text-white print:text-black">{legalData.primaryBankContact || 'Not specified'}</span></div>
                  <div><span className="text-slate-400 print:text-gray-600">Investment Firm:</span> <span className="text-white print:text-black">{legalData.investmentFirm || 'Not specified'}</span></div>
                  <div><span className="text-slate-400 print:text-gray-600">Advisor Contact:</span> <span className="text-white print:text-black">{legalData.investmentContact || 'Not specified'}</span></div>
                  <div><span className="text-slate-400 print:text-gray-600">Employer HR:</span> <span className="text-white print:text-black">{legalData.employerHR || 'Not specified'}</span></div>
                  <div><span className="text-slate-400 print:text-gray-600">HR Contact:</span> <span className="text-white print:text-black">{legalData.employerContact || 'Not specified'}</span></div>
                </div>
              </div>

              {/* Special Instructions */}
              {legalData.specialInstructions && (
                <div>
                  <h3 className="text-lg font-bold text-emerald-400 mb-2 print:text-emerald-700">Special Instructions</h3>
                  <p className="text-white print:text-black text-sm whitespace-pre-wrap">{legalData.specialInstructions}</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-700 print:border-gray-300 text-center">
                <p className="text-slate-400 print:text-gray-600 text-xs">
                  This document is for personal reference only. Please work with qualified legal and financial professionals for official estate planning.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estate Planning Basics - Educational Content */}
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
              <li>• Based on &quot;combined income&quot; thresholds</li>
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
