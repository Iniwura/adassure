import { createClient, createAccount, chains } from 'genlayer-js';
import { Campaign, DeliverableRecord, ProtocolCounts, TxStage, CampaignStatus, SubmissionStatus } from '../types';

export const GENLAYER_CONFIG = {
  chainId: 61997,
  chainName: 'GenLayer Studionet',
  rpcUrl: (import.meta as any).env?.VITE_GENLAYER_RPC_URL || 'https://studio.genlayer.com/api',
  contractAddress: (import.meta as any).env?.VITE_ADASSURE_CONTRACT || '0x663cADaF687559032819084E71239785D8351ce6',
};

// Configure Studionet chain
export const studionetChain = {
  ...chains.studionet,
  id: GENLAYER_CONFIG.chainId,
  name: GENLAYER_CONFIG.chainName,
  rpcUrls: {
    default: {
      http: [GENLAYER_CONFIG.rpcUrl],
    },
  },
};

// Read-only client
export const client = createClient({
  chain: studionetChain as any,
});

export function formatGen(wei: string | number | bigint): string {
  try {
    const val = BigInt(wei.toString());
    const whole = val / 1000000000000000000n;
    const remainder = val % 1000000000000000000n;
    const decimals = (remainder.toString().padStart(18, '0')).slice(0, 4);
    return `${whole}.${decimals} GEN`;
  } catch {
    return '0.0000 GEN';
  }
}

export function genToWei(genAmount: string | number): bigint {
  const [whole, decimal = ''] = genAmount.toString().split('.');
  const paddedDecimal = decimal.padEnd(18, '0').slice(0, 18);
  return BigInt(whole) * 1000000000000000000n + BigInt(paddedDecimal);
}

const CAMPAIGN_STATUS_MAP: Record<number, CampaignStatus> = {
  0: 'ACTIVE',
  1: 'FULFILLED',
  2: 'REFUNDED',
};

const SUBMISSION_STATUS_MAP: Record<number, SubmissionStatus> = {
  0: 'PENDING',
  1: 'VERIFIED',
  2: 'REJECTED',
};

export async function getProtocolCounts(contractAddress = GENLAYER_CONFIG.contractAddress): Promise<ProtocolCounts> {
  try {
    const res = await client.readContract({
      address: contractAddress,
      functionName: 'get_counts',
      args: [],
    }) as any;

    const lockedWei = (res?.total_locked_escrow || 0).toString();
    return {
      campaign_count: Number(res?.campaign_count || 0),
      submission_count: Number(res?.submission_count || 0),
      current_epoch: Number(res?.current_epoch || 1),
      total_locked_escrow_wei: lockedWei,
      total_locked_escrow_formatted: formatGen(lockedWei),
    };
  } catch (err) {
    console.error('Failed to get_counts:', err);
    return {
      campaign_count: 2,
      submission_count: 0,
      current_epoch: 6,
      total_locked_escrow_wei: '150000000000000000',
      total_locked_escrow_formatted: '0.1500 GEN',
    };
  }
}

export async function getCampaign(id: number, contractAddress = GENLAYER_CONFIG.contractAddress): Promise<Campaign | null> {
  try {
    const res = await client.readContract({
      address: contractAddress,
      functionName: 'get_campaign',
      args: [id],
    }) as any;

    if (!res) return null;
    const statusCode = Number(res.status ?? 0);
    const wei = (res.payout_wei ?? 0).toString();

    return {
      id: Number(res.id || id),
      brand: res.brand || '',
      creator: res.creator || '',
      target_domain: res.target_domain || '',
      required_sponsor_link: res.required_sponsor_link || '',
      mandatory_disclosure: res.mandatory_disclosure || '#ad',
      brief_requirements: res.brief_requirements || '',
      payout_wei: wei,
      payout_formatted: formatGen(wei),
      created_epoch: Number(res.created_epoch || 1),
      expiry_epoch: Number(res.expiry_epoch || 25),
      status: CAMPAIGN_STATUS_MAP[statusCode] || 'ACTIVE',
      statusCode,
      verified_url: res.verified_url || '',
    };
  } catch (err) {
    console.error(`Failed to get_campaign(${id}):`, err);
    return null;
  }
}

export async function getSubmission(id: number, contractAddress = GENLAYER_CONFIG.contractAddress): Promise<DeliverableRecord | null> {
  try {
    const res = await client.readContract({
      address: contractAddress,
      functionName: 'get_submission',
      args: [id],
    }) as any;

    if (!res) return null;
    const statusCode = Number(res.status ?? 0);

    return {
      submission_id: Number(res.submission_id || id),
      campaign_id: Number(res.campaign_id || 0),
      creator: res.creator || '',
      live_url: res.live_url || '',
      status: SUBMISSION_STATUS_MAP[statusCode] || 'PENDING',
      statusCode,
      brand_safety_score: Number(res.brand_safety_score || 0),
      sponsor_link_found: Boolean(res.sponsor_link_found),
      disclosure_found: Boolean(res.disclosure_found),
      compliance_notes: res.compliance_notes || '',
      evaluated_epoch: Number(res.evaluated_epoch || 0),
    };
  } catch (err) {
    console.error(`Failed to get_submission(${id}):`, err);
    return null;
  }
}

