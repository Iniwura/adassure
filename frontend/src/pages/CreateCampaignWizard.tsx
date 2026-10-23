import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Shield, Coins, Lock, Sparkles, Wallet } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { haptics } from '../lib/haptics';

interface CreateCampaignWizardProps {
  currentEpoch?: number;
  onCreateCampaign: (params: {
    creator: string;
    targetDomain: string;
    requiredSponsorLink: string;
    mandatoryDisclosure: string;
    briefRequirements: string;
    expiryEpoch: number;
    depositGen: string;
  }) => Promise<void>;
}

const TEMPLATES = [
  {
    label: 'Substack - Technical Walkthrough',
    creator: '0x63C15b5921B4b2215e23cf77a8CFCF3a0D62F33d',
    domain: 'substack.com',
    link: 'https://genlayer.io/builder-grants',
    tag: '#ad',
    brief: 'Produce an in-depth technical walkthrough of GenLayer Intelligent Contracts, covering the Equivalence Principle and web scraping. Must include #ad disclosure and builder grants link.',
    deposit: '0.15'
  },
  {
    label: 'TechCrunch - News Integration',
    creator: '0x43bFaB1209eE49e1e86A46cf01844E20B345678',
    domain: 'techcrunch.com',
    link: 'https://genlayer.io/demo',
    tag: '#sponsored',
    brief: 'Feature story exploring decentralized ad escrow and zero-intermediary creator settlements. Must include disclosure tag and link.',
    deposit: '0.25'
  },
  {
    label: 'Mirror.xyz - AI Consensus Essay',
    creator: '0x63C15b5921B4b2215e23cf77a8CFCF3a0D62F33d',
    domain: 'mirror.xyz',
    link: 'https://genlayer.io',
    tag: '#ad',
    brief: 'Essay on the transition from static EVM smart contracts to non-deterministic AI consensus. Verified backlink and disclosure required.',
    deposit: '0.12'
  }
];

export function CreateCampaignWizard({ onCreateCampaign }: CreateCampaignWizardProps) {
  const navigate = useNavigate();
  const { isConnected, setShowModal } = useWallet();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [creator, setCreator] = useState('0x63C15b5921B4b2215e23cf77a8CFCF3a0D62F33d');
  const [targetDomain, setTargetDomain] = useState('substack.com');
  const [requiredSponsorLink, setRequiredSponsorLink] = useState('https://genlayer.io/builder-grants');
  const [mandatoryDisclosure, setMandatoryDisclosure] = useState('#ad');
  const [briefRequirements, setBriefRequirements] = useState(
    'Produce an in-depth technical walkthrough of GenLayer Intelligent Contracts, covering the Equivalence Principle and web scraping. Must include #ad disclosure and builder grants link.'
  );
  const [depositGen, setDepositGen] = useState('0.15');

  function applyTemplate(tpl: typeof TEMPLATES[0]) {
    haptics.tick();
    setCreator(tpl.creator);
    setTargetDomain(tpl.domain);
    setRequiredSponsorLink(tpl.link);
    setMandatoryDisclosure(tpl.tag);
    setBriefRequirements(tpl.brief);
    setDepositGen(tpl.deposit);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isConnected) {
      haptics.tick();
      setShowModal(true);
      return;
    }

    haptics.click();
    setSubmitting(true);
    try {
      await onCreateCampaign({
        creator,
        targetDomain,
        requiredSponsorLink,
        mandatoryDisclosure,
        briefRequirements,
        expiryEpoch: 100,
        depositGen
      });
      navigate('/campaigns');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050608] text-[#f7f8fa] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          to="/campaigns"
          onClick={() => haptics.tick()}
          className="inline-flex items-center space-x-2 text-xs font-mono text-[#9499a8] hover:text-[#f59e0b] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Campaigns</span>
        </Link>

        {/* Header */}
        <div className="space-y-2 pb-6 border-b border-white/[0.08]">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Create Campaign Escrow
          </h1>
          <p className="text-sm text-[#9499a8] leading-relaxed">
            Lock creator sponsorship funds in non-custodial smart contracts. Payouts disburse automatically once multi-validator consensus verifies the published URL.
          </p>
        </div>

        {/* Quick Template Selector */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-[#9499a8]">
            Quick Presets:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="p-3 text-left rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-[#f59e0b]/40 text-xs font-mono text-[#cfd3dc] transition-all"
              >
                <div className="font-semibold text-white truncate">{tpl.label}</div>
                <div className="text-[11px] text-[#f59e0b] mt-0.5">{tpl.deposit} GEN</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Creation Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-5">
            
            {/* Creator Address */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-white block">
                Target Creator Wallet Address
              </label>
              <input
                type="text"
                required
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-[#5e6475] focus:outline-none focus:border-[#f59e0b]/60 transition-colors"
              />
            </div>

            {/* Target Domain & Disclosure Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-white block">
                  Target Publication Domain
                </label>
                <input
                  type="text"
                  required
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  placeholder="e.g. substack.com, techcrunch.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-[#5e6475] focus:outline-none focus:border-[#f59e0b]/60 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-white block">
                  Mandatory FTC Disclosure Tag
                </label>
                <input
                  type="text"
                  required
                  value={mandatoryDisclosure}
                  onChange={(e) => setMandatoryDisclosure(e.target.value)}
                  placeholder="e.g. #ad, #sponsored"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-[#5e6475] focus:outline-none focus:border-[#f59e0b]/60 transition-colors"
                />
              </div>
            </div>

            {/* Required Sponsor Link */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-white block">
                Required Sponsor Link
              </label>
              <input
                type="url"
                required
                value={requiredSponsorLink}
                onChange={(e) => setRequiredSponsorLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-[#5e6475] focus:outline-none focus:border-[#f59e0b]/60 transition-colors"
              />
            </div>

            {/* Escrow Deposit (GEN) */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-white block">
                Escrow Payout Deposit (GEN)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={depositGen}
                  onChange={(e) => setDepositGen(e.target.value)}
                  placeholder="0.15"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-[#5e6475] focus:outline-none focus:border-[#f59e0b]/60 transition-colors pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#f59e0b]">
                  GEN
                </span>
              </div>
            </div>

            {/* Brief Requirements */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-white block">
                Deliverable Brief & Verification Requirements
              </label>
              <textarea
                rows={3}
                required
                value={briefRequirements}
                onChange={(e) => setBriefRequirements(e.target.value)}
                placeholder="Describe campaign goals and required content..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-[#5e6475] focus:outline-none focus:border-[#f59e0b]/60 transition-colors leading-relaxed resize-none"
              />
            </div>

          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              to="/campaigns"
              className="px-5 py-2.5 rounded-xl text-xs font-sans text-[#9499a8] hover:text-white transition-colors"
            >
              Cancel
            </Link>

            {isConnected ? (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-50 text-[#050608] text-xs font-semibold tracking-tight shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>{submitting ? 'Broadcasting Escrow...' : 'Lock Escrow & Create Campaign'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-[#050608] text-xs font-semibold tracking-tight shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet to Fund</span>
              </button>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
