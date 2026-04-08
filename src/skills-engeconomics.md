#  Engagement Economics — System Knowledge Base

## Overview

This document captures the mechanics of  engagement economics system (Mercury), derived from CNS Engagement Economics Training materials (115 slides), real engagement data validation, and practitioner experience. It covers how engagements are priced, costed, tracked, and billed.

---

## The Engagement Lifecycle

An engagement follows this sequence:

1. **Fee negotiation** — agree a fixed fee with the client
2. **Budget planning** — allocate hours per rank to deliver the work
3. **Budget set** — lock the plan, establishing budget NSR, EAF, and baseline margin
4. **Execution** — staff charge actual hours against the engagement
5. **ETC (Estimate to Complete)** — revise projected hours if scope changes or estimates were off
6. **Billing** — invoice the client progressively or at milestones
7. **Close** — reconcile NUI, write off any overrun, finalize margin

---

## Core Metrics & Formulas

### NSR (Net Standard Revenue)

**NSR = Σ (Hours × NSR Rate/hr)**

The standard value of resources deployed on an engagement. NSR rates are fixed per financial year, per rank, per country, per service line. NSR is a reference metric — it is not what the client pays, but what the hours are "worth" at standard rates. Users typically do not need to see NSR directly; it is an intermediate value used to derive EAF and ANSR.

### EAF (Engagement Adjustment Factor)

**EAF = (Fee / NSR) − 1**

The premium or discount applied to standard rates to arrive at the agreed fee.

- **Positive EAF** = charging above standard (premium engagement)
- **Negative EAF** = discount vs standard rates (common)
- One EAF applies uniformly to ALL hours on the engagement
- EAF is recalculated every time an ETC is transferred (i.e., whenever projected NSR changes)
- EAF is the bridge between NSR (internal benchmark) and ANSR (client-facing revenue)

### ANSR (Adjusted Net Standard Revenue)

**ANSR = NSR × (1 + EAF)**

The revenue recognized from time charges. ANSR is not a fixed number — it changes as actual hours are charged, because it is computed from actual NSR applied to the current EAF.

Key behaviours:
- When actual hours = projected hours → ANSR = Fee (aligned)
- When actual hours > projected hours → ANSR > Fee (overrun exposure)
- When actual hours < projected hours → ANSR < Fee (work still to be done)
- After an ETC is transferred, the EAF recalibrates so that **projected** ANSR = Fee. But recognized ANSR (from actual hours) may differ.

### TER (Total Engagement Revenue)

**TER = ANSR + Billable Expenses**

The total amount collectible from the client, including pass-through expenses.

### Margin

**Margin = Fee − (Labour Cost + Tech Fee + Billable Expenses)**

- **Labour Cost** uses cost rates per rank (not NSR rates). These are the firm's actual internal cost of deploying that person.
- **Tech Fee** = 0.5% of Total Labour Cost (varies by service code). This is a firm-wide technology levy, not a per-hour charge. Verified exact match against real engagements.
- Margin can be expressed as a dollar amount or a percentage of fee.

### Budget Margin vs Projected Margin

- **Budget Margin** = Fee − Budget Cost (locked at Set Budget, never changes)
- **Projected Margin** = Fee − Projected Cost (updates after ETC with revised hours)
- Comparing these two shows the cost of scope changes: if Budget Margin was $5,000 and Projected Margin is $4,200, the ETC cost $800 in margin.

### Target Margin & Cost Allowance

- **Target Margin** = Fee × Target% (e.g., 35%). This is the margin the firm expects you to achieve.
- **Cost Allowance** = Fee × (1 − Target%). The maximum you can spend to hit your target.
- Target Margin + Cost Allowance = Fee. They are two sides of the same coin.
- If Budget Cost or Projected Cost exceeds Cost Allowance, margin will be below target.

### NUI (Net Unbilled Inventory)

**NUI = (Recognized ANSR + Charged Expenses) − (Billed Fees + Billed Expenses)**

Where **Recognized ANSR = Actual NSR × (1 + Projected EAF)**

NUI tells you the gap between work done and billing:

| NUI | Meaning | Action |
|---|---|---|
| NUI > 0, Actual ≤ Projected | Work done but not yet billed | Raise invoices |
| NUI > 0, Actual > Projected | Overrun — recognized more than collectible | Needs ETC and likely write-off |
| NUI = 0 | Billed exactly what has been recognized | On track |
| NUI < 0 | Billed ahead of work performed | Normal for milestone/advance billing |

