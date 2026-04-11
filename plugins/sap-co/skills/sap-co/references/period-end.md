# CO Period-End Closing Reference

## Period-End Sequence (Full)

| Step | Activity | T-code | Notes |
|------|----------|--------|-------|
| 1 | Repost FI costs to CO (if needed) | KB11N | For manual corrections |
| 2 | Enter statistical key figures | KB31N | Required as allocation base |
| 3 | CO assessment cycles (actual) | KSU5 | Test run first |
| 4 | CO distribution cycles (actual) | KSV5 | Test run first |
| 5 | Indirect activity allocation | KB65 | If applicable |
| 6 | Internal order settlement | KO8G | Collective settlement — simulate first |
| 7 | Product cost collector settlement | KKS1 | If product cost collectors active |
| 8 | WBS/Project settlement | CJ88 | If PS module active |
| 9 | Material Ledger period-end closing | CKMLCP | S/4HANA mandatory |
| 10 | CO-PA transfer check | KE24 | Verify line items transferred from billing |
| 11 | Variance analysis | KSB1 / S_ALR_87013611 | Cost center variances |
| 12 | Lock CO period | OKP1 | After all allocations complete |

## Assessment Cycle Configuration Reference

Cycle header:
- Cycle name + description
- Start date / end date

Segment header:
- Sender: cost center range + cost element range (or cost center group)
- Receiver rule: 1=Fixed amounts / 2=Fixed percentages / 3=Variable portions / 4=Fixed portions

Receiver types per segment:
- Cost centers (most common)
- Internal orders
- WBS elements
- Business processes (ABC)
- CO-PA segments

## Common CO Period-End Errors

| Error | Cause | Resolution |
|-------|-------|-----------|
| "Period not open" | CO period locked | OKP1 → unlock for controlling area |
| "No receiver found" | Cycle receiver not active or no costs | KSU1 → check receiver validity |
| "Cycle already executed" | Already ran for this period | KSU5 → reverse previous run first |
| "Activity price missing" | KP26 not maintained | KP26 → enter plan activity price |
| "Settlement rule missing" | Internal order has no rule | KO02 → Settlement tab → create rule |
