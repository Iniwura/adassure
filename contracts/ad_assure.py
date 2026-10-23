# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from enum import IntEnum
from dataclasses import dataclass
import json

from genlayer import *


# ─────────────────────────────────────────────────────────────
# Constants & Guardrails
# ─────────────────────────────────────────────────────────────

MAX_BRIEF_LEN = 2048
MAX_PAGE_SNIPPET_BYTES = 12000
MIN_SAFETY_SCORE_THRESHOLD = 70


if "UserError" not in globals():
    class UserError(Exception):
        """User-revert exception for contract validation errors."""
        pass


def to_address(val) -> Address:
    if isinstance(val, Address):
        return val
    return Address(str(val))


class CampaignStatus(IntEnum):
    ACTIVE = 0
    FULFILLED = 1
    REFUNDED = 2


class SubmissionStatus(IntEnum):
    PENDING = 0
    VERIFIED = 1
    REJECTED = 2


@allow_storage
@dataclass
class Campaign:
    id: u32
    brand: Address
    creator: Address
    target_domain: str           # e.g., "substack.com", "mirror.xyz", "youtube.com"
    required_sponsor_link: str   # e.g., "https://brand.com/special-offer"
    mandatory_disclosure: str    # e.g., "#ad", "#sponsored"
    brief_requirements: str      # Content guidelines & brand safety specs
    payout_wei: u256             # Locked escrow deposit
    created_epoch: u64
    expiry_epoch: u64
    status: u32                  # CampaignStatus
    verified_url: str


@allow_storage
@dataclass
class DeliverableRecord:
    submission_id: u32
    campaign_id: u32
    creator: Address
    live_url: str
    status: u32                  # SubmissionStatus
    brand_safety_score: u32      # 0 - 100
    sponsor_link_found: bool
    disclosure_found: bool
    compliance_notes: str
    evaluated_epoch: u64


# ─────────────────────────────────────────────────────────────
# Contract: AdAssure
# ─────────────────────────────────────────────────────────────

