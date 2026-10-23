import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  Campaign,
  DeliverableRecord,
  ProtocolCounts,
  TxStage,
  TxProgress
} from './types';
import {
  getProtocolCounts,
  getAllCampaigns,
  getAllSubmissions,
  createCampaign,
  submitAndVerifyDeliverable,
  reclaimExpiredCampaign
} from './services/genlayer';
import { WalletProvider } from './context/WalletContext';
import { WalletModal } from './components/WalletModal';
import { Header } from './components/Header';
import { TransactionBanner } from './components/Modals';

// Multi-Route Pages (3-Tab Workflow)
import { Home } from './pages/Home';
import { CampaignRegistry } from './pages/CampaignRegistry';
import { CampaignDossier } from './pages/CampaignDossier';
import { CreateCampaignWizard } from './pages/CreateCampaignWizard';

// Fallback sample campaigns for initial preview
const SAMPLE_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    brand: '0x71C849D9455B1917Cbb2b3FE26C2e595304C204B',
    creator: '0x63C15b5921B4b2215e23cf77a8CFCF3a0D62F33d',
    target_domain: 'wired.com',
    required_sponsor_link: 'https://genlayer.io/builder-grants',
    mandatory_disclosure: '#ad',
    brief_requirements:
      'Produce an in-depth technical walkthrough of GenLayer Intelligent Contracts, covering the Equivalence Principle and web scraping. Must include #ad disclosure and builder grants link in top 3 paragraphs.',
    payout_wei: '150000000000000000',
    payout_formatted: '0.1500 GEN',
    created_epoch: 1,
    expiry_epoch: 30,
    status: 'ACTIVE',
    statusCode: 0,
    verified_url: ''
  },
  {
    id: 2,
    brand: '0x99A31b2859942a17D94e1e86A46cf01844E20B34',
    creator: '0x43bFaB1209eE49e1e86A46cf01844E20B345678',
    target_domain: 'techcrunch.com',
    required_sponsor_link: 'https://genlayer.io/demo',
    mandatory_disclosure: '#sponsored',
    brief_requirements:
      '60-second video demo showing how GenLayer validators scrape live websites without centralized oracles. Include link in top 3 lines of video description.',
    payout_wei: '250000000000000000',
    payout_formatted: '0.2500 GEN',
    created_epoch: 2,
    expiry_epoch: 35,
    status: 'ACTIVE',
    statusCode: 0,
    verified_url: ''
  },
  {
    id: 3,
    brand: '0x10b981AA7210eE49e1e86A46cf01844E20B11223',
    creator: '0x63C15b5921B4b2215e23cf77a8CFCF3a0D62F33d',
    target_domain: 'decrypt.co',
    required_sponsor_link: 'https://genlayer.io',
    mandatory_disclosure: '#ad',
    brief_requirements:
      'Essay on the transition from static EVM smart contracts to non-deterministic AI consensus. Verified backlink and disclosure required.',
    payout_wei: '120000000000000000',
    payout_formatted: '0.1200 GEN',
    created_epoch: 1,
    expiry_epoch: 20,
    status: 'FULFILLED',
    statusCode: 1,
    verified_url: 'https://decrypt.co/crypto/zero-trust-impression-oracle-explained'
  }
];

