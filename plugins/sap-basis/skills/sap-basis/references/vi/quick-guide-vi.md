<!-- Claude-authored draft (community review welcome) -->

# sap-basis Hướng dẫn nhanh (Tiếng Việt)

> Chủ đề Basis toàn cầu. Vấn đề BC đặc thù khu vực → xem plugin `sap-bc`.

## 🔑 Thu thập thông tin môi trường
1. Phiên bản SAP (ECC EhP / S/4HANA)
2. DB (HANA / Oracle / DB2 / MSSQL)
3. OS (Linux SLES/RHEL / Windows / AIX)

## 📚 Điểm cốt lõi

### System Administration
- **SM50/SM66**: Work Process
- **ST22**: Lỗi runtime ABAP (dump)
- **SM21**: System Log
- **SM12**: Lock Table
- **SM13**: Update Requests

### Transport Management
- **STMS**: Transport Management System
- **SE09/SE10**: Transport Organizer
- Lệnh **tp** (mức OS)

### Performance
- **ST05**: SQL Trace
- **SAT**: Runtime Analysis
- **ST06**: Tài nguyên OS
- **ST02**: Memory (Buffer)

### Security / Authorization
- **SU01/SU10**: Quản lý user
- **PFCG**: Quản lý Role
- **SUIM**: Hệ thống thông tin quyền
- **SU53**: Lỗi quyền gần nhất

### Job Management
- **SM36**: Định nghĩa Job
- **SM37**: Giám sát Job

### RFC / Integration
- **SM59**: RFC Destination
- **SMQR/SMQS**: qRFC Monitor
- **BD54**: Logical System

## 🇻🇳 Bản địa hóa Việt Nam
Chủ đề đặc thù khu vực — phân tách mạng, xử lý Unicode, STRUST hóa đơn điện tử, quản lý quyền SOX — xem plugin `sap-bc` `SKILL.md`. `sap-basis` cung cấp baseline toàn cầu; `sap-bc` bổ sung bối cảnh nội địa.

## ⚠️ Cấm tuyệt đối
- ❌ Sửa dữ liệu trực tiếp SE16N ở production
- ❌ STMS forced push (tp forced import)
- ❌ Nâng cấp SAP Kernel không backup
- ❌ PRD client 405 (gỡ bảo vệ SCC4)

## 📖 Plugin liên quan
- `sap-bc` — chiều sâu góc nhìn tư vấn BC nội địa
- `sap-s4-migration` — kế hoạch nâng cấp Kernel/DB
- `sap-abap` — phân tích sâu ABAP dump
