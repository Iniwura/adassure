import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Globe, ArrowRight, ArrowUpRight, Lock, CheckCircle2, RotateCcw } from 'lucide-react';
import { Campaign, CampaignStatus } from '../types';
import { haptics } from '../lib/haptics';

interface CampaignRegistryProps {
  campaigns: Campaign[];
  currentEpoch?: number;
  onReclaimCampaign: (campaignId: number) => Promise<void>;
}

export function CampaignRegistry({
  campaigns,
  currentEpoch = 1,
  onReclaimCampaign
}: CampaignRegistryProps) {
  const [filterStatus, setFilterStatus] = useState<'ALL' | CampaignStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = campaigns.filter((c) => {
    const matchesStatus = filterStatus === 'ALL' ? true : c.status === filterStatus;
    const matchesSearch =
      searchQuery === ''
        ? true
        : c.target_domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.brief_requirements.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.mandatory_disclosure.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(c.id).includes(searchQuery);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#050608] text-[#f7f8fa] py-12 px-4 sm:px-6">
      <div className="max-w-[1280px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Creator Campaigns
            </h1>
            <p className="text-sm text-[#9499a8] mt-1 max-w-xl">
              Inspect on-chain creator sponsorship escrows, required links, and deliverable submissions.
            </p>
          </div>
          <Link
            to="/campaigns/new"
            onClick={() => haptics.click()}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-[#050608] text-xs font-semibold tracking-tight transition-all"
          >
            <span>+ Create Campaign</span>
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#9499a8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search domain, creator, or brief..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs font-sans text-white placeholder-[#9499a8] focus:outline-none focus:border-[#f59e0b]/60 transition-colors"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center space-x-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06] text-xs font-sans">
            {(['ALL', 'ACTIVE', 'FULFILLED', 'REFUNDED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  haptics.tick();
                  setFilterStatus(st);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === st
                    ? 'bg-[#f59e0b] text-[#050608] font-semibold shadow-xs'
                    : 'text-[#9499a8] hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Campaign Cards */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-xs font-mono text-[#9499a8]">
              No campaigns match the selected filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => {
              const isFulfilled = c.status === 'FULFILLED' || c.statusCode === 1;
              const isRefunded = c.status === 'REFUNDED' || c.statusCode === 2;

              return (
                <div
                  key={c.id}
                  className="rounded-2xl p-6 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.16] transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[#f59e0b]">Campaign #{c.id}</span>
                      {isFulfilled ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 text-[10px] flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Fulfilled</span>
                        </span>
                      ) : isRefunded ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] flex items-center space-x-1">
                          <RotateCcw className="w-3 h-3" />
                          <span>Refunded</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 text-[10px] flex items-center space-x-1">
                          <Lock className="w-3 h-3" />
                          <span>Active Escrow</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 text-white font-semibold text-base">
                        <Globe className="w-4 h-4 text-[#f59e0b]" />
                        <span>{c.target_domain}</span>
                      </div>
                      <p className="text-xs text-[#9499a8] line-clamp-3 mt-2 leading-relaxed">
                        {c.brief_requirements || 'Creator sponsorship deliverable verification.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] space-y-1 text-xs font-mono text-[#9499a8]">
                      <div className="flex items-center justify-between">
                        <span>Disclosure:</span>
                        <span className="text-white font-medium">{c.mandatory_disclosure}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Creator:</span>
                        <span className="text-white font-mono truncate max-w-[140px]">
                          {c.creator ? `${c.creator.slice(0, 6)}...${c.creator.slice(-4)}` : 'Any'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#9499a8] block">Payout</span>
                      <span className="text-lg font-mono font-bold text-white">
                        {c.payout_formatted}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {c.status === 'ACTIVE' && (
                        <button
                          onClick={() => {
                            haptics.tick();
                            onReclaimCampaign(c.id);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-mono transition-colors"
                          title="Reclaim if campaign has expired"
                        >
                          Reclaim
                        </button>
                      )}

                      <Link
                        to={`/campaigns/${c.id}`}
                        onClick={() => haptics.tick()}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-sans font-medium transition-colors"
                      >
                        <span>View Dossier</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
