import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Lock, CheckCircle2, RotateCcw, Globe } from 'lucide-react';
import { Campaign } from '../types';
import { haptics } from '../lib/haptics';

export function DealLedger({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <section className="py-16 px-4 sm:px-6 bg-[#0a0d14]">
      <div className="max-w-[1360px] mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-white">
              Active insertion orders & deal ledger
            </h2>
            <p className="text-xs text-[#9499a8] font-mono mt-1">
              Live on-chain escrow deposits committed on GenLayer Studionet.
            </p>
          </div>
          <Link
            to="/campaigns"
            onClick={() => haptics.click()}
            className="text-xs font-mono text-[#d4a359] hover:text-[#e2ba77] flex items-center space-x-1"
          >
            <span>View all orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Institutional Deal Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0c1017]">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[#9499a8] font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Publication</th>
                <th className="py-3 px-4">Deliverable Scope</th>
                <th className="py-3 px-4">FTC Tag</th>
                <th className="py-3 px-4">Escrow Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {campaigns.slice(0, 6).map((c) => {
                const isFulfilled = c.status === 'FULFILLED' || c.statusCode === 1;
                const isRefunded = c.status === 'REFUNDED' || c.statusCode === 2;

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-white/[0.02] transition-colors group font-mono"
                  >
                    <td className="py-3.5 px-4 font-bold text-[#d4a359]">
                      #{c.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2 text-white font-semibold">
                        <Globe className="w-3.5 h-3.5 text-[#d4a359] flex-shrink-0" />
                        <span>{c.target_domain}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-sans text-xs text-[#cfd3dc] max-w-xs truncate">
                      {c.brief_requirements || 'Sponsorship insertion order.'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-white/[0.06] text-white text-[11px] font-mono">
                        {c.mandatory_disclosure}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white text-xs">
                      {c.payout_formatted}
                    </td>

                    <td className="py-3.5 px-4">
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

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/campaigns/${c.id}`}
                        onClick={() => haptics.tick()}
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-[#d4a359] hover:text-[#07090e] text-white font-sans text-xs transition-colors"
                      >
                        <span>Audit</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}
