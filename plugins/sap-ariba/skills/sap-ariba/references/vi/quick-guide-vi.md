<!-- Claude-authored draft (community review welcome) -->

# sap-ariba Hướng dẫn nhanh (Tiếng Việt)

> SAP Ariba — cloud mua sắm toàn cầu. Sourcing · Contracts · Procurement · Network (cộng tác nhà cung cấp).

## 🔑 Thu thập thông tin môi trường

1. **Phiên bản Ariba** — Sourcing / Procurement / SLP / Network?
2. **Tích hợp S/4** — CIG (Cloud Integration Gateway)
3. **Hệ sinh thái nhà cung cấp** — số NCC kết nối Ariba Network
4. **Kịch bản** — sự kiện sourcing / hợp đồng / PR-to-PO / Network

## 📚 Module

| Module | Công dụng |
|---|---|
| **Sourcing** | Mua sắm chiến lược — RFI/RFP/RFQ + e-Auction |
| **Contracts** | Quản lý hợp đồng — template·redline·gia hạn |
| **Procurement** | Mua hàng — catalog·PR·PO·invoice |
| **SLP** | Vòng đời NCC — đủ điều kiện·rủi ro |
| **Spend Analysis** | Phân loại chi tiêu·theo dõi tiết kiệm |
| **Network** | Cộng tác NCC — trao đổi chứng từ·trạng thái |

## 🇻🇳 Bản địa hóa Việt Nam

### Luồng mua sắm
```
S/4 PR (ME51N) → Ariba sourcing (danh mục chiến lược)
   → gửi RFx → đấu thầu → trao thầu
   → tạo Ariba Contract
   → đăng ký catalog → user mua
   → S/4 PO (ME21N) → GR/IV → thanh toán
```

### Mẫu thường gặp
- **NCC nội địa**: tỷ lệ tham gia Network thấp → onboarding từng bước
- **Tập đoàn toàn cầu**: Ariba trụ sở + công ty con → catalog/hợp đồng chung
- **Đấu thầu công**: cổng chính phủ ưu tiên (Ariba là khu vực tư)

### Vấn đề tích hợp bản địa
- **VAT**: mã thuế Việt Nam → Ariba tax mapping
- **Mã số thuế doanh nghiệp**: trường tùy chỉnh trong master NCC Ariba
- **Ngân hàng/thanh toán**: mã ngân hàng VN → định dạng DMEE

## 🚨 Vấn đề thường gặp

### "NCC không nhận được RFx"
- Kiểm tra ANID (Ariba Network ID) — NCC đã onboarding?
- Kiểm tra email (thư rác)
- Kết nối Network ổn (NCC đăng nhập)

### "PR không được duyệt"
- Kiểm tra approver delegation
- Đổi phòng ban → approver không tự refresh

### "PO không gửi tới NCC"
- Trạng thái Network NCC (Trading Relationship)
- Phương thức gửi (Network / Email / cXML)
- Hàng đợi message (CIG monitor)

### "Invoice mismatch"
- 3-way match (PO-GR-Invoice)
- Mapping mã thuế
- Tỷ giá (hóa đơn ngoại tệ)

## 🔧 Chẩn đoán tích hợp

Luồng CIG (Cloud Integration Gateway):
1. S/4: ERP Integration Add-on for Ariba kích hoạt
2. CIG Worker (Cloud Connector) GREEN
3. Cấu hình Ariba Realm
4. Message mapping (Material, Vendor, PR, PO)

Khi lỗi:
- CIG monitor → Messages → phân loại theo status
- S/4 SLG1 → Application Log → CIG namespace
- Ariba Network → Buyer login → System Updates

## 📚 Tham khảo

- `references/sourcing-event-types.md` — loại RFx (TBD)
- `references/network-onboarding.md` — onboarding NCC (TBD)
- `../../../sap-mm/skills/sap-mm/SKILL.md` — tích hợp MM
- `../../../sap-fi/skills/sap-fi/SKILL.md` — VAT·thanh toán
- `../../../sap-integration-cloud/skills/sap-integration-cloud/SKILL.md` — CIG/CPI

## ⚠️ Ngoài phạm vi

- Hệ thống mua sắm không phải Ariba (SRM, Coupa, Jaggaer)
- Quản lý tồn kho chi tiết (MM)
- Cổng mua sắm công