class AdAssure(gl.Contract):
    """
    AdAssure: Autonomous Creator & Digital Sponsorship Escrow Protocol.
    
    Eliminates trust friction in influencer and content partnerships.
    Brands lock funds for agreed deliverables. GenLayer validators inspect live
    web pages in consensus to verify sponsor links, FTC disclosures, and brand safety,
    releasing payments without intermediaries or net-90 delays.
    """

    campaigns: TreeMap[u32, Campaign]
    submissions: TreeMap[u32, DeliverableRecord]
    
    campaign_count: u32
    submission_count: u32
    current_epoch: u64
    total_locked_escrow: u256

    def __init__(self):
        self.campaign_count = u32(0)
        self.submission_count = u32(0)
        self.current_epoch = u64(1)
        self.total_locked_escrow = u256(0)

    # ─────────────────────────────────────────────────────────
    # Public State-Changing Methods
    # ─────────────────────────────────────────────────────────

    @gl.public.write.payable
    def create_campaign(
        self,
        creator: str,
        target_domain: str,
        required_sponsor_link: str,
        mandatory_disclosure: str,
        brief_requirements: str,
        expiry_epoch: int
    ) -> u32:
        """
        Brand locks escrow for a designated creator with strict compliance terms.
        """
        brand = to_address(gl.message.sender_address)
        creator_addr = to_address(creator)
        deposit = u256(gl.message.value)

        if deposit <= 0:
            raise UserError("Escrow payout must be greater than zero")

        clean_domain = target_domain.strip().lower()
        if not clean_domain or "." not in clean_domain:
            raise UserError("target_domain must be a valid domain (e.g. 'substack.com')")

        clean_link = required_sponsor_link.strip()
        if not clean_link.startswith("http://") and not clean_link.startswith("https://"):
            raise UserError("required_sponsor_link must be a valid HTTP/HTTPS URL")

        clean_disc = mandatory_disclosure.strip()
        if not clean_disc:
            raise UserError("mandatory_disclosure cannot be empty")

        if len(brief_requirements.strip()) == 0:
            raise UserError("Brief requirements cannot be empty")

        if len(brief_requirements) > MAX_BRIEF_LEN:
            raise UserError(f"Brief exceeds maximum length of {MAX_BRIEF_LEN}")

        if int(expiry_epoch) <= int(self.current_epoch):
            raise UserError("Expiry epoch must be in the future")

        c_id = u32(int(self.campaign_count) + 1)
        self.campaign_count = c_id

        campaign = Campaign(
            id=c_id,
            brand=brand,
            creator=creator_addr,
            target_domain=clean_domain,
            required_sponsor_link=clean_link,
            mandatory_disclosure=clean_disc,
            brief_requirements=str(brief_requirements).strip(),
            payout_wei=deposit,
            created_epoch=self.current_epoch,
            expiry_epoch=u64(int(expiry_epoch)),
            status=u32(CampaignStatus.ACTIVE),
            verified_url="",
        )
        self.campaigns[c_id] = campaign
        self.total_locked_escrow = u256(int(self.total_locked_escrow) + int(deposit))

        return c_id

    @gl.public.write
    def submit_and_verify_deliverable(
        self,
        campaign_id: int,
        live_url: str
    ) -> u32:
        """
        Creator submits live published content URL for autonomous validator verification.
        """
        caller = to_address(gl.message.sender_address)
        cid = u32(int(campaign_id))

        if cid not in self.campaigns:
            raise UserError(f"Campaign {campaign_id} does not exist")

        campaign = self.campaigns[cid]
        if campaign.status != u32(CampaignStatus.ACTIVE):
            raise UserError("Campaign is not active")

        if campaign.creator != caller:
            raise UserError("Only the designated creator can submit deliverables for this campaign")

        if int(self.current_epoch) > int(campaign.expiry_epoch):
            raise UserError("Campaign deadline has expired")

        clean_url = live_url.strip()
        if campaign.target_domain not in clean_url:
            raise UserError(f"Submitted URL does not belong to authorized domain: {campaign.target_domain}")

        # ── Non-Deterministic Verification Block via Strict Equivalence ──
        def evaluate_consensus() -> str:
            raw_html = gl.nondet.web.render(clean_url, mode="text")
            bounded_text = raw_html[:MAX_PAGE_SNIPPET_BYTES]

            prompt = f"""
You are an autonomous compliance and brand safety auditor for digital sponsorship contracts.

AGREED CAMPAIGN REQUIREMENTS:
Target Domain: {campaign.target_domain}
Required Sponsor Link: {campaign.required_sponsor_link}
Mandatory Disclosure: {campaign.mandatory_disclosure}
Brief & Brand Safety Guidelines:
\"\"\"
{campaign.brief_requirements}
\"\"\"

LIVE PUBLISHED PAGE TEXT / EXTRACT:
\"\"\"
{bounded_text}
\"\"\"

VERIFICATION RULES:
1. sponsor_link_found: true if the required sponsor link (or primary domain reference) is present in the page text/links.
2. disclosure_found: true if the mandatory disclosure (e.g. {campaign.mandatory_disclosure}) is prominently displayed.
3. brand_safety_score: 0-100 score assessing compliance with the brief and lack of defamatory/toxic content.
4. overall_passed: true ONLY IF both link and disclosure are found AND brand_safety_score >= 70.

OUTPUT FORMAT:
Respond with ONLY a valid JSON object matching this exact schema:
{{
  "sponsor_link_found": true,
  "disclosure_found": true,
  "brand_safety_score": 90,
  "overall_passed": true,
  "compliance_notes": "Sponsor link and #ad disclosure found; content satisfies all brand safety guidelines."
}}
"""
            return gl.nondet.exec_prompt(prompt, response_format="json")

        s_id = u32(int(self.submission_count) + 1)
        self.submission_count = s_id

        try:
            verdict_raw = gl.eq_principle.strict_eq(evaluate_consensus)
            verdict = json.loads(verdict_raw) if isinstance(verdict_raw, str) else verdict_raw
        except Exception as e:
            sub = DeliverableRecord(
                submission_id=s_id,
                campaign_id=cid,
                creator=caller,
                live_url=clean_url,
                status=u32(SubmissionStatus.REJECTED),
                brand_safety_score=u32(0),
                sponsor_link_found=False,
                disclosure_found=False,
                compliance_notes=f"Consensus evaluation failure: {str(e)}",
                evaluated_epoch=self.current_epoch,
            )
            self.submissions[s_id] = sub
            return s_id

        link_ok = bool(verdict.get("sponsor_link_found", False))
        disc_ok = bool(verdict.get("disclosure_found", False))
        score = int(verdict.get("brand_safety_score", 0))
        passed = bool(verdict.get("overall_passed", False))
        notes = str(verdict.get("compliance_notes", "No notes"))

        if passed and link_ok and disc_ok and score >= MIN_SAFETY_SCORE_THRESHOLD:
            # ── VERIFIED: Release payment to creator ──
            sub = DeliverableRecord(
                submission_id=s_id,
                campaign_id=cid,
                creator=caller,
                live_url=clean_url,
                status=u32(SubmissionStatus.VERIFIED),
                brand_safety_score=u32(score),
                sponsor_link_found=link_ok,
                disclosure_found=disc_ok,
                compliance_notes=notes,
                evaluated_epoch=self.current_epoch,
            )
            self.submissions[s_id] = sub

            payout = int(campaign.payout_wei)
            campaign.status = u32(CampaignStatus.FULFILLED)
            campaign.verified_url = clean_url
            self.campaigns[cid] = campaign

            self.total_locked_escrow = u256(max(0, int(self.total_locked_escrow) - payout))
            gl.transfer(campaign.creator, payout)

        else:
            # ── REJECTED: Creator can update post and re-submit ──
            sub = DeliverableRecord(
                submission_id=s_id,
                campaign_id=cid,
                creator=caller,
                live_url=clean_url,
                status=u32(SubmissionStatus.REJECTED),
                brand_safety_score=u32(score),
                sponsor_link_found=link_ok,
                disclosure_found=disc_ok,
                compliance_notes=notes,
                evaluated_epoch=self.current_epoch,
            )
            self.submissions[s_id] = sub

        return s_id

    @gl.public.write
    def reclaim_expired_campaign(self, campaign_id: int):
        """
        Brand reclaims escrow funds if the deadline passed without verified deliverable.
        """
        sender = to_address(gl.message.sender_address)
        cid = u32(int(campaign_id))

        if cid not in self.campaigns:
            raise UserError("Campaign does not exist")

        campaign = self.campaigns[cid]
        if campaign.brand != sender:
            raise UserError("Only the campaign brand sponsor can reclaim funds")

        if campaign.status != u32(CampaignStatus.ACTIVE):
            raise UserError("Campaign is not in ACTIVE status")

        if int(self.current_epoch) <= int(campaign.expiry_epoch):
            raise UserError("Cannot reclaim funds before expiry epoch has elapsed")

        payout = int(campaign.payout_wei)
        campaign.status = u32(CampaignStatus.REFUNDED)
        self.campaigns[cid] = campaign

        self.total_locked_escrow = u256(max(0, int(self.total_locked_escrow) - payout))
        gl.transfer(campaign.brand, payout)

    @gl.public.write
    def advance_epoch(self, delta: int = 1):
        """Advances protocol epoch for testing and deadline tracking."""
        if delta <= 0:
            raise UserError("Delta must be positive")
        self.current_epoch = u64(int(self.current_epoch) + int(delta))

    # ─────────────────────────────────────────────────────────
    # Public View Methods
    # ─────────────────────────────────────────────────────────

    @gl.public.view
    def get_campaign(self, campaign_id: int) -> dict:
        cid = u32(int(campaign_id))
        if cid not in self.campaigns:
            raise UserError(f"Campaign {campaign_id} does not exist")
        c = self.campaigns[cid]
        return {
            "id": int(c.id),
            "brand": str(c.brand),
            "creator": str(c.creator),
            "target_domain": c.target_domain,
            "required_sponsor_link": c.required_sponsor_link,
            "mandatory_disclosure": c.mandatory_disclosure,
            "brief_requirements": c.brief_requirements,
            "payout_wei": int(c.payout_wei),
            "created_epoch": int(c.created_epoch),
            "expiry_epoch": int(c.expiry_epoch),
            "status": int(c.status),
            "verified_url": c.verified_url,
        }

    @gl.public.view
    def get_submission(self, submission_id: int) -> dict:
        sid = u32(int(submission_id))
        if sid not in self.submissions:
            raise UserError(f"Submission {submission_id} does not exist")
        s = self.submissions[sid]
        return {
            "submission_id": int(s.submission_id),
            "campaign_id": int(s.campaign_id),
            "creator": str(s.creator),
            "live_url": s.live_url,
            "status": int(s.status),
            "brand_safety_score": int(s.brand_safety_score),
            "sponsor_link_found": s.sponsor_link_found,
            "disclosure_found": s.disclosure_found,
            "compliance_notes": s.compliance_notes,
            "evaluated_epoch": int(s.evaluated_epoch),
        }

    @gl.public.view
    def get_counts(self) -> dict:
        return {
            "campaign_count": int(self.campaign_count),
            "submission_count": int(self.submission_count),
            "current_epoch": int(self.current_epoch),
            "total_locked_escrow": int(self.total_locked_escrow),
        }
