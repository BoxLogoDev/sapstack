<!-- Claude-authored draft (community review welcome) -->

# sap-s4-migration Hướng dẫn nhanh (Tiếng Việt)

> Tham khảo nhanh cho migration ECC → S/4HANA. Chi tiết đầy đủ ở `SKILL.md` và `references/simplification-items.md`.

## 🔑 Thu thập thông tin môi trường

1. Phiên bản ECC hiện tại (EhP) + DB + Trạng thái Unicode
2. Phiên bản S/4HANA mục tiêu (2022/2023/2024)
3. Mô hình triển khai (On-Prem / RISE / Cloud PE)
4. Mức độ phụ thuộc localization

## 🛣 Ba lộ trình migration

| Lộ trình | Mô tả | Phù hợp với |
|----------|-------|-------------|
| **Brownfield (System Conversion)** | Chuyển đổi tại chỗ hệ thống hiện tại | Doanh nghiệp lớn giữ nguyên quy trình |
| **Greenfield (New Implementation)** | Triển khai mới + di trú dữ liệu | Doanh nghiệp vừa thiết kế lại quy trình |
| **Selective Data Transition** | Di trú chọn lọc theo tổ chức/kỳ/chức năng | Tập đoàn đa công ty con rollout từng giai đoạn |

## ⚠️ Rủi ro hàng đầu

### Brownfield
- Sửa đổi lượng lớn custom code (thích ứng ACDOCA)
- Z-program tham chiếu BSEG trực tiếp → bắt buộc chuyển sang ACDOCA
- Kiểm tra lại CVI đặc thù quốc gia

### Greenfield
- Phạm vi và chiến lược di trú dữ liệu
- Làm sạch master data (chất lượng thấp = di trú khó)
- Tốc độ quyết định thiết kế lại quy trình

### Selective
- Định nghĩa phạm vi phức tạp
- Kiểm tra tính nhất quán dữ liệu trung gian

## 📚 Công cụ chính

- **Readiness Check**: `/SDF/RC_START_CHECK` — phân tích tác động Simplification Item tự động
- **SUM (Software Update Manager)**: công cụ chính cho Brownfield
- **DMO (Database Migration Option)**: chuyển đổi DB + SW đồng thời
- **SUMCT**: Chuyển đổi Unicode (ECC non-Unicode → Unicode)
- **SAP Note Analyzer**: phân tích tác động Note của phiên bản mục tiêu

## 🇻🇳 Rủi ro bản địa hóa Việt Nam

- **Hóa đơn điện tử (NĐ 123/2020)** — Tích hợp API cơ quan thuế cần re-validate
- **VN CVI Simplification Item** — Thay đổi cấu trúc tài khoản VAT
- **Country Version Vietnam Note** — Nhiều Note đặc thù Việt Nam
- **SI nội địa** — FPT, CMC, VTI có accelerator riêng
- **Bảo vệ dữ liệu cá nhân (NĐ 13/2023)** — phân loại dữ liệu khi Selective Transition

## ⚠️ Các bước bắt buộc
1. Chạy **Readiness Check** (phân tích tác động AS-IS)
2. Chạy **Custom Code ATC** (biến thể `S4HANA_READINESS`)
3. **Mô phỏng Dual Cutover** — tối thiểu 2 chu kỳ
4. **UAT người dùng nghiệp vụ** — khuyến nghị môi trường STG

## 🤖 Agent / Command liên quan
- `agents/sap-s4-migration-advisor.md`
- `/sap-s4-readiness --auto`

## 📖 Tham khảo
- `../simplification-items.md`
- `../atc-readiness-check.md`
