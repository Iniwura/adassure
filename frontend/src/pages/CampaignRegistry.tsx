import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Globe, ArrowUpRight, Lock, CheckCircle2, RotateCcw } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0a0d14] text-[#f4f6fa] py-12 px-4 sm:px-6">
      <div className="max-w-[1360px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-white">
              Insertion Orders & Sponsorship Registry
            </h1>
            <p className="text-xs font-mono text-[#9499a8] mt-1 max-w-xl">
              Inspect verified editorial sponsorships, track compliance requirements, and audit deliverable dossiers.
            </p>
          </div>
          <Link
            to="/campaigns/new"
            onClick={() => haptics.click()}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#d4a359] hover:bg-[#b38238] text-[#07090e] text-xs font-semibold tracking-tight transition-all shadow-sm"
          >
            <span>+ Issue Insertion Order</span>
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
              className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs font-sans text-white placeholder-[#9499a8] focus:outline-none focus:border-[#d4a359]/60 transition-colors"
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
                    ? 'bg-[#d4a359] text-[#07090e] font-semibold shadow-xs'
                    : 'text-[#9499a8] hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {st === 'ALL' ? 'All Orders' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Structured Institutional Deal Table */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-xs font-mono text-[#9499a8]">
              No insertion orders match the selected filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0c1017]">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[#9499a8] font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Publication Target</th>
                  <th className="py-3.5 px-4">Deliverable Scope</th>
                  <th className="py-3.5 px-4">Creator Beneficiary</th>
                  <th className="py-3.5 px-4">FTC Tag</th>
                  <th className="py-3.5 px-4">Escrow Value</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((c) => {
                  const isFulfilled = c.status === 'FULFILLED' || c.statusCode === 1;
                  const isRefunded = c.status === 'REFUNDED' || c.statusCode === 2;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-white/[0.02] transition-colors group font-mono text-xs"
                    >
                      <td className="py-4 px-4 font-bold text-[#d4a359]">
                        #{c.id}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2 text-white font-semibold">
                          <Globe className="w-3.5 h-3.5 text-[#d4a359] flex-shrink-0" />
                          <span>{c.target_domain}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-sans text-xs text-[#cfd3dc] max-w-sm truncate">
                        {c.brief_requirements || 'Sponsorship insertion order.'}
                      </td>

                      <td className="py-4 px-4 text-[#9499a8]">
                        {c.creator ? `${c.creator.slice(0, 6)}...${c.creator.slice(-4)}` : 'Open'}
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded bg-white/[0.06] text-white text-[11px]">
                          {c.mandatory_disclosure}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-white">
                        {c.payout_formatted}
                      </td>

                      <td className="py-4 px-4">
                        {isFulfilled ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Fulfilled</span>
                          </span>
                        ) : isRefunded ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-semibold">
                            <RotateCcw className="w-3 h-3" />
                            <span>Refunded</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#d4a359]/20 text-[#d4a359] border border-[#d4a359]/30 text-[10px] font-semibold">
                            <Lock className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center space-x-2">
                          {c.status === 'ACTIVE' && (
                            <button
                              onClick={() => {
                                haptics.tick();
                                onReclaimCampaign(c.id);
                              }}
                              className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] transition-colors"
                              title="Reclaim if campaign has expired"
                            >
                              Reclaim
                            </button>
                          )}

                          <Link
                            to={`/campaigns/${c.id}`}
                            onClick={() => haptics.tick()}
                            className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-[#d4a359] hover:text-[#07090e] text-white font-sans text-xs transition-colors"
                          >
                            <span>Dossier</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
