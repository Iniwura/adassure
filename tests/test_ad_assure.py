import pytest
import json
from contracts.ad_assure import AdAssure, CampaignStatus, SubmissionStatus, UserError


def test_create_campaign_success(gl_env):
    contract = AdAssure()
    brand = "0xBrand111111111111111111111111111111111111"
    creator = "0xCreator2222222222222222222222222222222222"
    gl_env.message.sender_address = brand
    gl_env.message.value = 2500000000000000000  # 2.5 GEN

    c_id = contract.create_campaign(
        creator=creator,
        target_domain="substack.com",
        required_sponsor_link="https://acme.ai/summer-sale?ref=creator",
        mandatory_disclosure="#ad",
        brief_requirements="Deep-dive review of Acme AI agent platform with workflow examples.",
        expiry_epoch=15,
    )

    assert c_id == 1
    counts = contract.get_counts()
    assert counts["campaign_count"] == 1
    assert counts["total_locked_escrow"] == 2500000000000000000

    campaign = contract.get_campaign(1)
    assert campaign["brand"] == brand
    assert campaign["creator"] == creator
    assert campaign["target_domain"] == "substack.com"
    assert campaign["mandatory_disclosure"] == "#ad"
    assert campaign["status"] == int(CampaignStatus.ACTIVE)


def test_create_campaign_validation_failures(gl_env):
    contract = AdAssure()
    gl_env.message.sender_address = "0xBrand"
    gl_env.message.value = 0

    # 1. Zero escrow
    with pytest.raises(UserError, match="must be greater than zero"):
        contract.create_campaign("0xCreator", "substack.com", "https://link.com", "#ad", "brief", 10)

    # 2. Invalid domain
    gl_env.message.value = 100
    with pytest.raises(UserError, match="target_domain must be a valid domain"):
        contract.create_campaign("0xCreator", "invalid_domain_no_dot", "https://link.com", "#ad", "brief", 10)

    # 3. Invalid sponsor URL
    with pytest.raises(UserError, match="HTTP/HTTPS URL"):
        contract.create_campaign("0xCreator", "substack.com", "not_a_valid_url", "#ad", "brief", 10)

    # 4. Past expiry
    with pytest.raises(UserError, match="in the future"):
        contract.create_campaign("0xCreator", "substack.com", "https://link.com", "#ad", "brief", 1)


def test_submit_and_verify_deliverable_verified(gl_env):
    contract = AdAssure()
    brand = "0xBrand"
    creator = "0xAliceCreator"
    gl_env.message.sender_address = brand
    gl_env.message.value = 1000000000000000000  # 1 GEN

    contract.create_campaign(
        creator=creator,
        target_domain="substack.com",
        required_sponsor_link="https://acme.ai/partner",
        mandatory_disclosure="#ad",
        brief_requirements="Highlight autonomous smart contracts on GenLayer.",
        expiry_epoch=20,
    )

    # Creator submits live Substack URL
    gl_env.message.sender_address = creator
    gl_env.message.value = 0
    live_url = "https://alice.substack.com/p/future-of-genlayer-contracts"

    gl_env.nondet.web.rendered_pages[live_url] = (
        "Welcome! In this article (#ad), we review https://acme.ai/partner which powers GenLayer contracts."
    )
    gl_env.nondet.prompt_responses["acme.ai"] = json.dumps({
        "sponsor_link_found": True,
        "disclosure_found": True,
        "brand_safety_score": 95,
        "overall_passed": True,
        "compliance_notes": "Sponsor link and #ad disclosure found and prominently displayed."
    })

    sub_id = contract.submit_and_verify_deliverable(1, live_url)
    assert sub_id == 1

    sub = contract.get_submission(1)
    assert sub["status"] == int(SubmissionStatus.VERIFIED)
    assert sub["brand_safety_score"] == 95
    assert sub["sponsor_link_found"] is True
    assert sub["disclosure_found"] is True

    # Check campaign marked FULFILLED and funds paid out
    campaign = contract.get_campaign(1)
    assert campaign["status"] == int(CampaignStatus.FULFILLED)
    assert campaign["verified_url"] == live_url

    counts = contract.get_counts()
    assert counts["total_locked_escrow"] == 0

    assert len(gl_env.transfers) == 1
    assert gl_env.transfers[0] == (creator, 1000000000000000000)