The critical distinction: **NUI > 0 is not always an overrun.** If you've done the work but simply haven't invoiced yet, NUI is positive but the fix is billing, not an ETC. An overrun only occurs when actual hours exceed projected hours, causing recognized ANSR to exceed the fee — that money can never be collected.

---

## How ETC Works

### Definitions

- **Budget** — original planned hours per rank (locked after budget is set)
- **ETC (additional)** — extra hours beyond budget needed to complete. Default 0 = on track.
- **Total Projected** = Budget + ETC = revised total hours
- **Actual** — hours actually charged to date (from timesheets)

### ETC Flow

1. Budget is set with planned hours and agreed fee
2. Budget EAF = (Fee / Budget NSR) − 1
3. As engagement progresses, if scope changes or estimation was off, user adds ETC hours per rank
4. **Transfer ETC** commits the revision. This triggers:
   - Total Projected Hours = Budget + ETC
   - Projected NSR recalculates (new total × NSR rates)
   - **EAF recalibrates**: new EAF = (Fee / new Projected NSR) − 1
   - Since Fee is fixed but NSR increased, EAF becomes more negative
   - **Projected ANSR still equals Fee** (because EAF adjusted to compensate)
   - Labour Cost increases (more hours × cost rates)
   - **Margin drops** (same fee, higher cost)
   - NUI recalculates with the new EAF applied to actual hours
5. Multiple ETCs can be run over the life of an engagement

### What ETC Changes

| Metric | Before ETC | After ETC |
|---|---|---|
| NSR | Budget NSR | Projected NSR (higher) |
| EAF | Budget EAF | Projected EAF (more negative) |
| Projected ANSR | = Fee | = Fee (EAF recalibrates) |
| Recognized ANSR | Actual NSR × Budget EAF | Actual NSR × Projected EAF |
| Labour Cost | From budget hours | From projected hours |
| Margin | Budget Margin | Projected Margin (lower) |

---

## NUI Deep Dive

### How NUI Relates to ETC

The key insight: **NUI uses the Projected EAF (from the latest ETC) applied to Actual hours.**

- If Actual hours = Projected hours → Recognized ANSR = Fee → NUI = Fee − Billed
- If Actual hours > Projected hours → Recognized ANSR > Fee → NUI shows overrun exposure even if fully billed
- This overrun in NUI signals the need for another ETC

### NUI Overrun Scenario

```
Projected total: 360 hrs, Fee: $38,925
Projected NSR: $43,158
Projected EAF: ($38,925 / $43,158) − 1 = −9.81%

At completion on track (Actual = 360 hrs):
  Actual NSR: $43,158
  Recognized ANSR: $43,158 × (1 − 0.0981) = $38,925 = Fee ✓
  Billed: $38,925 → NUI = $0 ✓

At completion overrun (Actual = 400 hrs):
  Actual NSR: $47,953
  Recognized ANSR: $47,953 × (1 − 0.0981) = $43,248
  Billed: $38,925 → NUI = $4,323 (overrun — unbilled)
```

That $4,323 is revenue recognized that can never be collected — needs a write-off via another ETC to realign projected hours with reality.

### NUI and Advance Billing

- If you bill 50% of the fee but have only completed 30% of work
- Recognized ANSR (from 30% of hours) < Billed amount
- NUI goes negative = "overbilled" / advance billing
- This is normal for milestone-based billing ahead of hours

---

## Margin Analysis

### What Drives Margin

- **Fee is fixed** — agreed with client upfront, does not change
- **Cost is variable** — driven by hours × cost rates per rank + tech fee + expenses
- Margin improves by: using fewer hours, using cheaper ranks, reducing expenses
- Margin erodes by: scope creep (more hours), rank substitution (cheaper planned but expensive actual), Partner overinvolvement

### Three Levels of Margin Comparison

1. **Target Margin vs Budget Margin** — is the original plan meeting the firm's target? If Budget Margin < Target Margin, the engagement is under-priced or over-staffed from the start.
2. **Budget Margin vs Projected Margin** — how did the ETC revisions change the original plan? The delta is the cost of scope changes.
3. **Projected Margin vs Actual (via NUI)** — are actual hours exceeding even the revised plan? Shown through NUI diverging from expected values.