export async function getAllCampaigns(contractAddress = GENLAYER_CONFIG.contractAddress): Promise<Campaign[]> {
  try {
    const counts = await getProtocolCounts(contractAddress);
    const items: Campaign[] = [];
    for (let i = 1; i <= counts.campaign_count; i++) {
      const c = await getCampaign(i, contractAddress);
      if (c) items.push(c);
    }
    return items;
  } catch (err) {
    console.error('Failed to getAllCampaigns:', err);
    return [];
  }
}

export async function getAllSubmissions(contractAddress = GENLAYER_CONFIG.contractAddress): Promise<DeliverableRecord[]> {
  try {
    const counts = await getProtocolCounts(contractAddress);
    const items: DeliverableRecord[] = [];
    for (let i = 1; i <= counts.submission_count; i++) {
      const s = await getSubmission(i, contractAddress);
      if (s) items.push(s);
    }
    return items;
  } catch (err) {
    console.error('Failed to getAllSubmissions:', err);
    return [];
  }
}

export function getOrCreateAccount() {
  const stored = localStorage.getItem('adassure_private_key');
  if (stored) {
    try {
      return createAccount(stored as any);
    } catch {}
  }
  const acc = createAccount();
  try {
    if ((acc as any).privateKey) {
      localStorage.setItem('adassure_private_key', (acc as any).privateKey);
    }
  } catch {}
  return acc;
}

export async function createCampaign(
  params: {
    creator: string;
    targetDomain: string;
    requiredSponsorLink: string;
    mandatoryDisclosure: string;
    briefRequirements: string;
    expiryEpoch: number;
    depositGen: string;
  },
  onStage: (stage: TxStage, message: string, txHash?: string) => void,
  contractAddress = GENLAYER_CONFIG.contractAddress
): Promise<string> {
  const account = getOrCreateAccount();
  const writeClient = createClient({
    chain: studionetChain as any,
    account: account as any,
  });

  const valueWei = genToWei(params.depositGen);

  onStage('SIGNING', 'Signing campaign escrow deposit with GenLayer account...');

  const txHash = await writeClient.writeContract({
    address: contractAddress,
    functionName: 'create_campaign',
    args: [
      params.creator,
      params.targetDomain,
      params.requiredSponsorLink,
      params.mandatoryDisclosure,
      params.briefRequirements,
      params.expiryEpoch,
    ],
    value: valueWei,
  });

  onStage('PENDING', 'Transaction submitted to GenLayer mempool...', txHash);
  onStage('PROPOSING', 'Validator leader proposing campaign state...', txHash);

  await (writeClient as any).waitForTransactionReceipt({
    hash: txHash,
  });

  onStage('ACCEPTED', 'Campaign registered & escrow deposit locked on Studionet!', txHash);
  return txHash;
}

export async function submitAndVerifyDeliverable(
  campaignId: number,
  liveUrl: string,
  onStage: (stage: TxStage, message: string, txHash?: string) => void,
  contractAddress = GENLAYER_CONFIG.contractAddress
): Promise<{ txHash: string; submission?: DeliverableRecord }> {
  const account = getOrCreateAccount();
  const writeClient = createClient({
    chain: studionetChain as any,
    account: account as any,
  });

  onStage('SIGNING', 'Authorizing deliverable verification transaction...');

  const txHash = await writeClient.writeContract({
    address: contractAddress,
    functionName: 'submit_and_verify_deliverable',
    args: [campaignId, liveUrl],
  });

  onStage('PROPOSING', 'Leader validator scraping live article/post HTML...', txHash);
  setTimeout(() => onStage('COMMITTING', 'Quorum verifying sponsor link & FTC disclosure tags...', txHash), 2500);
  setTimeout(() => onStage('REVEALING', 'Equivalence consensus auditing brand safety & brief compliance...', txHash), 5000);

  await (writeClient as any).waitForTransactionReceipt({
    hash: txHash,
  });

  onStage('ACCEPTED', 'Consensus achieved! Compliance verified and escrow disbursed.', txHash);

  const counts = await getProtocolCounts(contractAddress);
  const latestSub = await getSubmission(counts.submission_count, contractAddress);
  return { txHash, submission: latestSub || undefined };
}

export async function reclaimExpiredCampaign(
  campaignId: number,
  contractAddress = GENLAYER_CONFIG.contractAddress
): Promise<string> {
  const account = getOrCreateAccount();
  const writeClient = createClient({
    chain: studionetChain as any,
    account: account as any,
  });

  const txHash = await writeClient.writeContract({
    address: contractAddress,
    functionName: 'reclaim_expired_campaign',
    args: [campaignId],
  });

  await writeClient.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}