export default function App() {
  const [counts, setCounts] = useState<ProtocolCounts>({
    campaign_count: 2,
    submission_count: 1,
    current_epoch: 6,
    total_locked_escrow_wei: '400000000000000000',
    total_locked_escrow_formatted: '0.4000 GEN'
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>(SAMPLE_CAMPAIGNS);
  const [submissions, setSubmissions] = useState<DeliverableRecord[]>([]);
  const [txProgress, setTxProgress] = useState<TxProgress>({
    stage: 'IDLE',
    message: ''
  });

  useEffect(() => {
    refreshData();
  }, []);

  async function refreshData() {
    try {
      const c = await getProtocolCounts();
      if (c && c.campaign_count > 0) {
        setCounts(c);
      }
      const cList = await getAllCampaigns();
      if (cList && cList.length > 0) {
        setCampaigns(cList);
      } else {
        setCampaigns(SAMPLE_CAMPAIGNS);
      }

      const sList = await getAllSubmissions();
      setSubmissions(sList);
    } catch (e) {
      console.error('Failed to refresh AdAssure data:', e);
    }
  }

  async function handleCreateCampaign(params: {
    creator: string;
    targetDomain: string;
    requiredSponsorLink: string;
    mandatoryDisclosure: string;
    briefRequirements: string;
    expiryEpoch: number;
    depositGen: string;
  }) {
    try {
      setTxProgress({ stage: 'SIGNING', message: 'Broadcasting campaign escrow to GenLayer Studionet...' });
      await createCampaign(
        {
          creator: params.creator,
          targetDomain: params.targetDomain,
          requiredSponsorLink: params.requiredSponsorLink,
          mandatoryDisclosure: params.mandatoryDisclosure,
          briefRequirements: params.briefRequirements,
          expiryEpoch: params.expiryEpoch,
          depositGen: params.depositGen
        },
        (stage: TxStage, message: string, hash?: string) => {
          setTxProgress({ stage, message, txHash: hash });
        }
      );
      await refreshData();
    } catch (err: any) {
      setTxProgress({
        stage: 'FAILED',
        message: 'Campaign creation failed',
        error: err.message || String(err)
      });
      throw err;
    }
  }

  async function handleSubmitDeliverable(campaignId: number, liveUrl: string) {
    try {
      setTxProgress({
        stage: 'SIGNING',
        message: 'Broadcasting deliverable for multi-validator web scraping...'
      });

      await submitAndVerifyDeliverable(
        campaignId,
        liveUrl,
        (stage: TxStage, message: string, hash?: string) => {
          setTxProgress({ stage, message, txHash: hash });
        }
      );

      await refreshData();
    } catch (err: any) {
      setTxProgress({
        stage: 'FAILED',
        message: 'Deliverable verification failed',
        error: err.message || String(err)
      });
      throw err;
    }
  }

  async function handleReclaim(campaignId: number) {
    try {
      setTxProgress({ stage: 'PENDING', message: `Reclaiming expired campaign #${campaignId}...` });
      await reclaimExpiredCampaign(campaignId);
      await refreshData();
      setTxProgress({ stage: 'ACCEPTED', message: `Campaign #${campaignId} escrow refunded to brand!` });
    } catch (err: any) {
      setTxProgress({ stage: 'FAILED', message: 'Reclaim failed', error: err.message });
    }
  }

  return (
    <WalletProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#050608] text-[#f7f8fa] flex flex-col font-sans">
          <div className="film-grain" aria-hidden="true" />

          {/* Master 3-Tab Header */}
          <Header />

          {/* Live Wallet Connection Modal */}
          <WalletModal />

          {/* Global Transaction Status Banner */}
          <TransactionBanner
            progress={txProgress as any}
            txProgress={txProgress}
            onDismiss={() => setTxProgress({ stage: 'IDLE', message: '' })}
          />

          {/* 3 Main Workflow Routes */}
          <main className="flex-1 flex flex-col">
            <Routes>
              {/* Tab 1: Overview */}
              <Route
                path="/"
                element={
                  <Home
                    counts={counts}
                    campaigns={campaigns}
                  />
                }
              />

              {/* Tab 2: Campaigns Registry */}
              <Route
                path="/campaigns"
                element={
                  <CampaignRegistry
                    campaigns={campaigns}
                    currentEpoch={counts.current_epoch}
                    onReclaimCampaign={handleReclaim}
                  />
                }
              />

              {/* Detailed Campaign Dossier */}
              <Route
                path="/campaigns/:id"
                element={
                  <CampaignDossier
                    campaigns={campaigns}
                    submissions={submissions}
                    currentEpoch={counts.current_epoch}
                    onSubmitDeliverable={handleSubmitDeliverable}
                    onReclaimCampaign={handleReclaim}
                    txProgress={txProgress}
                  />
                }
              />

              {/* Tab 3: Create Campaign */}
              <Route
                path="/campaigns/new"
                element={
                  <CreateCampaignWizard
                    currentEpoch={counts.current_epoch}
                    onCreateCampaign={handleCreateCampaign}
                  />
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </WalletProvider>
  );
}
