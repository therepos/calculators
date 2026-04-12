# SLA Revenue Collection & Revenue Contracting — Knowledge Base

> **Entity:** Singapore Land Authority (SLA)
> **Nature:** Statutory Board under Ministry of Law
> **Last Updated:** April 2026
> **Source Documents:** SLA Financial Regulations Manual (FRM, updated 31 Jan 2025), Revenue Accounting SOP (V6.0, Nov 2023), Workflow and Approval Structure, IM-FG Section RECV (Receipts), IM-RCP (Revenue Contracting Procedures)

---

## 1. Entity Overview

### 1.1 What SLA Is

SLA is a body corporate established under the Singapore Land Authority Act. It operates in a dual capacity:

- **Own capacity:** SLA transacts using its own funds, governed by the FRM.
- **Agent of Government:** SLA acts as agent for State land sales, acquisition, and management, governed by Government Instruction Manuals (IMs) and Finance Circulars.

The FRM applies to SLA's own operations. Government IMs apply when SLA transacts using government funds or on behalf of government. Both may apply simultaneously depending on the transaction.

### 1.2 Key Divisions Relevant to Revenue

- **Finance & Corporate Services Division (FCSD):** Houses the Finance Department (Revenue team, Treasury & Planning team, Accounts & Admin team). Responsible for revenue accounting, billing, reconciliation, and collections.
- **GeoSpatial & Data Division (GSD):** Manages INLIS, GeoSpace, OneMap. The GeoSpatial Systems & Solutions (GSSS) department manages INLIS operations. The GeoSpatial Policy and Engagement team handles data licensing.
- **Land Titles Registry (LTR):** Operational users of INLIS for property searches and title registration services.

### 1.3 Key Personnel (as at audit period 2025)

| Name | Designation | Role in Revenue Process |
|---|---|---|
| Clark Sim | Principal Manager, Finance | Sole observed approver for all Workday revenue entries, monthly reconciliations, credit notes, and waivers |
| Vivien Ng (Lay Wah) | Assistant Manager, Finance (REV) | Primary PO/REV — creates Workday entries for GIRO, PayNow, CC; creates credit notes for refunds; prepares monthly reconciliation |
| Mui Cheng Goh | Finance Officer (REV) | Secondary PO/REV — creates Workday entries (less frequent) |
| Zainab Djamil | Assistant Manager, Finance (REV) | Creates Workday invoices for Data Licensing; listed as Receiving Officer |
| Kailun Ariel Zhou | Collections Manager, Finance | Approves Data Licensing invoices and some Workday entries |
| Elicia Seah (Yun Jia) | Finance Officer | Bank reconciler (Workday to bank statement) |
| Wen Hui Chong | Finance Officer | Bank reconciler (alternate) |
| Kian Tat | Engagement Manager, GSD | Prepares data licensing quotations; sends billing instructions to Finance |
| Serene Tay | Principal Engagement Manager, GSD | Approves data licensing billing instructions and refund requests |
| Elaine | Engagement Manager, GSD | Verifies INLIS refund logs |
| Sabrina | Manager, Land Titles Registry | Validates refund requests from LTR operations |
| Victor Chua | Deputy Director, GSSS | System-level approvals for INLIS |
| Gavin Chen | Principal Geospatial Manager, GSSS | INLIS operations |
| Terry Tan | Geospatial Manager, GSSS | INLIS operations |

---

## 2. Revenue Streams in Scope

### 2.1 INLIS (Integrated Land Information Service)

INLIS is SLA's online land information portal. It is a **point-of-sale system** — customers pay before receiving the product. There is no accounts receivable for INLIS transactions.

**Product categories and fee basis:**

| Category | Fee Basis | Example |
|---|---|---|
| Property Ownership Information | Gazetted — Land Titles Rules, No. 18(j) | $5.25 per printout |
| Property Title Information (PTI) | Gazetted — Land Titles Rules, No. 18(h)/(i) | $16.00 per printout |
| PTI with Cadastral Map | Gazetted — Land Titles Rules + Boundaries & Survey Maps Rules | $27.55 combined |
| Cadastral Map, Certified Plan, Strata Certified Plan | Gazetted — Boundaries & Survey Maps (Prescribed Fees) Rules | $11.55 each |
| Road Line Plan, Railway Protection Plan | LTA-provided pricing | $54.50 each |
| PUB Plans | HDB-provided pricing | $3.55 |
| Trial Trench Report | Internally approved by DD/GSD (Apr 2023) | $9.00 |
| Baseline Product Purchases | Internally approved | $820 per development |
| Borehole | Free | $0.00 |
| Images of instruments/deeds/leases | Gazetted — Land Titles Rules, No. 17 | $1.00 to $5.20 |

