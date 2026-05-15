<!-- Claude-authored draft (community review welcome) -->

# sap-integration-cloud Hướng dẫn nhanh (Tiếng Việt)

> Nền tảng tích hợp SAP BTP — Integration Suite (CPI) + Datasphere + API Management + Event Mesh + Open Connectors.

## 🔑 Thu thập thông tin môi trường

1. **Phạm vi tích hợp** — CPI / Datasphere / API Mgmt / Event Mesh?
2. **Source/Target** — S/4 / SuccessFactors / Ariba / hệ thống ngoài?
3. **Giao thức** — REST / SOAP / OData / IDoc / SFTP / JDBC?
4. **Xác thực** — OAuth / Basic / Cert / SAML?

## 📚 Thành phần cốt lõi

### Integration Suite
| Thành phần | Công dụng |
|---|---|
| **CPI** | Cloud Integration (cũ HCI) — định tuyến/biến đổi message iFlow |
| **API Mgmt** | Gateway · throttling · bảo mật |
| **Event Mesh** | messaging pub/sub |
| **Open Connectors** | Connector dựng sẵn không phải SAP |

### Datasphere
- Trước đây là DWC (Data Warehouse Cloud)
- Space (cô lập) + Local Table + View + Federation
- Data Provisioning Agent kết nối on-prem

## 🇻🇳 Bản địa hóa Việt Nam

### Mẫu thường gặp

#### Tích hợp hệ thống chính phủ
- **Hóa đơn điện tử (NĐ 123/2020)**: CPI iFlow + chứng thư số CA
- **EDI bảo hiểm xã hội**: SFTP + chuẩn chính phủ
- **Cổng cơ quan thuế**: API riêng + xác thực

#### Tích hợp ngân hàng
- **Phân tích MT940**: chuẩn bù trừ + dialect từng ngân hàng
- **Sinh file chuyển khoản**: định dạng DMEE + mã ngân hàng VN

#### Tích hợp nội bộ
- **Trụ sở ↔ công ty con**: hợp nhất dữ liệu đa quốc gia (Datasphere)
- **ERP cũ ↔ S/4**: hybrid trong giai đoạn migration

### Môi trường phân tách mạng
- Cloud Connector + DMZ Proxy
- Liên lạc ngoài qua security gateway
- Chứng chỉ: STRUST (S/4) + BTP Keystore

## 🚨 Vấn đề thường gặp

### "iFlow không xử lý message"
- Trạng thái Sender adapter (REST·SFTP·OData)
- Lịch polling
- Chứng chỉ hết hạn
- Định dạng message (schema không khớp)
→ Monitor → Messages → kiểm tra theo status

### "Lỗi mapping"
- Schema Source/Target không khớp
- Thiếu trường bắt buộc
- Chuyển kiểu (String → Integer)
- Cú pháp Groovy script

### "Tràn bộ nhớ"
- Payload lớn (10MB+ một message)
- Khuyến nghị thêm Splitter
- Dùng chế độ streaming

### "Chứng chỉ hết hạn"
- Xác định chứng chỉ sắp hết hạn trong BTP Keystore
- Bắt đầu gia hạn trước 30 ngày
- Quy trình riêng của CA nội địa

### "Cloud Connector không kết nối"
- Firewall cổng 443 outbound
- Region endpoint (kr/eu/us)
- Mapping Virtual Host (internal vs external)

## 🔧 Mẫu khuyến nghị

### Đồng bộ S/4 → SuccessFactors
1. Expose S/4 ABAP CDS view
2. CPI iFlow: S/4 OData → mapping → SFSF OData
3. SFSF write API
4. Error → cảnh báo email/Slack + Reprocess

### Phân tích file ngân hàng MT940
1. SFTP polling (Sender adapter)
2. MT940 → XML (Standard adapter)
3. Mapping → S/4 FF.5 input
4. RFC call tới S/4

### Datasphere → SAC
1. Thiết kế analytic model trong Datasphere Space
2. SAC Live Connection
3. Consume model trong Story

## 📚 Tham khảo

- `references/iflow-patterns.md` — mẫu thiết kế iFlow (TBD)
- `references/datasphere-modeling.md` — mô hình hóa Datasphere (TBD)
- `../../../sap-btp/skills/sap-btp/SKILL.md` — môi trường BTP
- `../../../sap-sac/skills/sap-sac/SKILL.md` — tích hợp SAC
- `../../../sap-sfsf/skills/sap-sfsf/SKILL.md` — tích hợp SFSF

## ⚠️ Ngoài phạm vi

- Kho dữ liệu BW/4HANA on-prem (BW)
- iPaaS không phải SAP (Boomi, MuleSoft, Workato)
- PO/PI (tích hợp SAP cũ — ngừng dùng; migrate sang CPI)
