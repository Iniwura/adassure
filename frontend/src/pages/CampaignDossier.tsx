import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Lock,
  RotateCcw,
  Wallet,
  FileText
} from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { Campaign, DeliverableRecord, TxProgress } from '../types';
import { useWallet } from '../context/WalletContext';
import { haptics } from '../lib/haptics';

interface CampaignDossierProps {
  campaigns: Campaign[];
  submissions: DeliverableRecord[];
  currentEpoch?: number;
  onSubmitDeliverable: (campaignId: number, liveUrl: string) => Promise<void>;
  onReclaimCampaign: (campaignId: number) => Promise<void>;
  txProgress: TxProgress;
}

export function CampaignDossier({
  campaigns,
  submissions,
  currentEpoch = 1,
  onSubmitDeliverable,
  onReclaimCampaign,
  txProgress
}: CampaignDossierProps) {
  const { id } = useParams<{ id: string }>();
  const campaignId = Number(id);
  const campaign = campaigns.find((c) => c.id === campaignId);
  const { isConnected, setShowModal } = useWallet();

  const [liveUrlInput, setLiveUrlInput] = useState(
    campaign ? `https://${campaign.target_domain}/p/intelligent-contracts-walkthrough` : ''
  );
  const [submitting, setSubmitting] = useState(false);

  if (!campaign) {
    return (
      <div className="min-h-screen bg-[#0a0d14] py-20 px-4 text-[#f4f6fa]">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <Link
            to="/campaigns"
            className="inline-flex items-center space-x-2 text-xs font-mono text-[#9499a8] hover:text-[#d4a359]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Insertion Orders</span>
          </Link>
          <div className="p-8 bg-[#0c1017] border border-white/[0.08] rounded-2xl">
            <h2 className="font-serif text-xl font-normal text-white">Order #{id} Not Found</h2>
            <p className="text-xs font-mono text-[#9499a8] mt-2">
              This insertion order is not currently indexed in the deployed Studionet contract.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isFulfilled = campaign.status === 'FULFILLED' || campaign.statusCode === 1;
  const isRefunded = campaign.status === 'REFUNDED' || campaign.statusCode === 2;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isConnected) {
      haptics.tick();
      setShowModal(true);
      return;
    }
    if (!liveUrlInput.trim()) return;

    haptics.click();
    setSubmitting(true);
    try {
      await onSubmitDeliverable(campaign!.id, liveUrlInput.trim());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-[#f4f6fa] py-12 px-4 sm:px-6">
      <div className="max-w-[1360px] mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          to="/campaigns"
          onClick={() => haptics.tick()}
          className="inline-flex items-center space-x-2 text-xs font-mono text-[#9499a8] hover:text-[#d4a359] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Insertion Orders</span>
        </Link>

        {/* Order Dossier Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-white/[0.08] gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="font-bold text-[#d4a359]">Insertion Order #{campaign.id}</span>
              <span className="text-[#5e6475]">/</span>
              <span className="text-white flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>{campaign.target_domain}</span>
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-white">
              {campaign.target_domain} Delivery & Audit Dossier
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-[10px] font-mono text-[#9499a8] block">Committed Escrow</span>
              <span className="text-2xl font-mono font-bold text-white">
                {campaign.payout_formatted}
              </span>
            </div>

            {isFulfilled ? (
              <span className="px-3 py-1 rounded-full bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 text-xs font-mono flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Fulfilled</span>
              </span>
            ) : isRefunded ? (
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono flex items-center space-x-1.5">
                <RotateCcw className="w-4 h-4" />
                <span>Refunded</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-[#d4a359]/20 text-[#d4a359] border border-[#d4a359]/30 text-xs font-mono flex items-center space-x-1.5">
                <Lock className="w-4 h-4" />
                <span>Active Escrow</span>
              </span>
            )}
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (8 Cols): Brief & Submission */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Scope Card */}
            <div className="p-6 rounded-2xl bg-[#0c1017] border border-white/[0.08] space-y-4">
              <div className="flex items-center space-x-2 text-xs font-mono text-[#d4a359]">
                <FileText className="w-3.5 h-3.5" />
                <span>ORDER TERMS & EDITORIAL CRITERIA</span>
              </div>
              <p className="text-sm text-[#cfd3dc] leading-relaxed font-sans">
                {campaign.brief_requirements}
              </p>

              <div className="pt-4 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[#9499a8] block text-[11px]">Required Sponsor Backlink:</span>
                  <a
                    href={campaign.required_sponsor_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#d4a359] hover:underline flex items-center space-x-1 mt-0.5 truncate"
                  >
                    <span>{campaign.required_sponsor_link}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
                <div>
                  <span className="text-[#9499a8] block text-[11px]">Mandatory FTC Tag:</span>
                  <span className="text-white font-semibold mt-0.5 block">
                    {campaign.mandatory_disclosure}
                  </span>
                </div>
              </div>
            </div>

            {/* Submission Form (If active) */}
            {!isFulfilled && !isRefunded && (
              <div className="p-6 rounded-2xl bg-[#0c1017] border border-white/[0.08] space-y-4">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-white font-normal">
                    Submit Published Deliverable for Consensus Audit
                  </h3>
                  <p className="text-xs text-[#9499a8] font-mono">
                    GenLayer validator nodes crawl the submitted URL, parse the DOM structure, confirm backlink destination and FTC tag, and disburse escrow.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-[#9499a8] block">
                      Live Publication URL:
                    </label>
                    <input
                      type="url"
                      required
                      value={liveUrlInput}
                      onChange={(e) => setLiveUrlInput(e.target.value)}
                      placeholder={`https://${campaign.target_domain}/...`}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-[#5e6475] focus:outline-none focus:border-[#d4a359]/60 transition-colors"
                    />
                  </div>

                  {isConnected ? (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#d4a359] hover:bg-[#b38238] disabled:opacity-50 text-[#07090e] text-xs font-semibold tracking-tight shadow-[0_0_20px_rgba(212,163,89,0.3)] transition-all"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{submitting ? 'Auditing with Validators...' : 'Submit & Execute Settlement'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#d4a359] hover:bg-[#b38238] text-[#07090e] text-xs font-semibold tracking-tight shadow-[0_0_20px_rgba(212,163,89,0.3)] transition-all"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Connect Wallet to Submit</span>
                    </button>
                  )}
                </form>
              </div>
            )}

            {/* Fulfilled Deliverable Notice */}
            {isFulfilled && (
              <div className="p-6 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 space-y-2">
                <div className="flex items-center space-x-2 text-[#10b981] font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Deliverable Verified & Settlement Disbursed</span>
                </div>
                <p className="text-xs text-[#cfd3dc] font-sans">
                  GenLayer validators confirmed the required sponsor link and FTC disclosure tag. Escrow payout of {campaign.payout_formatted} was released directly to the creator.
                </p>
                {campaign.verified_url && (
                  <div className="pt-2 text-xs font-mono">
                    <span className="text-[#9499a8]">Audited Live URL: </span>
                    <a
                      href={campaign.verified_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#10b981] hover:underline"
                    >
                      {campaign.verified_url}
                    </a>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Column (4 Cols): Order Specs & Consensus Record */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Insertion Order Details */}
            <div className="p-6 rounded-2xl bg-[#0c1017] border border-white/[0.08] space-y-4">
              <h3 className="text-xs font-mono text-[#9499a8] uppercase">
                Contract Specifications
              </h3>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-[#9499a8] block text-[11px]">Brand Sponsor:</span>
                  <div className="flex items-center justify-between text-white mt-0.5">
                    <span className="truncate max-w-[180px]">{campaign.brand}</span>
                    <CopyButton value={campaign.brand} label="" />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.04]">
                  <span className="text-[#9499a8] block text-[11px]">Creator Beneficiary:</span>
                  <div className="flex items-center justify-between text-white mt-0.5">
                    <span className="truncate max-w-[180px]">{campaign.creator}</span>
                    <CopyButton value={campaign.creator} label="" />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.04]">
                  <span className="text-[#9499a8] block text-[11px]">Target Domain:</span>
                  <span className="text-white mt-0.5 block">{campaign.target_domain}</span>
                </div>

                <div className="pt-2 border-t border-white/[0.04]">
                  <span className="text-[#9499a8] block text-[11px]">Contract Network:</span>
                  <span className="text-white mt-0.5 block">GenLayer Studionet</span>
                </div>
              </div>

              {/* Reclaim Action (If active) */}
              {!isFulfilled && !isRefunded && (
                <div className="pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      haptics.tick();
                      onReclaimCampaign(campaign.id);
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-red-500/10 text-[#9499a8] hover:text-red-400 border border-white/[0.08] hover:border-red-500/20 text-xs font-mono transition-colors"
                  >
                    Reclaim Escrow (If Expired)
                  </button>
                </div>
              )}
            </div>

            {/* Validator Consensus Verification */}
            <div className="p-6 rounded-2xl bg-[#0c1017] border border-white/[0.08] space-y-2 text-xs font-mono text-[#9499a8]">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                <span>Multi-Validator Consensus</span>
              </div>
              <p className="text-[11px] leading-relaxed pt-1 font-sans text-[#cfd3dc]">
                Validators independently fetch the live published DOM via headless browser execution, inspect anchor elements and disclosure tags, and reach strict equivalence consensus before disbursing funds.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
