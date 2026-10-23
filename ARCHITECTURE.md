# AdAssure Architecture Specification

## 1. System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ADASSURE ARCHITECTURE                           │
└────────────────────────────────────────────────────────────────────────┘

     Brand Sponsor              Creator               Live Web Publisher
           │                       │                  (Substack / Mirror / etc.)
           │ 1. create_campaign    │                             │
           │    [Locks Escrow]     │                             │
           ▼                       │                             │
  ┌─────────────────────────────────────────────────────────┐    │
  │            GenLayer Intelligent Contract                │    │
  │                 (ad_assure.py)                          │    │
  │                                                         │    │
  │  State:                                                 │    │
  │   - Campaigns TreeMap[u32, Campaign]                    │    │
  │   - Submissions TreeMap[u32, DeliverableRecord]         │    │
  │   - Escrow Balances                                     │    │
  └───────────────────────────────┬─────────────────────────┘    │
                                  │                              │
                                  │ 2. submit_and_verify         │
                                  │    (live_url)                │
                                  ▼                              │
                     ┌──────────────────────────┐                │
                     │  Validator Quorum        │                │
                     │                          │                │
                     │  3. gl.nondet.web.render ├────────────────┘
                     │     (Fetch Webpage HTML) │
                     │                          │
                     │  4. gl.nondet.exec_prompt│
                     │     (FTC Tag, Link, Safe)│
                     │                          │
                     │  5. strict_eq Consensus  │
                     └────────────┬─────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
       Compliant (Link + Tag + Safe)      Non-Compliant / Missing Tag
                  │                               │
        6a. Instant Escrow Payout       6b. Record Rejection
            to Creator Address              Allow Creator Revision
```

## 2. Equivalence Principle Implementation

AdAssure's verification logic must reach strict determinism across diverse validator LLMs evaluating live web pages. The contract enforces strict equivalence on structured compliance indicators:

```python
def evaluate_consensus() -> str:
    raw_html = gl.nondet.web.render(clean_url, mode="text")
    bounded_text = raw_html[:MAX_PAGE_SNIPPET_BYTES]
    
    prompt = f"""..."""
    return gl.nondet.exec_prompt(prompt, response_format="json")

verdict_raw = gl.eq_principle.strict_eq(evaluate_consensus)
verdict = json.loads(verdict_raw)
```

The contract requires all 3 criteria to pass:
1. `sponsor_link_found == True` (verifies required tracking URL)
2. `disclosure_found == True` (verifies `#ad` or `#sponsored` tag)
3. `brand_safety_score >= 70` (ensures brief adherence without defamation)

## 3. Threat Model & Protections

1. **Domain Spoofing:**
   - *Attack:* Creator submits a mock page hosted on a personal or localhost server.
   - *Defense:* Contract strictly validates that `clean_url` contains the pre-agreed `target_domain` (e.g. `substack.com`).
2. **Missing FTC Disclosures:**
   - *Attack:* Creator forgets `#ad` or hides it in white-on-white text.
   - *Defense:* Multi-validator prompt parses DOM and visible text for prominent FTC disclosures.
3. **Net-90 Exploitation:**
   - *Attack:* Brand delays or discounts payment after publication.
   - *Defense:* Escrow is locked in the contract at inception and pays out automatically upon consensus.
4. **Dead Deals:**
   - *Attack:* Creator fails to deliver before deadline.
   - *Defense:* Brand executes `reclaim_expired_campaign(campaign_id)` after `expiry_epoch`.
