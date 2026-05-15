<!-- Claude-authored draft (community review welcome) -->

# sap-gts Hướng dẫn nhanh (Tiếng Việt)

> SAP GTS (Global Trade Services) — tóm tắt tuân thủ thương mại xuất nhập khẩu.

## 🔑 Thu thập thông tin môi trường
1. Triển khai GTS (Standalone / Embedded in S/4)
2. Có tích hợp thông quan điện tử hải quan?
3. Loại giao dịch (xuất / nhập / hai chiều)
4. Quốc gia mục tiêu FTA

## 📚 Lĩnh vực cốt lõi

### Compliance
- **SPL Screening** — rà soát danh sách cấm vận
- **Embargo Check** — quốc gia cấm vận
- **Legal Control** — yêu cầu giấy phép

### Customs
- **Tờ khai xuất khẩu** (Export Declaration)
- **Tờ khai nhập khẩu** (Import Declaration)
- **Transit** — quá cảnh / chuyển tải

### Risk
- **L/C Management** — thư tín dụng
- **Preference** — xuất xứ / FTA
- **Restitution** — hoàn thuế xuất khẩu

## 🇻🇳 Bản địa hóa Việt Nam
- **VNACCS/VCIS** (Hệ thống thông quan điện tử Tổng cục Hải quan)
- **Mã HS** — biểu thuế HS Việt Nam (8 chữ số)
- **Quản lý hàng lưỡng dụng / kiểm soát xuất khẩu**
- **Mạng FTA** — chứng nhận xuất xứ (C/O — nhiều hiệp định: CPTPP/EVFTA/RCEP...)

## 📋 T-code
- Namespace `/SAPSLL/*`
- Ví dụ: `/SAPSLL/MENU_LEGALR3`, `/SAPSLL/COMPLR3`, `/SAPSLL/PRODUCT_R3`

## ⚠️ Lưu ý
- Đăng ký chứng thư CA (STRUST) bắt buộc
- Sai mã HS → bị truy thu thuế
- Tiêu chí xuất xứ khác nhau theo từng FTA

## 🤖 Liên quan
- `/plugins/sap-sd` — xuất khẩu
- `/plugins/sap-mm` — nhập khẩu
- `/agents/sap-integration-advisor.md` — tích hợp thông quan điện tử
