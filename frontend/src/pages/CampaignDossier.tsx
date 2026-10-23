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
  Wallet
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
      <div className="min-h-screen bg-[#050608] py-20 px-4 text-[#f7f8fa]">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <Link
            to="/campaigns"
            className="inline-flex items-center space-x-2 text-xs font-mono text-[#9499a8] hover:text-[#f59e0b]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Campaigns</span>
          </Link>
          <div className="p-8 bg-[#0c0e14] border border-white/[0.08] rounded-2xl">
            <h2 className="text-xl font-bold text-white">Campaign #{id} Not Found</h2>
            <p className="text-xs font-mono text-[#9499a8] mt-2">
              This campaign is not currently indexed in the deployed Studionet contract.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isFulfilled = campaign.status === 'FULFILLED' || campaign.statusCode === 1;
  const isRefunded = campaign.status === 'REFUNDED' || campaign.statusCode === 2;
  const campaignSubmissions = submissions.filter((s) => s.campaign_id === campaignId);

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
    <div className="min-h-screen bg-[#050608] text-[#f7f8fa] py-12 px-4 sm:px-6">
      <div className="max-w-[1280px] mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          to="/campaigns"
          onClick={() => haptics.tick()}
          className="inline-flex items-center space-x-2 text-xs font-mono text-[#9499a8] hover:text-[#f59e0b] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Campaigns</span>
        </Link>

        {/* Campaign Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-white/[0.08] gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="font-bold text-[#f59e0b]">Campaign #{campaign.id}</span>
              <span className="text-[#5e6475]">/</span>
              <span className="text-white flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>{campaign.target_domain}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {campaign.target_domain} Sponsorship Escrow
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-[10px] font-mono text-[#9499a8] block">Escrow Amount</span>
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
              <span className="px-3 py-1 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 text-xs font-mono flex items-center space-x-1.5">
                <Lock className="w-4 h-4" />
                <span>Active Escrow</span>
              </span>
            )}
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Brief Requirements Card */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
              <h2 className="text-sm font-semibold text-white font-sans">
                Deliverable Requirements & Acceptance Criteria
              </h2>
              <p className="text-sm text-[#cfd3dc] leading-relaxed">
                {campaign.brief_requirements}
              </p>

              <div className="pt-4 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[#9499a8] block">Required Sponsor Link:</span>
                  <a
                    href={campaign.required_sponsor_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#f59e0b] hover:underline flex items-center space-x-1 mt-0.5 truncate"
                  >
                    <span>{campaign.required_sponsor_link}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
                <div>
                  <span className="text-[#9499a8] block">Mandatory Disclosure Tag:</span>
                  <span className="text-white font-semibold mt-0.5 block">
                    {campaign.mandatory_disclosure}
                  </span>
                </div>
              </div>
            </div>

            {/* Submission Form (If active) */}
            {!isFulfilled && !isRefunded && (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">
                    Submit Published Deliverable URL
                  </h3>
                  <p className="text-xs text-[#9499a8]">
                    When submitted, GenLayer validators scrape the live HTML, verify sponsor backlink and #{campaign.mandatory_disclosure} disclosure, and trigger instant payout.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-[#9499a8] block">
                      Live Article / Content URL:
                    </label>
                    <input
                      type="url"
                      required
                      value={liveUrlInput}
                      onChange={(e) => setLiveUrlInput(e.target.value)}
                      placeholder={`https://${campaign.target_domain}/...`}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder-[#5e6475] focus:outline-none focus:border-[#f59e0b]/60 transition-colors"
                    />
                  </div>

                  {isConnected ? (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-50 text-[#050608] text-xs font-semibold tracking-tight shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{submitting ? 'Verifying with Validators...' : 'Submit & Trigger Verification'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-[#050608] text-xs font-semibold tracking-tight shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
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
                  <span>Deliverable Verified & Escrow Disbursed</span>
                </div>
                <p className="text-xs text-[#cfd3dc]">
                  Validators confirmed sponsor link presence and compliance. Escrow of {campaign.payout_formatted} was disbursed directly to creator.
                </p>
                {campaign.verified_url && (
                  <div className="pt-2 text-xs font-mono">
                    <span className="text-[#9499a8]">Verified URL: </span>
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

          {/* Right Column (1 Col): Metadata & Actions */}
          <div className="space-y-6">
            
            {/* Campaign Metadata */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
              <h3 className="text-xs font-mono text-[#9499a8] uppercase">
                Campaign Parameters
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
                  <span className="text-[#9499a8] block text-[11px]">Assigned Creator:</span>
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

            {/* Quorum Info */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2 text-xs font-mono text-[#9499a8]">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                <span>Multi-Validator Consensus</span>
              </div>
              <p className="text-[11px] leading-relaxed pt-1">
                GenLayer validators run decentralized headless browser engines to crawl and inspect the submitted page DOM, checking link targets, rel attributes, and FTC disclosures before signing the state transition.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
