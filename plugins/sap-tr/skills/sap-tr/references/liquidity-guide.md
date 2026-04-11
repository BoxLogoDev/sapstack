# Liquidity Planning Guide

## Planning Level Setup

### What is a Planning Level?

A planning level represents a category of cash flow (e.g., "vendor payments", "customer receipts", "bank confirmed").
Every line item in FLQITEM must be assigned to a planning level.

### Configuration Path

SPRO → Financial Supply Chain Management → Cash and Liquidity Management
→ Liquidity Planner → Basic Settings → Planning Levels

### Standard Planning Level Structure

| Level | Type | Description |
|-------|------|-------------|
| E1 | Actual | Bank statement — confirmed transactions |
| F1 | Memo | Manual forecast entries (FF63) |
| P1 | Plan | Long-range cash planning |
| B1 | Inflows | AP expected payments (from open items) |
| B2 | Outflows | AR expected receipts (from open items) |

### FLQDB — Planning Level Assignment Table

Key fields:
- COMPANY_CODE: company code
- ACCOUNT: G/L account or account range
- BUSINESS_TRANSACTION: SAP business transaction code
- PLANNING_LEVEL: assigned planning level
- SIGN: inflow (+) or outflow (-)

## FLQC10 — Recalculation

### When to Use Full Recalculation

- After planning level configuration changes
- After G/L account master data changes
- After significant master data corrections
- Monthly as part of period close (optional but recommended)

### When to Use Delta Upload

- Daily processing of new transactions
- After individual document corrections
- Performance-sensitive environments

### FLQC10 Parameters

| Parameter | Full Recalc | Delta |
|-----------|------------|-------|
| Processing mode | Delete + rebuild | Incremental |
| Date range | All open items | Specified range |
| Duration | Longer | Shorter |
| Use case | Config change | Daily routine |

## FF7A / FF7B Troubleshooting Checklist

```
□ Is the company code assigned in FLQDB?
□ Is the G/L account mapped to a planning level in FLQDB?
□ Is the business transaction type correctly assigned?
□ Are there items in FLQITEM for the expected date range?
   → SE16N: FLQITEM, filter: COMPANY_CODE + date range
□ Has FLQC10 been run recently after any config change?
□ Is the planning date within the display horizon of FF7A?
   → FF7A: set "To date" far enough in the future
□ Is the currency display correct?
   → FF7A: check currency key filter
```
