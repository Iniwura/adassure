import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock, FileText, Wallet } from 'lucide-react';
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

const PRESET_TEMPLATES = [
  {
    label: 'Wired — Technical Deep Dive',
    creator: '0x63C15b5921B4b2215e23cf77a8CFCF3a0D62F33d',
    domain: 'wired.com',
    link: 'https://genlayer.io/builder-grants',
    tag: '#ad',
    brief: 'Produce an in-depth editorial essay analyzing decentralized consensus versus centralized ad networks. Must include link in opening section and #ad tag.',
    deposit: '0.15'
  },
  {
    label: 'TechCrunch — Disrupt Newsletter',
    creator: '0x43bFaB1209eE49e1e86A46cf01844E20B345678',
    domain: 'techcrunch.com',
    link: 'https://genlayer.io/demo',
    tag: '#sponsored',
    brief: 'Sponsored briefing covering Intelligent Contracts without oracles. Requires backlink to demo and #sponsored disclosure in top 3 lines.',
    deposit: '0.25'
  },
  {
    label: 'Substack — Creator Economy Review',
    creator: '0x63C15b5921B4b2215e23cf77a8CFCF3a0D62F33d',
    domain: 'substack.com',
    link: 'https://genlayer.io',
    tag: '#ad',
    brief: 'Independent newsletter review evaluating zero-fee creator payment escrow mechanisms. Link and disclosure tag mandatory.',
    deposit: '0.12'
  }
];

export function CreateCampaignWizard({ onCreateCampaign }: CreateCampaignWizardProps) {
  const navigate = useNavigate();
  const { isConnected, setShowModal } = useWallet();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [creator, setCreator] = useState('0x63C15b5921B4b2215e23cf77a8CFCF3a0D62F33d');
  const [targetDomain, setTargetDomain] = useState('wired.com');
  const [requiredSponsorLink, setRequiredSponsorLink] = useState('https://genlayer.io/builder-grants');
  const [mandatoryDisclosure, setMandatoryDisclosure] = useState('#ad');
  const [briefRequirements, setBriefRequirements] = useState(
    'Produce an in-depth editorial essay analyzing decentralized consensus versus centralized ad networks. Must include link in opening section and #ad tag.'
  );
  const [depositGen, setDepositGen] = useState('0.15');

  function applyPreset(tpl: typeof PRESET_TEMPLATES[0]) {
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
    <div className="min-h-screen bg-[#0a0d14] text-[#f4f6fa] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          to="/campaigns"
          onClick={() => haptics.tick()}
          className="inline-flex items-center space-x-2 text-xs font-mono text-[#9499a8] hover:text-[#d4a359] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Insertion Orders</span>
        </Link>

        {/* Header */}
        <div className="space-y-2 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#d4a359]">
            <FileText className="w-3.5 h-3.5" />
            <span>DIGITAL ADVERTISING INSERTION ORDER (IO)</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white">
            Draft Sponsorship Insertion Order
          </h1>
          <p className="text-xs font-mono text-[#9499a8] leading-relaxed">
            Specify placement terms, required backlink, and disclosure standards. Escrow commits directly to GenLayer Studionet.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono text-[#9499a8] uppercase">
            Order Presets:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {PRESET_TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => applyPreset(tpl)}
                className="p-3 text-left rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-[#d4a359]/40 text-xs font-mono text-[#cfd3dc] transition-all"
              >
                <div className="font-semibold text-white truncate">{tpl.label}</div>
                <div className="text-[11px] text-[#d4a359] mt-0.5">{tpl.deposit} GEN</div>
              </button>
            ))}
          </div>
        </div>

        {/* Formal Insertion Order Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0c1017] border border-white/[0.08] space-y-5">
            
            {/* Section 1: Partner Beneficiary */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#9499a8] block">
                CREATOR BENEFICIARY ADDRESS:
              </label>
              <input
                type="text"
                required
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-[#5e6475] focus:outline-none focus:border-[#d4a359]/60 transition-colors"
              />
            </div>

            {/* Section 2: Publication & Disclosure Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-[#9499a8] block">
                  TARGET PUBLICATION DOMAIN:
                </label>
                <input
                  type="text"
                  required
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  placeholder="e.g. wired.com, substack.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-[#5e6475] focus:outline-none focus:border-[#d4a359]/60 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-[#9499a8] block">
                  MANDATORY FTC DISCLOSURE:
                </label>
                <input
                  type="text"
                  required
                  value={mandatoryDisclosure}
                  onChange={(e) => setMandatoryDisclosure(e.target.value)}
                  placeholder="e.g. #ad, #sponsored"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-[#5e6475] focus:outline-none focus:border-[#d4a359]/60 transition-colors"
                />
              </div>
            </div>

            {/* Section 3: Required Sponsor Link */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#9499a8] block">
                REQUIRED SPONSOR BACKLINK:
              </label>
              <input
                type="url"
                required
                value={requiredSponsorLink}
                onChange={(e) => setRequiredSponsorLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-[#5e6475] focus:outline-none focus:border-[#d4a359]/60 transition-colors"
              />
            </div>

            {/* Section 4: Escrow Commitment */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#9499a8] block">
                ESCROW DEPOSIT COMMITMENT:
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
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-[#5e6475] focus:outline-none focus:border-[#d4a359]/60 transition-colors pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#d4a359]">
                  GEN
                </span>
              </div>
            </div>

            {/* Section 5: Scope & Creative Guidelines */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#9499a8] block">
                EDITORIAL SCOPE & GUIDELINES:
              </label>
              <textarea
                rows={3}
                required
                value={briefRequirements}
                onChange={(e) => setBriefRequirements(e.target.value)}
                placeholder="Editorial guidelines and mandatory placement instructions..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-[#5e6475] focus:outline-none focus:border-[#d4a359]/60 transition-colors leading-relaxed resize-none"
              />
            </div>

          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              to="/campaigns"
              className="px-5 py-2.5 rounded-xl text-xs font-mono text-[#9499a8] hover:text-white transition-colors"
            >
              Cancel
            </Link>

            {isConnected ? (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#d4a359] hover:bg-[#b38238] disabled:opacity-50 text-[#07090e] text-xs font-semibold tracking-tight shadow-[0_0_20px_rgba(212,163,89,0.3)] transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>{submitting ? 'Executing Order...' : 'Lock Escrow & Issue Order'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#d4a359] hover:bg-[#b38238] text-[#07090e] text-xs font-semibold tracking-tight shadow-[0_0_20px_rgba(212,163,89,0.3)] transition-all"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet to Issue</span>
              </button>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