**Key distinction:** Most INLIS fees are **gazetted under legislation** (Land Titles Rules, Boundaries & Survey Maps Rules). This means IM-RCP does NOT apply to these fees (IM-RCP-R2 excludes provisions where price is fixed by law). A few products (Trial Trench Report, Baseline Product, Road Line Plan) are **non-gazetted** and priced via internal approval or external agency agreement.

**Payment channels:**

| Channel | Settlement | Workday Memo Format |
|---|---|---|
| GIRO | T+2 (debit instruction file sent to bank) | INLIS4 GIRO/ddMMMYYYY |
| PayNow | Same-day (real-time via CPS) | INLIS PAYNOW/ddMMMYY |
| Credit Card | T+1 to T+2 (via eNets, settled by DBS Card Center) | INLIS4CREDITCARD/13659 or /13660 |

Credit card collections are split across **two merchant IDs** (700013659 and 700013660) and settled net of merchant discount rate (MDR). Each merchant ID generates a separate bank statement line and a separate Workday entry.

### 2.2 Data Licensing

SLA licenses geospatial data products to commercial customers under annual agreements. Unlike INLIS, this follows a traditional **quotation → agreement → invoice → collection** cycle with accounts receivable.

**Products and pricing (from Master Price List, dated 2011):**

| Product | Yearly Licence Fee | Quarterly Maintenance |
|---|---|---|
| Street Directory Basic | $6,000 | $1,500 |
| Street Directory Classic | $20,000 | $5,000 |
| Street Directory Premium Plus | $58,000 (with POI) / $48,000 (without) | $14,500 / $12,000 |
| Street Directory Premium Lite | $50,000 (with POI) / $40,000 (without) | $12,500 / $10,000 |
| Address Point | $15,000 | $3,750 |
| Cadastral (Digitised) | $15,000 | $3,750 |
| Landbase Road | N/A (perpetual $43,000) | $4,300 |
| Landbase Building | N/A (perpetual $43,000) | $4,300 |
| Caveat Data Base | $4 per record | N/A |

**Loyalty discounts** are applied to the base licence fees based on contract tenure: 10% for 2-year, 15% for 3-year, 20% for 4-year, 25% for 5-year renewals.

**Key issue identified:** The master price list has no documented formal approval or version control. IM-FG-RECV #5–#7 requires statutory boards to review fees at least every three years.

---

## 3. Regulatory and Policy Framework

### 3.1 Hierarchy of Authority

```
Constitution (Protection of Reserves)
    └── Singapore Land Authority Act
        └── Government Instruction Manuals (IMs)
            ├── IM-FG Section RECV (Receipts) [SB Partial Compliance]
            ├── IM-FG Section PYMT (Payments) [SB Partial Compliance]
            └── IM-RCP (Revenue Contracting Procedures) [SB Full Compliance]
                └── SLA Financial Regulations Manual (FRM)
                    └── Revenue Accounting SOP
                        └── Workflow and Approval Structure (INLIS-specific)
```

### 3.2 Which Framework Applies to What

