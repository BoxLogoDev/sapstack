<!-- Claude-authored draft (community review welcome) -->

# sap-basis Quick Guide (English)

> Global Basis topics. Region-specific BC issues → see `sap-bc` plugin.

## 🔑 Environment Intake
1. SAP release (ECC EhP / S/4HANA)
2. DB (HANA / Oracle / DB2 / MSSQL)
3. OS (Linux SLES/RHEL / Windows / AIX)

## 📚 Essentials

### System Administration
- **SM50/SM66**: Work process
- **ST22**: ABAP runtime error (dump)
- **SM21**: System log
- **SM12**: Lock table
- **SM13**: Update requests

### Transport Management
- **STMS**: Transport Management System
- **SE09/SE10**: Transport Organizer
- **tp** command (OS level)

### Performance
- **ST05**: SQL trace
- **SAT**: Runtime analysis
- **ST06**: OS resources
- **ST02**: Memory (buffer)

### Security / Authorization
- **SU01/SU10**: User management
- **PFCG**: Role management
- **SUIM**: Authorization info system
- **SU53**: Last auth failure

### Job Management
- **SM36**: Job definition
- **SM37**: Job monitor

### RFC / Integration
- **SM59**: RFC destination
- **SMQR/SMQS**: qRFC monitor
- **BD54**: Logical system

## 🌍 Locale Considerations
Region-specific topics — network segregation, Unicode handling, e-tax-invoice STRUST, SOX authorization — see `sap-bc` plugin `SKILL.md`. `sap-basis` provides the global baseline; `sap-bc` adds local context.

## ⚠️ Forbidden
- ❌ Direct SE16N data edit in production
- ❌ STMS forced push (tp forced import)
- ❌ SAP Kernel upgrade without backup
- ❌ PRD client 405 (SCC4 protection removed)

## 📖 Related Plugins
- `sap-bc` — local BC consultant depth
- `sap-s4-migration` — Kernel/DB upgrade planning
- `sap-abap` — ABAP dump deep analysis
