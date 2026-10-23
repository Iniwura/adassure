import React from 'react';
import { Hero } from '../components/Hero';
import { InsertionOrderPipeline } from '../components/InsertionOrderPipeline';
import { DealLedger } from '../components/DealLedger';
import { Footer } from '../components/Footer';
import { Campaign, ProtocolCounts } from '../types';

interface HomeProps {
  counts: ProtocolCounts;
  campaigns: Campaign[];
}

export function Home({ counts, campaigns }: HomeProps) {
  return (
    <div className="bg-[#0a0d14] text-[#f4f6fa] min-h-screen selection:bg-[#d4a359]/30 selection:text-white">
      {/* 1. Asymmetric Split Studio Diptych Hero */}
      <Hero
        totalLockedFormatted={counts.total_locked_escrow_formatted}
        campaignCount={counts.campaign_count}
      />

      {/* 2. 4-Stage Insertion Order Execution Pipeline */}
      <InsertionOrderPipeline />

      {/* 3. Institutional Deal Ledger Table */}
      <DealLedger
        campaigns={campaigns}
      />

      {/* 4. Minimalist Masthead Footer */}
      <Footer />
    </div>
  );
}