| Revenue Type | FRM | IM-FG RECV | IM-RCP |
|---|---|---|---|
| INLIS gazetted fees (property searches, survey maps) | Yes | Yes (SB partial) | **No** — fees fixed by law (R2 exclusion) |
| INLIS non-gazetted fees (Trial Trench, Baseline) | Yes | Yes (SB partial) | Potentially — depends on whether contractual |
| Data Licensing agreements | Yes | Yes (SB partial) | **Yes** — letting out of goods/services by contractual means |
| Refunds | Yes (FRM 5.14) | Yes | N/A |
| Waivers of LPI | Yes (FRM 4.17, 5.1.2) | Yes (RECV #14, #27) | N/A |

### 3.3 FRM — Key Financial Authority Limits

**Authority to Incur Operating Expenditure / Cancellation of Bills (FRM 5.14, 6.1.2):**

| Approving Authority | Financial Limit |
|---|---|
| Senior Manager | $6,000 |
| Deputy Director | $50,000 |
| Director | $1,000,000 |
| Assistant Chief Executive | $2,000,000 |
| Deputy Chief Executive | $5,000,000 |
| Chief Executive | $10,000,000 |
| Finance and Investment Committee | $20,000,000 |
| Board | > $20,000,000 |

**Refund Processing — Approving Officers (FRM Annex B):**

| Financial Limit | Approving Authority |
|---|---|
| Up to $6,000 | Principal Manager/Senior Manager (via Approving Officer Warrant) |
| Up to $25,000 | Senior Deputy Director/Deputy Director (via Warrant) |
| Up to $100,000 | Director (via Warrant) |
| Up to $1,000,000 | DCE/ACE (Land Ops)/ACE (Regulatory and Corporate) (via Warrant) |
| Above $1,000,000 | Chief Executive (appointed by MinLaw) |

**Fee Approval (FRM 5.1.1):**

| Fee Type | Approving Authority |
|---|---|
| Non-gazetted services based on approved target price ratio | Chief Executive |
| Gazetted services or not based on approved target price ratio | PS (Law) |

**Waiver of Fees (FRM 5.1.2):**

| Waiver Type | Approving Authority |
|---|---|
| Specific cases | Chief Executive |
| Blanket waiver (>50% of payors, >4 months, >$500K total) | PS (Law) |

**Waiver of Revenue / LPI (FRM 4.17):**

| Financial Limit | Approving Authority |
|---|---|
| Up to $1,000 | Director |
| Up to $10,000 | Chief Financial Officer |
| Up to $50,000 | DCE / ACE |
| Up to $100,000 | Chief Executive |
| Above $100,000 | Chairman |

**Contract Signing for Fee Collections (FRM 5.1.5):**

| Financial Limit | Signatory |
|---|---|
| Up to $100,000 | Director |
| Up to $1,000,000 | DCE / ACE |
| Above $1,000,000 | Chief Executive |

**Alternate Approving Authorities (FRM 1.3.6):**

| Approving Authority | Alternate |
|---|---|
| Up to DCE/ACE level | Equivalent or higher level of seniority |
| Chief Executive | DCE or ACE |
| Chairman of Board | Deputy Chairman, or Board Member appointed by Chairman |

### 3.4 IM-FG RECV — Key Rules for Statutory Boards

**Fees and Charges (SB Compliance — paras #5 to #9):**
- Adopt guiding principles: Yellow Pages rule, full cost accounting, keeping costs down, clear policy rationale, user-pays / no cross-subsidy.
- Set fees at prevailing market rate if available; otherwise full cost recovery as default.
- May set above or below cost/market with valid policy reasons.
- Review fees at least once every three years.
- Maintain Target Cost Recovery Ratio (TCRR) or Target Price Ratio (TPR).
- Keep 3-year average ACRR/APR within 90%–110% of TCRR/TPR.

**Waiver of Revenue (SB Compliance — para #14):**
- Waiver = ex-ante decision not to collect full amount.
- Blanket waiver criteria: affects >50% of payors, lasts >4 months, >$500K projected waived.
- Agencies granting waivers bear the resulting revenue loss.

**Collection of Arrears (paras #25–#28):**
- If law prescribes collection procedure, follow that procedure.
- Otherwise, send reminder with 10-day deadline as soon as payment is overdue.
- Consider cost-effectiveness before pursuing legal proceedings or writing off.
- Collector must maintain Control Account per revenue item, reconciled monthly.
- Half-yearly arrears report to Accounting Officer.

**Interest on Arrears (SB Compliance — para #27):**
- Pegged to 3-month compounded SORA + 1.5% spread (rounded down to nearest 0.1%).
- Additional 3% p.a. for administrative overhead.
- MOF computes and circulates biannually.
- Applies to statutory boards' own property lettings too.
- Accounting Officer may waive collection if not cost-effective or not in public interest.

**Methods of Payment (SB Compliance — paras #60–#65):**
- Payment should be via electronic means unless valid reasons not to.
- Agencies may set differential charges for electronic vs non-electronic payment.
- Agencies have discretion to set credit/debit card ceilings.

### 3.5 IM-RCP — Key Rules for Data Licensing

IM-RCP applies to Data Licensing because SLA is selling/licensing geospatial data products by contractual means (IM-RCP-R2).

**Applicability:** IM-RCP does NOT apply to INLIS gazetted fees because the price is fixed by law (IM-RCP-R2 exclusion).

**Key principles (IM-RCP-P1 to P4):**
- Transparency — decisions properly documented.
- Open and fair competition — equitable access.
- Maximising total returns — broader than revenue alone.
- Segregation of duties — requester/recommender must not be the same as approver.

**Management measures (IM-RCP-R10):**
- Allocation and valuation functions performed by separate officers.
- Officers with conflict of interest must declare and disqualify themselves.
- Officers administering allocation should be rotated from time to time.

**Revenue contracting methods for non-property/non-land sales exceeding $90K (IM-RCP-R20):**
- Tenders (open or limited), C&P tenders, auctions, online bidding, direct allocation/waiver of competition.
- Below $90K: Quotations (IM-RCP-R30 to R33).
- Below $6K: Verbal/single-buyer quotes permitted.

**Quotation process (IM-RCP-R30 to R33):**
- Quotes must be in writing.
- QAA (Quotation Approving Authority) cannot be the person inviting, receiving, evaluating, or recommending.
- If fewer than 3 quotes, QAA can approve if satisfied price is reasonable.
- If accepted quote exceeds quotation limit ($90K), consider calling fresh tender.

**Approving authority for revenue contracts (IM-RCP-R130):**

| Authority | Contract Value |
|---|---|
| PS / CEO or delegated officer | Up to $90,000 |
| Tenders Board A | Up to $1,000,000 |
| Tenders Board B | Up to $10,000,000 |
| Tenders Board C | Above $10,000,000 |

**SLA's internal Tender Boards (FRM 7.4):**

| Board | Chair | Members | Limit |
|---|---|---|---|
| Tender Board A | DCE / ACE | CFO + 1 Director | $1,000,000 |
| Tender Board B | CE | CFO + 1 Director | $10,000,000 |
| Tender Board C | Chairman of Board | CE + CFO | Above $10,000,000 |

**SLA's internal QAA panels (FRM 7.2):**

| Panel | Members | Limit |
|---|---|---|
| QAA "A" | DD of requesting dept + Independent DD (or higher) of different dept | $25,000 |
| QAA "B" | Director of requesting dept + Independent DD (or higher) of different dept | $90,000 |

**Direct allocation / waiver of competition (IM-RCP-R120 to R123):**
- Allowed where overriding reasons and public interest exist.
- Price must be determined by Chief Valuer, in-house qualified valuer, or external qualified valuer.
- Approved terms and conditions must still apply.
- Data licensing renewals with existing customers (e.g. Velox, Singtel, CDG ZIG) appear to operate as direct allocations with pricing based on the master price list plus loyalty discounts.

---

## 4. Process Mechanics

### 4.1 INLIS — GIRO Collection (Daily)

```
INLIS System → generates GIRO text file (batched debit instructions)
    → emailed to SLA Finance revenue team
    → PO/REV reviews the file
    → Clark Sim approves GIRO debit amount and supporting documents (via email)
    → Bank (DBS) processes GIRO debit against customers' accounts
    → Bank statement: DDT (Direct Debit Item) credited to SLA account
    → PO/REV creates Ad Hoc Bank Transaction in Workday (next business day)
        Transaction ID: SLA-AHB-CYxxxx
        Memo: INLIS4 GIRO/ddMMMYYYY
    → Clark Sim approves Workday entry
    → Reconciler (Elicia Seah / Wen Hui Chong / System auto-match) reconciles Workday entry to bank statement line
    → Three-way match confirmed: INLIS report = Workday = Bank
```

### 4.2 INLIS — PayNow Collection (Daily)

```
Customer pays via CPS (Common Payment System)
    → funds credited to SLA bank account same-day
    → INLIS generates daily collection report with PayNow total
    → PO/REV creates Ad Hoc Bank Transaction in Workday
        Memo: INLIS PAYNOW/ddMMMYY
    → Clark Sim approves Workday entry
    → Reconciler matches Workday to bank statement
    → Reconciled
```

Simpler than GIRO — no debit file approval step. Audit steps (a) and (b) from Test 3a are not applicable.

### 4.3 INLIS — Credit Card Collection (Daily)

```
Customer pays via credit card (eNets gateway on INLIS)
    → INLIS generates daily CC collection report (pre-MDR amount)
    → Merchant CC Transaction Report (eNets) generated separately
    → PO/REV verifies INLIS total against Merchant CC report
    → DBS Card Center settles to SLA via 2 merchant IDs:
        700013659 and 700013660 (net of MDR)
    → Bank statement: TRF (Transfer) lines from DBS Card Center
        (multiple entries per day — one per merchant ID per settlement)
    → PO/REV creates SEPARATE Workday entries per merchant ID per settlement
        Memo: INLIS4CREDITCARD/13659 or INLIS4CREDITCARD/13660
    → Clark Sim approves each Workday entry
    → Reconciler matches each entry to bank statement line
    → Reconciled
```

Most complex flow. Key quirks:
- Daily INLIS total ≠ Workday entry total because CC settlements span multiple days.
- Each INLIS daily total maps to multiple Workday entries.
- MDR charges are absorbed — bank receives net amount but Workday records gross.

### 4.4 Data Licensing — End-to-End Cycle

```
Engagement Manager (Kian Tat) prepares quotation
    → based on Master Price List + loyalty discount if applicable
    → customer accepts (may issue Purchase Order)
    → Data Licence Agreement(s) prepared
    → signed by both parties at appropriate authority level:
        FRM 5.1.5: Director ≤$100K, ACE ≤$1M, CE >$1M
    → Engagement Manager emails billing instructions to Finance (Zainab)
        including: approval emails, signed agreements, amount breakdown
    → Approval chain: Director GSD approves renewal, PM approves invoicing
    → Zainab (PO/REV) creates Customer Invoice in Workday
        Ref: SLA-CUI-CYxxxx, Amount + 9% GST
    → Ariel Zhou or Clark Sim approves invoice
    → Invoice sent to customer (30-day credit term per FRM 5.13.7)
    → Customer pays via GIRO / bank transfer
    → Payment recorded in Workday: CP-CYxxxx
    → Revenue recognised
```

### 4.5 Refund Processing

```
Customer emails INLIS helpdesk requesting refund
    → GSD Ops (e.g. Sabrina, LTR) investigates and validates reason
    → Vivien (Finance) compiles INLIS refund log batch
    → sends to Elaine (Engagement Manager) for verification
    → Elaine verifies refund log numbers and amounts
    → Serene Tay (Principal Engagement Manager) approves via email
    → Vivien creates Customer Invoice Adjustment (credit note) in Workday
        Ref: SLA-CIA-CYxxxx
    → Clark Sim approves credit note per FRM 5.14 authority limits
    → Refund processed via original payment method:
        GIRO/PayNow: refund via same channel
        Credit Card: credit voucher raised and approved (NOT TESTED in audit)
    → Accounted in month-end journal reconciliation
```

### 4.6 Monthly Reconciliation

```
Month-end close
    → INLIS generates system collection report (all channels combined)
    → PO/REV (Vivien) extracts Workday GL balance
    → reconciles INLIS total against Workday GL in reconciliation workbook
    → investigates and documents any differences
        (typical cause: GST output on CC refund transactions in GL but not in INLIS report)
    → Clark Sim reviews and approves reconciliation workbook
    → PO/REV posts monthly revenue recognition journal in Workday
        Ref: SLA-JNL-CYxxxx - INLIS
    → Clark Sim approves journal entry
    → Monthly revenue reconciled and recognised
```

Timing: Journal posted within ~7 days of month-end.

### 4.7 Waiver of Late Payment Interest (LPI)

```
Customer has overdue invoice
    → Ops department evaluates whether LPI should be charged or waived
    → If waiver: approval sought per FRM 4.17 limits
        Director: ≤$1K, CFO: ≤$10K, DCE/ACE: ≤$50K, CE: ≤$100K, Chairman: >$100K
    → Credit note or invoice cancellation processed in Workday
    → Approved by appropriate Finance authority
```

Interest rate per IM-FG-RECV #27: 3-month compounded SORA + 1.5% spread + 3% admin overhead. Reviewed biannually by MOF.

---

## 5. Systems Landscape

| System | Owner | Purpose | Payment |
|---|---|---|---|
| INLIS | GSSS (Tech Mahindra vendor) | Land information portal — point of sale | Via CPS |
| CPS (Common Payment System) | SLA | Payment gateway for INLIS (GIRO, PayNow, CC) | — |
| eNets | External (DBS) | Credit card processing gateway | Settles via DBS Card Center |
| Workday | SLA Finance | Financial system — journal entries, invoices, credit notes, bank reconciliation, GL | — |
| Vendors@Gov | Government | E-invoicing for government agencies | Used when invoicing government customers |

**INLIS vendor support:**
- Apps support: inlis.appsupport@techmahindra.com
- Helpdesk: inlis4helpdesk@techmahindra.com

**INLIS user roles (from access list):**

| Role Code | Description |
|---|---|
| AO | Assessing Officer |
| IO | Inspection Officer |
| RAA | RAA (Refund) |
| SM | Senior Management |
| INFRA | Infra Team |
| RF | Refinement Team |
| TOPO | Topo Team |
| RS | Registered Survey |
| JR | Job Reassignment |
| SLA_COUNTER | SLA Counter Staff |
| LSVYPU / LSVYPMU | LSVY Portal User / Map User |

System owner approval required for creation/removal/modification of central administrator accounts (GSSS officer). GSSS officer makes changes only after receiving HOD approval.

---

## 6. Key Definitions

**Tenancy vs Lease (State Land):**
- **Tenancy:** Letting out State land/property for less than 10 years (State Lands Rules, Rules 19–20).
- **Lease:** Letting out State land/property for 10 years or more (State Lands Rules, Rules 2, 21(1)).
- Lease ≥10 years = disposal under Protection of Reserves framework → proceeds accrue to past reserves.
- Tenancy capped at 9 years (including options) under IM-RCP to stay clear of 10-year threshold.
- For SLA's own land/property (not State land), State Lands Rules don't apply but Protection of Reserves may still apply if SLA is Fifth Schedule statutory board.

**Revenue recognition (per SOP):**
- Revenue satisfying recognition criteria → Dr Receivable/Bank, Cr Revenue.
- Revenue billed/collected in advance or over a period → Dr Receivable/Revenue, Cr Deferred Revenue. Released monthly as earned.

**Deferred revenue:** Reviewed monthly to recognise revenue meeting recognition criteria.

**Ad Hoc Bank Transaction:** Workday document type used for INLIS collections (auto-interfaced). Entry: Dr Bank, Cr Revenue.

**Customer Invoice Adjustment:** Workday document type for credit notes / refunds. Ref: SLA-CIA-CYxxxx.

**Receiving Officers:** Officers authorised in writing by the CFO to receive money on behalf of SLA. List maintained as Annex A of FRM. Includes Clark Sim, Vivien Ng, Zainab, Mui Cheng Goh, Kailun Zhou, and others from both Finance (REV) and MFE (CC) teams.

---

## 7. Audit Considerations

### 7.1 What to Audit Against

| Revenue Type | Primary Criteria | Secondary Criteria |
|---|---|---|
| INLIS gazetted fees | SLA Revenue Accounting SOP, FRM | IM-FG RECV (SB partial compliance) |
| INLIS non-gazetted fees | SLA Revenue Accounting SOP, FRM | IM-FG RECV |
| Data Licensing | SLA Revenue Accounting SOP, FRM | IM-RCP (SB full compliance), IM-FG RECV |
| Refunds | FRM 5.14 | Revenue Accounting SOP Section B |
| Waivers | FRM 4.17, 5.1.2 | IM-FG RECV #14, #27 |
| AR Management | FRM 5.13 | IM-FG RECV #26–#28 |

**Do NOT audit against:** SB-FRS 115 / FRS 115 (Revenue from Contracts with Customers). Revenue recognition standard compliance is external audit territory. Internal audit tests whether staff follow the SOP, which itself should be FRS-compliant — but opining on the SOP's FRS compliance is not in scope.

**Exception:** If the internal audit charter or Audit Committee terms of reference specifically require assessment of financial reporting controls or FRS compliance, then it may be in scope.

### 7.2 Known Findings and Risk Areas

**Confirmed finding:** Data licensing master price list has no evidenced formal approval or version control. Criteria breach: IM-FG-RECV #5–#7 (three-year review), FRM 5.1.

**Key-person risk:** Clark Sim is sole approver across all revenue processes. FRM 1.3.6 requires documented alternates.

**Untested areas:**
- INLIS and Workday user access rights (system-enforced SOD not verified).
- INLIS system change management (fee table changes managed by Tech Mahindra).
- Credit card refund control path (credit voucher approval).
- Completeness of revenue (bank → INLIS direction).
- Workday automated bank reconciliation exception handling.

### 7.3 Population and Sampling Norms

| Test | Population | Typical Sample | Basis |
|---|---|---|---|
| INLIS daily collection (per channel) | 365 days | 30 | Haphazard |
| Data Licensing agreements | 5 | 3 (60%) | Haphazard |
| Monthly reconciliation | 12 months | 3 months | Judgemental |
| Waivers | Per period | All (if small) | Judgemental |
| Refunds | 146 | Minimum 15 recommended | Judgemental — stratify by value and payment method |
| Master data (INLIS fees) | 32 fee types | All | 100% verification against gazetted/approved sources |
| AR Aging (Data Licensing) | N/A in 2025 | Confirm with management | Sight AR listing to confirm nil |
