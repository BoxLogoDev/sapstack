<!-- Claude-authored draft (community review welcome) -->

# sap-sfsf Hướng dẫn nhanh (Tiếng Việt)

## 🔑 Thu thập thông tin môi trường
1. Module SuccessFactors (EC / ECP / Recruiting / LMS / Performance)
2. Data Center (region — vd APJ/EU/US)
3. Tích hợp ECC/H4S4 (hybrid / full cloud)

## 📚 Điểm cốt lõi

### Employee Central (EC)
- **Admin Center → Manage Employee Files**
- Foundation Objects: Legal Entity, Business Unit, Division, Department
- MDF (Metadata Framework): tạo custom object
- Business Rules: logic khai báo (trigger workflow, tính giá trị)

### Role-Based Permissions (RBP)
- **Manage Permission Roles**
- **Permission Groups** — nhóm động (theo query)
- Doanh nghiệp lớn: phê duyệt phân cấp (CEO→trưởng bộ phận→team lead→thành viên) phức tạp

### ECP (Employee Central Payroll)
- Chạy logic payroll HR theo quốc gia trên cloud
- Chung codebase với payroll on-prem H4S4

### Recruiting
- Job Requisition Templates
- Application Form Templates
- Candidate Data Model

### Integration
- **Integration Center** — công cụ tích hợp tích hợp sẵn SFSF
- **SAP Cloud Integration (CPI)** — dựa trên BTP
- OData API (Query + Upsert)

## 🇻🇳 Bản địa hóa Việt Nam
- **CCCD/MST cá nhân** — cần rà soát pháp lý về lưu trữ trên DC region
- **Bảo hiểm bắt buộc** — chỉ tính khi route tới ECP
- **UI bản địa** — SFSF hỗ trợ i18n chuẩn
- **Quyết toán thuế TNCN** — xử lý bởi ECP hoặc H4S4 on-prem (SFSF tự nó không tính)

## ⚠️ Lưu ý
- **Đổi quyền Admin Center** — test ở Preview instance trước
- **Đổi data model** (XML import/export) — bắt buộc backup
- Trường bản địa — dùng Picklist (cấm hardcode)

## 📖 Hướng dẫn migration
Xem `../migration-path.md`.
