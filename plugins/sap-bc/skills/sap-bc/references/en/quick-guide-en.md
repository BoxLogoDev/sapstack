<!-- Claude-authored draft (community review welcome) -->

# sap-bc Quick Guide (English)

> Local-context BC consultant focus. Global Basis topics → see `sap-basis`.

## 🔑 Environment Intake (local-context first)
1. Deployment: On-Prem / RISE / network-segregated (closed network)
2. Localization: country CVI / e-tax-invoice / e-Document
3. DB: HANA (locale settings) / Oracle (NLS_LANG)
4. SAPGUI language: local / EN / mixed

## 🌍 Local BC Issues — Top 10

### 1. Codepage dump (CONVT_CODEPAGE)
- Symptom: `CONVT_CODEPAGE` ABAP dump
- Cause: Unicode conversion failure (legacy non-Unicode)
- Fix: SNOTE 2452523 series, correct `NLS_LANG` (e.g. `*.AL32UTF8`)

### 2. STMS import error 8 (multibyte short text)
- Cause: multibyte object names break tp parser
- Log: `/usr/sap/trans/log/ULOG`, `ALOG`
- Fix: tp version upgrade, Unicode tp conversion

### 3. E-tax-invoice integration (STRUST)
- Register **national CA certificates**
- Root CA: country-specific certification authorities
- **TLS 1.2+ required** (local security guidance)
- Harden Web Dispatcher `ssl/ciphersuites`

### 4. Network-segregated Kernel upgrade
1. Download from SAP Launchpad on external network
2. SHA256 hash verification
3. Security team approval
4. Encrypted USB transfer
5. Replace internal `/usr/sap/<SID>/SYS/exe/`

### 5. SAPGUI character corruption
- SAPGUI 770+ patch
- Windows "Language for non-Unicode programs"
- Check `NLSPATH`

### 6. SOX authorization recertification
- Quarterly PFCG role review audit
- Use SUIM / S_BCE_68001398
- SoD matrix management (FI/MM)

### 7. Local SAP support (OSS)
- File with local SAP support (local language)
- Localization issues via local support team
- Priority Very High (production down) → 24/7

### 8. HANA locale
- Use appropriate `COLLATION`
- CDS `@Semantics.text.languageCode`
- SAPGUI vs Fiori rendering differences

### 9. ChaRM workflow
- Urgent → Normal change needs internal-control doc
- Approval path mapped to local org chart
- Weekend/holiday auto-approve bypass policy

### 10. Local SaaS integration
- Country-specific accounting SaaS — many legacy connectors
- Firewall/IP whitelist per customer security policy
- Check SMICM log when via proxy

## 📚 Frequent T-codes
| T-code | Use |
|--------|------|
| STRUST | SSL certificate mgmt |
| SMICM | ICM (HTTP) monitor |
| STMS | Transport mgmt |
| PFCG | Role mgmt |
| SUIM | Auth info system |
| SU53 | Auth failure trace |
| SM59 | RFC destination |
| SM21 | System log |
| ST22 | Dump analysis |
| RZ20 | CCMS (monitoring) |

## ⚠️ Forbidden
- ❌ Production SE16N direct edit (SOX violation)
- ❌ STMS forced import (tp -i ignore)
- ❌ Storing CA cert as OS file (use STRUST)
- ❌ Kernel upgrade without backup + restart test

## 📖 Related
- `../../SKILL.md` — full content
- `sap-basis` — global Basis topics
- `sap-s4-migration` — Kernel/Unicode conversion
