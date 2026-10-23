import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ExternalLink,
  Coins
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
    <section className="relative pt-16 pb-20 px-4 sm:px-6 overflow-hidden">
      {/* Background Subtle Grid & Ambient Glow */}
      <div className="framer-bg-grid" />
      <div className="framer-ambient-glow" />

      <div className="max-w-[1280px] mx-auto relative z-10 space-y-12">

        {/* Hero Title & Subtext adhering to Hallmark Floor constraints */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.04em] leading-[0.98] text-white">
            Autonomous escrow for creator sponsorships
          </h1>

          <p className="text-base sm:text-xl text-[#9499a8] leading-relaxed max-w-2xl mx-auto font-normal">
            Smart contracts verify published deliverables and disburse payouts directly to creator wallets.
          </p>

          {/* Clean 2-Button Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/campaigns"
              onClick={() => haptics.click()}
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-[#050608] font-sans text-sm font-semibold tracking-tight shadow-[0_0_30px_rgba(245,158,11,0.35)] transition-all"
            >
              <span>Explore Campaigns</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/campaigns/new"
              onClick={() => haptics.click()}
              className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/[0.2] text-white text-sm font-medium tracking-tight backdrop-blur-md transition-all"
            >
              <span>Create Campaign</span>
            </Link>
          </div>
        </div>

        {/* Product Preview Cards showing real creator campaign deliverables */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Card 1: Completed & Verified Deliverable */}
          <div className="framer-glass-card rounded-2xl p-6 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="font-bold text-[#f59e0b]">Campaign #1</span>
                <span className="text-white font-semibold">wired.com</span>
                <span className="text-[#9499a8]">#ad</span>
              </div>
              <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified & Paid</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#cfd3dc] leading-relaxed">
              Technical walkthrough covering GenLayer Intelligent Contracts and web scraping. Verified sponsor backlink and FTC disclosure tag present.
            </p>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-1.5 text-[#10b981]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>5/5 Quorum Consensus</span>
              </div>
              <span className="font-bold text-white text-sm">0.1500 GEN</span>
            </div>
          </div>

          {/* Card 2: Open Active Escrow */}
          <div className="framer-glass-card rounded-2xl p-6 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="font-bold text-[#f59e0b]">Campaign #2</span>
                <span className="text-white font-semibold">techcrunch.com</span>
                <span className="text-[#9499a8]">#sponsored</span>
              </div>
              <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Active Escrow</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#cfd3dc] leading-relaxed">
              Video review demonstrating multi-validator web scraping without centralized oracles. Escrow locked for assigned creator address.
            </p>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-1.5 text-[#9499a8]">
                <Coins className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>Studionet Deposit</span>
              </div>
              <span className="font-bold text-white text-sm">0.2500 GEN</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
