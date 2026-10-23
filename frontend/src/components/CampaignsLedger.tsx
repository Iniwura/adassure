import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Lock, CheckCircle2, RotateCcw } from 'lucide-react';
import { Campaign } from '../types';
import { haptics } from '../lib/haptics';

export function CampaignsLedger({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <section className="py-20 px-4 sm:px-6 border-t border-white/[0.06] bg-[#050608]">
      <div className="max-w-[1280px] mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Active campaign registry
            </h2>
            <p className="text-[#9499a8] text-sm mt-1">
              Live on-chain escrow deposits on GenLayer Studionet.
            </p>
          </div>
          <Link
            to="/campaigns"
            onClick={() => haptics.click()}
            className="text-xs font-mono text-[#f59e0b] hover:text-[#fbbf24] flex items-center space-x-1"
          >
            <span>View all campaigns</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.slice(0, 6).map((c) => {
            const isFulfilled = c.status === 'FULFILLED' || c.statusCode === 1;
            const isRefunded = c.status === 'REFUNDED' || c.statusCode === 2;

            return (
              <Link
                key={c.id}
                to={`/campaigns/${c.id}`}
                onClick={() => haptics.tick()}
                className="group block p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] hover:border-[#f59e0b]/40 transition-all text-inherit no-underline space-y-4"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#9499a8]">Campaign #{c.id}</span>
                  {isFulfilled ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 text-[10px] flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Fulfilled</span>
                    </span>
                  ) : isRefunded ? (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] flex items-center space-x-1">
                      <RotateCcw className="w-3 h-3" />
                      <span>Refunded</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 text-[10px] flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white group-hover:text-[#f59e0b] transition-colors truncate">
                    {c.target_domain}
                  </h3>
                  <p className="text-xs text-[#9499a8] line-clamp-2 mt-1.5 leading-relaxed">
                    {c.brief_requirements || 'Creator sponsorship deliverable verification.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#9499a8]">Required Tag: {c.mandatory_disclosure}</span>
                  <span className="font-bold text-white">{c.payout_formatted}</span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