---

## Rate Structure

### Two Rate Types per Rank

Each rank has two rates, fixed per financial year per country per service line:

- **NSR Rate** — the standard revenue value per hour. Used to calculate NSR and EAF. This is a benchmark, not a billing rate.
- **Cost Rate** — the firm's internal cost per hour. Used to calculate labour cost and margin.

### Key Observations

- **Partner/Principal cost typically exceeds NSR** — for example, Cost $993 vs NSR $621. Every Partner hour reduces margin. This is by design; Partner involvement is expected to be minimal and strategic. The cost rate reflects the Partner's full loaded cost to the firm.
- Senior Associates are graded (SA1, SA2, SA3) with distinct rates at each level.
- **Tech Fee = 0.5% of Total Labour Cost** (not per-hour). This is applied to the sum of all labour costs, not individually per rank.
- Intern NSR rates may be nominal (very low) since interns are typically not billed to clients.

### Typical Resource Mix

Engagements follow a standard staffing pyramid. A typical cost allocation mix:

| Rank | Mix % |
|---|---|
| Partner/Principal | 2% |
| Director | 3% |
| Senior Manager | 4% |
| Manager | 12% |
| Senior Associate 1 | 21% |
| Associate / Staff | 58% |

This mix is used for initial hour allocation: given a cost allowance, distribute the budget across ranks proportionally by mix weight, then compute hours from cost rates. The mix can be customized per engagement or service line.

---

## Booking & Resource Scheduling

Staff are booked in weekly blocks in the firm's scheduling system. The booking convention uses percentage of a week:

| Booking | Meaning |
|---|---|
| 100% | Full week (40 hours) |
| 80% | 4 days (32 hours) |
| 60% | 3 days (24 hours) |
| 50% | Half week (20 hours) |
| 40% | 2 days (16 hours) |
| 20% | 1 day (8 hours) |

To translate budget hours into booking weeks: divide total hours per rank by 40, then express full weeks as 100% and the remainder as the appropriate percentage.

Booking estimates are typically only relevant for staff-level ranks (Manager and below). Partners, Directors, and Senior Managers are not usually block-booked — their time is allocated differently.

---

## Validated Against Real Data

All formulas have been validated against real Mercury engagement data with $0.00 variance:

| Engagement | Code | Budget Hrs | NSR | Labour Cost | Tech Fee | Margin |
|---|---|---|---|---|---|---|
| MOE FY25 (2) | E-69657163 | 1,551.5 | $183,849.50 | — | — | — |
| MOE School Fund | E-69357361 | 1,903 | $202,243.00 | — | — | — |
| IMDA SGNIC | E-69733072 | 320 | $37,638.00 | $24,169.00 | $120.85 | 37.3% |

Tech Fee verified as exactly 0.5% of Total Labour Cost across all engagements.

---

## Glossary

| Term | Full Name | Definition |
|---|---|---|
| NSR | Net Standard Revenue | Hours × NSR rates. Internal benchmark, not billing. |
| ANSR | Adjusted Net Standard Revenue | NSR × (1 + EAF). Revenue recognized from time charges. |
| EAF | Engagement Adjustment Factor | (Fee / NSR) − 1. Premium or discount vs standard rates. |
| TER | Total Engagement Revenue | ANSR + Billable Expenses. Total collectible. |
| NUI | Net Unbilled Inventory | (Recognized ANSR + Charged Exp) − (Billed Fees + Billed Exp). |
| ETC | Estimate to Complete | Additional hours beyond budget. Triggers EAF recalibration. |
| Budget | — | Original planned hours, locked after budget is set. |
| Projected | — | Budget + ETC. Revised total after scope changes. |
| Actual | — | Hours actually charged to date from timesheets. |
| Cost Allowance | — | Fee × (1 − Target%). Max spend to hit margin target. |
| Target Margin | — | Fee × Target%. The margin the firm expects. |
| Tech Fee | — | 0.5% of total labour cost. Firm technology levy. |
| Cost Rate | — | Firm's internal cost per hour per rank. |
| NSR Rate | — | Standard revenue value per hour per rank. |
| Mix % | — | Typical cost allocation weightage per rank for hour planning. |
