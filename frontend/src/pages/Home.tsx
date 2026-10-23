import React from 'react';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { CampaignsLedger } from '../components/CampaignsLedger';
import { Footer } from '../components/Footer';
import { Campaign, ProtocolCounts } from '../types';

interface HomeProps {
  counts: ProtocolCounts;
  campaigns: Campaign[];
}

export function Home({ counts, campaigns }: HomeProps) {
  return (
    <div className="bg-[#050608] text-[#f7f8fa] min-h-screen selection:bg-[#f59e0b]/30 selection:text-white">
      {/* 1. Hero with Product Deliverables Preview */}
      <Hero
        totalLockedFormatted={counts.total_locked_escrow_formatted}
        campaignCount={counts.campaign_count}
      />

      {/* 2. 3-Step How It Works */}
      <HowItWorks />

      {/* 3. Live Active Campaign Ledger */}
      <CampaignsLedger
        campaigns={campaigns}
      />

      {/* 4. Minimal Web3 Footer */}
      <Footer />
    </div>
  );
}
