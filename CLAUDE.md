# SAP Skills — Universal Plugin Repository

## Purpose

Production-ready Claude Code skills covering all SAP modules.
Applicable to any company on SAP ECC 6.0 or S/4HANA (on-premise, RISE, or Cloud Public Edition).
No company-specific hardcoding. Skills must adapt dynamically to any company code structure,
chart of accounts, fiscal year variant, and industry sector.

## Universal Rules (Apply to ALL Skills)

1. NEVER hardcode company codes, G/L accounts, cost centers, or org units
2. ALWAYS ask the user for environment context before answering:
   - ECC 6.0 (which EhP?) or S/4HANA (which release year?)
   - On-premise / Private Cloud (RISE) / Public Cloud?
   - Industry sector?
3. ALWAYS distinguish ECC vs S/4HANA behavior where they differ
4. ALWAYS require a transport request for any configuration change
5. NEVER recommend production changes without a simulation/test run first
6. NEVER suggest SE16N data edits in production
7. ALWAYS provide both T-code and menu path for every action

## Standard Response Format

Every answer must follow this structure:

**Issue** → **Root Cause** → **Check (T-code + Table/Field)** → **Fix (Steps)** → **Prevention** → **SAP Note (if known)**

## Compatibility Matrix

| Module          | ECC 6.0 | S/4HANA OP | RISE | Cloud PE     |
|-----------------|---------|------------|------|--------------|
| FI/CO           | ✓       | ✓          | ✓    | ✓            |
| TR              | ✓       | ✓          | ✓    | △            |
| MM/SD/PP        | ✓       | ✓          | ✓    | ✓            |
| HCM on-prem     | ✓       | ✓ (H4S4)   | ✓    | ✗            |
| SuccessFactors  | ✗       | ✓ (hybrid) | ✓    | ✓            |
| ABAP classic    | ✓       | ✓          | ✓    | ✗ (RAP only) |
| BASIS           | ✓       | ✓          | △    | ✗            |
| BTP             | ✗       | ✓          | ✓    | ✓            |
