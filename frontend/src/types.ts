export type CampaignStatus = 'ACTIVE' | 'FULFILLED' | 'REFUNDED';

export type SubmissionStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type TxStage = 'IDLE' | 'SIGNING' | 'PENDING' | 'PROPOSING' | 'COMMITTING' | 'REVEALING' | 'ACCEPTED' | 'FAILED';

export interface Campaign {
  id: number;
  brand: string;
  creator: string;
  target_domain: string;
  required_sponsor_link: string;
  mandatory_disclosure: string;
  brief_requirements: string;
  payout_wei: string;
  payout_formatted: string;
  created_epoch: number;
  expiry_epoch: number;
  status: CampaignStatus;
  statusCode: number;
  verified_url: string;
}

export interface DeliverableRecord {
  submission_id: number;
  campaign_id: number;
  creator: string;
  live_url: string;
  status: SubmissionStatus;
  statusCode: number;
  brand_safety_score: number;
  sponsor_link_found: boolean;
  disclosure_found: boolean;
  compliance_notes: string;
  evaluated_epoch: number;
}

export interface ProtocolCounts {
  campaign_count: number;
  submission_count: number;
  current_epoch: number;
  total_locked_escrow_wei: string;
  total_locked_escrow_formatted: string;
}

export interface TxProgress {
  stage: TxStage;
  message: string;
  txHash?: string;
  error?: string;
}
