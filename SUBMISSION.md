# GenLayer Project Submission 2: AdAssure

## Project Information
- **Project Name:** AdAssure
- **Tagline:** Autonomous Creator & Digital Sponsorship Escrow Protocol on GenLayer
- **Category:** Creator Economy / Web2.5 Consumer Infrastructure
- **Live Deployed Contract (Studionet):** `0x663cADaF687559032819084E71239785D8351ce6`
- **Chain ID:** `61997` (`studionet`)
- **Deployment Transaction:** `0x2c5445611786ca03fcd5f356b744e955b9e3ccacac61706cc563a3b55d09edd3`

---

## 1. Problem Statement & Trust Dilemma
The global creator sponsorship economy exceeds \$30 billion, yet relies on manual, adversarial processes:
- Brands struggle with non-compliant creators who omit mandatory FTC `#ad` disclaimers or forget trackable referral links.
- Creators are subjected to punitive net-60 / net-90 payment cycles, high escrow agency fees (15%–30%), and ghosting.
- Standard EVM contracts cannot browse the internet to verify that an article or video description is actually live and compliant.

## 2. The GenLayer Solution
AdAssure automates sponsorship agreements end-to-end:
1. **Brand Locks Escrow:** Calls `create_campaign` specifying creator address, domain whitelist, required link, mandatory disclosure tag, and guidelines.
2. **Creator Submits Published Link:** Creator calls `submit_and_verify_deliverable` with their live post URL (e.g., Substack, Medium, Mirror).
3. **Validator Consensus:** GenLayer validators independently fetch the webpage via `gl.nondet.web.render()`, execute consensus prompts verifying the link, FTC hashtag, and brand safety score via `gl.eq_principle.strict_eq()`.
4. **Immediate Settlement:** Payout is released on-chain directly to the creator without manual brand approval or agency fees.

## 3. Quality Bar Checklist
- [x] **Solves a Real Trust Problem:** Eliminates influencer payment friction and brand compliance risks.
- [x] **Uses Live/Authoritative Data:** Scrapes live published articles and post HTML directly on-chain.
- [x] **Real Intelligent Contract:** Full Python contract utilizing `gl.Contract`, `TreeMap`, `gl.nondet.web.render`, `gl.nondet.exec_prompt`, and `gl.eq_principle.strict_eq`.
- [x] **Full Frontend Lifecycle:** Tracks mempool submission $\to$ live webpage scraping $\to$ validator equivalence consensus $\to$ creator payout.
- [x] **Credible Path to Continued Use:** Immediately usable for micro-influencer campaigns, newsletter sponsorships, and developer advocate bounties.