def test_submit_deliverable_unauthorized_and_domain_mismatch(gl_env):
    contract = AdAssure()
    gl_env.message.sender_address = "0xBrand"
    gl_env.message.value = 1000
    contract.create_campaign(
        creator="0xCreatorAlice",
        target_domain="mirror.xyz",
        required_sponsor_link="https://sponsor.xyz",
        mandatory_disclosure="#ad",
        brief_requirements="Testing auth",
        expiry_epoch=10,
    )

    # 1. Unauthorized caller
    gl_env.message.sender_address = "0xUnknownHacker"
    with pytest.raises(UserError, match="Only the designated creator"):
        contract.submit_and_verify_deliverable(1, "https://mirror.xyz/article")

    # 2. Domain mismatch
    gl_env.message.sender_address = "0xCreatorAlice"
    with pytest.raises(UserError, match="does not belong to authorized domain"):
        contract.submit_and_verify_deliverable(1, "https://evil-phishing-site.com/fake-post")


def test_submit_deliverable_rejected_noncompliant(gl_env):
    contract = AdAssure()
    creator = "0xCreatorBob"
    gl_env.message.sender_address = "0xBrand"
    gl_env.message.value = 1000
    contract.create_campaign(
        creator=creator,
        target_domain="substack.com",
        required_sponsor_link="https://sponsor.com/deal",
        mandatory_disclosure="#ad",
        brief_requirements="Must include #ad and link",
        expiry_epoch=10,
    )

    gl_env.message.sender_address = creator
    live_url = "https://bob.substack.com/p/missing-disclosure"

    # Mock response missing disclosure
    gl_env.nondet.default_prompt_response = json.dumps({
        "sponsor_link_found": True,
        "disclosure_found": False,
        "brand_safety_score": 50,
        "overall_passed": False,
        "compliance_notes": "Sponsor link found, but mandatory #ad disclosure is missing."
    })

    sub_id = contract.submit_and_verify_deliverable(1, live_url)
    sub = contract.get_submission(sub_id)

    assert sub["status"] == int(SubmissionStatus.REJECTED)
    assert sub["disclosure_found"] is False

    # Campaign must remain ACTIVE for revisions
    campaign = contract.get_campaign(1)
    assert campaign["status"] == int(CampaignStatus.ACTIVE)
    assert len(gl_env.transfers) == 0


def test_reclaim_expired_campaign(gl_env):
    contract = AdAssure()
    brand = "0xBrandSponsor"
    gl_env.message.sender_address = brand
    gl_env.message.value = 500
    contract.create_campaign("0xCreator", "substack.com", "https://sponsor.com", "#ad", "Brief", 5)

    # Attempt early refund
    with pytest.raises(UserError, match="Cannot reclaim funds before expiry"):
        contract.reclaim_expired_campaign(1)

    # Advance epoch past deadline
    contract.advance_epoch(10)

    # Non-brand cannot reclaim
    gl_env.message.sender_address = "0xRandom"
    with pytest.raises(UserError, match="Only the campaign brand sponsor"):
        contract.reclaim_expired_campaign(1)

    # Brand reclaims successfully
    gl_env.message.sender_address = brand
    contract.reclaim_expired_campaign(1)

    campaign = contract.get_campaign(1)
    assert campaign["status"] == int(CampaignStatus.REFUNDED)
    assert len(gl_env.transfers) == 1
    assert gl_env.transfers[0] == (brand, 500)
