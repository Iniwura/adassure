# AdAssure — Autonomous Creator & Digital Sponsorship Escrow Protocol

> **GenLayer Studionet Contract:** `0x663cADaF687559032819084E71239785D8351ce6`  
> **Chain ID:** `61997` (`studionet`)  
> **Deployment Tx:** `0x2c5445611786ca03fcd5f356b744e955b9e3ccacac61706cc563a3b55d09edd3`

---

## 1. Overview & Trust Problem

The \$30B+ creator economy is plagued by payment delays and breach of contract:
- **Creators** face net-60 to net-90 payment terms and arbitrary post-publication fee cuts from brands or agencies.
- **Brands** suffer from missing FTC disclosures (risking regulatory fines), omitted tracking links, or brand safety violations.
- **Middlemen** (talent agencies, escrow services) charge 15%–30% in fees and take weeks to manually audit posts.

**The GenLayer Solution:**
AdAssure replaces slow, expensive agencies with an autonomous Intelligent Contract:
1. **Brand Locks Escrow:** Specifies the authorized creator, target publishing domain (e.g., `substack.com`, `mirror.xyz`, `youtube.com`), required sponsor tracking link, mandatory disclosure tag (e.g., `#ad`), and content guidelines.
2. **Creator Publishes & Submits:** Submits live published content URL directly to the contract.
3. **Multi-Validator Consensus Audit:** GenLayer validators fetch live webpage DOM and text via `gl.nondet.web.render()`, execute consensus inspection on link presence, FTC tags, and brand safety via `gl.eq_principle.strict_eq()`.
4. **Instant Payout:** Funds release to the creator immediately upon verified consensus—no net-90 delays, no middleman fees.

---

## 2. Repository Layout

```
adassure/
├── contracts/
│   └── ad_assure.py         # Complete GenLayer Intelligent Contract
├── tests/
│   ├── conftest.py          # GenVM in-memory simulation test harness
│   └── test_ad_assure.py    # 100% passing pytest suite (6/6 tests)
├── scripts/
│   └── deploy.py            # Live Studionet deployment & testing script
├── frontend/                # Production Vite + React + Tailwind + TypeScript UI
│   ├── src/
│   │   ├── services/
│   │   │   └── genlayer.ts  # Full genlayer-js integration & lifecycle tracking
│   │   ├── types.ts
│   │   ├── App.tsx          # Editorial publication dashboard
│   │   └── main.tsx
│   └── package.json
├── deployment.json          # Live contract address and deployment receipt
├── ARCHITECTURE.md          # Threat model, consensus equivalence, and compliance rules
├── SUBMISSION.md            # Formal GenLayer submission notes
└── README.md
```

---

## 3. Quick Start & Reproduction

### Prerequisites
- Python 3.11+ (with `genlayer_py` and `pytest`)
- Node.js 18+ and npm

### Run Test Suite
```bash
py -3.14 -m pytest tests -v
```
Output:
```
tests/test_ad_assure.py::test_create_campaign_success PASSED
tests/test_ad_assure.py::test_create_campaign_validation_failures PASSED
tests/test_ad_assure.py::test_submit_and_verify_deliverable_verified PASSED
tests/test_ad_assure.py::test_submit_deliverable_unauthorized_and_domain_mismatch PASSED
tests/test_ad_assure.py::test_submit_deliverable_rejected_noncompliant PASSED
tests/test_ad_assure.py::test_reclaim_expired_campaign PASSED
============================== 6 passed in 0.18s ==============================
```

### Run Frontend Locally
```bash
cd frontend
npm run dev
```
Open `http://localhost:5174` to explore active sponsorship deals, deposit brand escrow, or submit live published content URLs.
