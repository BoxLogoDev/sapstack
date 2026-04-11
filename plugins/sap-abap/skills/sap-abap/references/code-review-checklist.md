# ABAP Code Review Checklist

## 1. Performance

| Check | Explanation |
|-------|-------------|
| ☐ No `SELECT *` — only required fields | Fetching all columns wastes memory and network. Specify only fields needed. |
| ☐ `WHERE` clause on primary key or indexed fields | Full table scans on large tables (BKPF, VBAK, EKKO) cause timeouts. |
| ☐ No `SELECT` inside `LOOP AT` | This creates N+1 queries. Collect keys first, then use `FOR ALL ENTRIES`. |
| ☐ `FOR ALL ENTRIES IN` — table not empty check | If internal table is empty, `FOR ALL ENTRIES` returns ALL rows. Always check `IF lt_table IS NOT INITIAL`. |
| ☐ `PACKAGE SIZE` for mass data reads | Prevents memory overflow when processing millions of records. |
| ☐ No `ORDER BY` in ABAP `SELECT` on large tables | Let ABAP sort internal table with `SORT` instead. DB `ORDER BY` uses index; may still be slow at scale. |
| ☐ String concatenation uses `\|...\|` templates not `CONCATENATE` | String templates are faster and Unicode-safe. |

## 2. Error Handling

| Check | Explanation |
|-------|-------------|
| ☐ All BAPI calls check `RETURN` table for type `E` or `A` | BAPIs return errors in table — no exception raised. Silent failure if not checked. |
| ☐ `TRY-CATCH` for risky operations | File I/O, type conversions, JSON parsing — all can raise exceptions. |
| ☐ No `COMMIT WORK` inside loops | Partial commits create inconsistent data if loop fails midway. |
| ☐ Object references checked `IS BOUND` before method call | Calling method on initial reference → OBJECTS_OBJREF_NOT_ASSIGNED dump. |
| ☐ `SY-SUBRC` checked after every DB operation | `SELECT SINGLE` may return no rows — always check `IF sy-subrc = 0`. |
| ☐ `MESSAGE` statements use correct type | `TYPE 'E'` = error (stops processing). `TYPE 'S'` = success (continues). `TYPE 'I'` = info. |

## 3. Security

| Check | Explanation |
|-------|-------------|
| ☐ `AUTHORITY-CHECK` for sensitive data | Programs reading/writing financial or personal data must check auth objects. |
| ☐ No hardcoded passwords, API keys, tokens | Store in secure note (SM30 → SSFARGS) or encrypted configuration. |
| ☐ Input validated before DB writes | Prevent SQL injection-style issues with dynamic SQL. |
| ☐ Dynamic SQL (`SELECT (field_list)`) uses safe field list | Never build dynamic SQL from unvalidated user input. |
| ☐ No `SUBMIT` with unvalidated external data | `SUBMIT` can run any program — validate program name before use. |

## 4. Clean Core / S/4HANA Compatibility

| Check | Explanation |
|-------|-------------|
| ☐ No `SELECT` from BSEG without all key fields | BSEG is cluster table — always select with full key (MANDT+BUKRS+BELNR+GJAHR+BUZEI). Better: use CDS. |
| ☐ No `SELECT` from MKPF/MSEG | Use `I_MaterialDocumentItem` CDS view in S/4HANA. |
| ☐ No `SELECT` from BSID/BSAD/BSIK/BSAK | Use `I_CustomerLineItem` / `I_SupplierLineItem` CDS views. |
| ☐ No `CALL TRANSACTION` in batch-capable programs | Use BAPI or RAP action instead for background-capable processing. |
| ☐ No SAP standard object modifications | Use BAdI / enhancement spot. Modifications break on upgrade. |
| ☐ Only released SAP APIs used | Check release state in SE80 → API State. Use released BAPIs/function modules only. |
| ☐ ATC check run — no Priority 1/2 findings | Run ATC before transport to QAS. Fix P1 (blocker) and P2 (high) mandatory. |

## 5. Technical Quality

| Check | Explanation |
|-------|-------------|
| ☐ No hardcoded organizational values | No literal company codes, plant codes, G/L accounts, cost centers in code. |
| ☐ Unicode-compatible | SE38 → Program Attributes → Unicode check flag must be set. |
| ☐ Program type correct | Type 1 = report (SE38). Type M = module pool. Type F = function group. |
| ☐ Meaningful variable names | `lv_company_code` not `lv_x` or `lv_temp1`. |
| ☐ Modern ABAP syntax | Use inline declarations `DATA(lv_var)`, string templates `\|...\|`, constructor expressions `NEW`. |
| ☐ No obsolete statements | No `MOVE ... TO` (use `=`). No `WRITE TO` for type conversion (use `CONV`). No `TABLES` parameters in new FMs. |

## 6. Transport and Documentation

| Check | Explanation |
|-------|-------------|
| ☐ Transport request assigned (not `$TMP`) | Objects in `$TMP` cannot be transported. Must be in a named request. |
| ☐ Object in correct package | Z-objects in customer namespace package. Not in SAP standard packages. |
| ☐ ABAP Unit test class included | Minimum: test happy path + error path. Use `RISK LEVEL HARMLESS` for read-only tests. |
| ☐ Program documentation updated | SE38 → Documentation tab or header comment updated. |
| ☐ RICEF / functional spec reference in header | Include spec ID and description in program header comment. |
| ☐ Peer review documented | Review comment in transport request or linked work item. |

## 7. Specific Object Checks

### Function Modules
- ☐ Pass-by-reference for large tables (TABLES parameter or `CHANGING TYPE ... PASS BY REFERENCE`)
- ☐ EXCEPTIONS defined for error cases
- ☐ No global data modifications (side-effect free where possible)

### Classes / Methods
- ☐ Single responsibility principle — one method does one thing
- ☐ Instance methods vs static methods — use instance for stateful behavior
- ☐ Interfaces defined for testability (mock-friendly design)

### CDS Views
- ☐ `@AccessControl.authorizationCheck` set appropriately (not `#NOT_REQUIRED` on sensitive data)
- ☐ `@EndUserText.label` defined for all views and fields
- ☐ Associations exposed only when needed (don't expose everything)
- ☐ No complex logic in CDS — keep it as projection / filter, move logic to ABAP

### RAP Behavior Definitions
- ☐ `strict (2)` mode activated (enforces clean RAP patterns)
- ☐ `etag master` defined for optimistic locking
- ☐ Mandatory fields declared with `field (mandatory)`
- ☐ Read-only fields declared with `field (readonly)`
- ☐ Behavior implementation class follows naming convention `ZBP_*`
