<!-- Claude-authored draft (community review welcome) -->

# sap-btp Hướng dẫn nhanh (Tiếng Việt)

> Tham khảo nhanh cho SAP Business Technology Platform. Chi tiết đầy đủ ở `SKILL.md` và `references/cap-patterns.md`.

## 🔑 Thu thập thông tin môi trường

1. BTP runtime (Cloud Foundry / Kyma / ABAP Environment)
2. Khu vực (cân nhắc độ trễ)
3. Loại subscription (Free / Trial / Standard / Enterprise)

## 📚 Khối xây dựng cốt lõi

### CAP (Cloud Application Programming)
- **cds init** — khởi tạo project
- **db/schema.cds** — model dữ liệu
- **srv/*.cds** — định nghĩa service
- **srv/*.js** — logic tùy chỉnh
- Tự động sinh Fiori Elements

### Fiori / UI5
- Cấu hình **Launchpad**
- Service binding **OData V2 / V4**
- Hỗ trợ i18n qua resource bundle

### Integration Suite
- **Thiết kế iFlow** — Open Connectors, Cloud Integration
- Adapter chính: HTTP/REST, SFTP, SOAP, OData, IDoc
- **API Management** — giới hạn tốc độ, áp dụng policy

### Security
- **XSUAA** — xác thực/phân quyền OAuth2
- **Destination Service** — kết nối hệ thống backend
- **Cloud Connector** — kết nối hệ thống on-premise

## 🇻🇳 Bản địa hóa Việt Nam

- **Khu vực Singapore (APJ)** — độ trễ tới user VN khoảng 30~60ms
- **Bảo vệ dữ liệu cá nhân (NĐ 13/2023)** — phân loại dữ liệu nhạy cảm trong BTP
- **Tích hợp Zalo / VNeID** — XSUAA custom IdP
- **Cổng thanh toán VN (VNPay, MoMo, ZaloPay)** — iFlow tùy chỉnh trong Integration Suite

## 🤖 Quy trình phát triển
1. `cds init` + modeling cục bộ
2. Git push → triển khai Cloud Foundry / Kyma
3. Đăng ký Fiori Launchpad
4. Ánh xạ role-collection XSUAA

## ⚠️ Lưu ý
- Phân tách **Cloud Foundry Space** — Dev/Test/Prod
- Bật mã hóa khi lưu credential trong **Destination**
- Thay đổi **XSUAA xs-security.json** yêu cầu redeploy

## 📖 Tham khảo
- `../cap-patterns.md`
- `../btp-security.md`
