<!-- Claude-authored draft (community review welcome) -->

# sap-cloud Hướng dẫn nhanh (Tiếng Việt)

> SAP S/4HANA Cloud Public Edition (Cloud PE) — bắt buộc Clean Core, mở rộng Key User, phát hành theo quý.

## 🔑 Thu thập thông tin môi trường
1. **Phiên bản Cloud PE** — 2401/2402/2403/2405 (phát hành tháng/năm)
2. **Extension Tier** — Tier 1 (Key User) / Tier 2 (Side-by-Side BTP) / Tier 3 (On-Stack ABAP Cloud)
3. **Triển khai** — chỉ Cloud PE (cấm on-prem SE38/SE80/SMOD/CMOD)
4. **Change Control** — giai đoạn Fit-to-Standard vs Operations

## 📚 Điểm cốt lõi

### Nguyên tắc Clean Core (không thương lượng)
- Không sửa code/bảng chuẩn SAP
- Không Transport (TMS/tp) → upload trực tiếp Cloud ALM (CSP)
- Mở rộng chỉ qua mô hình 3-Tier

### Key User Extensibility (Tier 1)
- **Custom Fields**: Manage Your Solution → Custom Fields (kích hoạt tức thì)
- **Custom Logic**: ABAP Cloud (RAP) — entry point thân thiện Key User
- **Custom CDS Views**: phân tích chỉ đọc
- **Custom Business Objects**: RAP BO

### Fit-to-Standard
- Thích ứng quy trình chuẩn — chỉ gap mới thành Tier 1/2/3
- Workshop → quyết định scope → cấu hình CBC

### Cloud ALM
- Lifecycle triển khai/vận hành (thay Solution Manager)
- Đường deploy CSP (Custom Software Package)

## 🇻🇳 Bản địa hóa Việt Nam
- **Phát hành theo quý bắt buộc** — không né được nâng cấp; review FSD trước
- **Bản địa hóa** — kiểm tra hóa đơn điện tử / CVI quốc gia có trong scope chuẩn Cloud PE
- **Đào tạo Clean Core** — chuyển từ phát triển Z tùy chỉnh sang Key User extensibility

## 🚨 Vấn đề thường gặp

### "Không có T-code chuẩn"
- Nguyên nhân: Cloud PE cấm SE38/SE80/SMOD/CMOD
- Khắc phục: thay bằng Key User Extensibility (Custom Logic/Fields)

### "Custom hỏng sau phát hành quý"
- Nguyên nhân: dùng API deprecated
- Khắc phục: review FSD trước + test hồi quy Q-system

## ⚠️ Cấm tuyệt đối
- ❌ Giả định T-code on-prem (SE38/SE80/SMOD/CMOD/SE16N)
- ❌ Sửa đối tượng chuẩn (vi phạm Clean Core)
- ❌ Cố né phát hành theo quý

## 📖 Liên quan
- `../../SKILL.md` — nội dung chi tiết
- `../img/fit-to-standard.md` / `../img/key-user-extensibility.md`
- `sap-btp` — Tier 2 Side-by-Side
- `sap-s4-migration` — chuyển On-Prem → Cloud PE
