import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Coins,
  FileText
} from 'lucide-react';
import { haptics } from '../lib/haptics';

export function Hero({
  totalLockedFormatted,
  campaignCount,
}: {
  totalLockedFormatted: string;
  campaignCount: number;
}) {
  return (
    <section className="relative pt-12 pb-16 px-4 sm:px-6 overflow-hidden border-b border-white/[0.08] bg-[#0a0d14]">
      <div className="max-w-[1360px] mx-auto">
        
        {/* Asymmetric Split Studio Diptych */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column (Columns 1-6): Editorial Pitch & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.04]">
              Autonomous escrow for creator sponsorships and editorial deals.
            </h1>

            <p className="text-base sm:text-lg text-[#9499a8] leading-relaxed font-normal max-w-xl">
              Intelligent Contracts audit published URLs, verify required backlinks and FTC disclosures, and release escrow directly to creators.
            </p>

            {/* Clean Action Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/campaigns"
                onClick={() => haptics.click()}
                className="inline-flex items-center space-x-2 px-7 py-3 rounded-xl bg-[#d4a359] hover:bg-[#b38238] text-[#07090e] font-sans text-xs font-semibold tracking-tight shadow-[0_0_20px_rgba(212,163,89,0.3)] transition-all"
              >
                <span>View Insertion Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/campaigns/new"
                onClick={() => haptics.click()}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-white text-xs font-medium tracking-tight transition-all"
              >
                <span>Issue Insertion Order</span>
              </Link>
            </div>

            {/* Micro Stats Ledger */}
            <div className="pt-6 border-t border-white/[0.06] grid grid-cols-3 gap-4 font-mono text-xs">
              <div>
                <span className="text-[10px] text-[#9499a8] uppercase block">Committed Escrow</span>
                <span className="text-sm font-bold text-white mt-0.5 block">{totalLockedFormatted}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#9499a8] uppercase block">Active Orders</span>
                <span className="text-sm font-bold text-white mt-0.5 block">{campaignCount} Live Deals</span>
              </div>
              <div>
                <span className="text-[10px] text-[#9499a8] uppercase block">Intermediary Cut</span>
                <span className="text-sm font-bold text-[#10b981] mt-0.5 block">0.0% Fee</span>
              </div>
            </div>
          </div>

          {/* Right Column (Columns 7-12): Live Deliverable Proof Lens */}
          <div className="lg:col-span-6">
            <div className="p-6 rounded-2xl bg-[#0f1420] border border-white/[0.1] space-y-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
              
              {/* Publication Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span className="text-white font-semibold">WIRED · TECH BRIEF</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-[10px] font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>5/5 Quorum Verified</span>
                </span>
              </div>

              {/* Simulated Published Deliverable Snippet */}
              <div className="space-y-2.5">
                <h3 className="font-serif text-lg text-white font-normal leading-snug">
                  The Transition from Centralized Ad Networks to Deterministic Smart Escrow
                </h3>
                <p className="text-xs text-[#cfd3dc] leading-relaxed font-sans">
                  ...Creators currently surrender upwards of 30% of sponsorship budgets to talent managers. 
                  This edition was made possible through grant funding from{' '}
                  <span className="bg-[#d4a359]/20 text-[#e2ba77] font-semibold underline px-1 py-0.5 rounded border border-[#d4a359]/30">
                    GenLayer Builder Grants
                  </span>{' '}
                  (<span className="text-[#10b981] font-mono font-bold text-[11px]">#ad</span>), 
                  whose intelligent contracts scrape published web pages directly to audit backlink integrity without oracles...
                </p>
              </div>

              {/* Validator Consensus Audit Terminal */}
              <div className="pt-3 border-t border-white/[0.06] rounded-xl bg-black/40 p-3.5 space-y-2 text-[11px] font-mono">
                <div className="flex items-center justify-between text-[#9499a8]">
                  <span>VALIDATOR CONSENSUS AUDIT:</span>
                  <span className="text-white">Studionet Consensus</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center space-x-1.5 text-[#10b981]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    <span>Target URL: wired.com (Matched)</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[#10b981]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    <span>FTC Tag: #ad (Found)</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[#10b981]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    <span>Sponsor Backlink: Validated</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[#10b981]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    <span>Payout: 0.1500 GEN Released</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
