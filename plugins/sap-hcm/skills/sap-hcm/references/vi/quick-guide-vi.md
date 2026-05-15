<!-- Claude-authored draft (community review welcome) -->

# sap-hcm Hướng dẫn nhanh (Tiếng Việt)

## 🔑 Thu thập thông tin môi trường
1. Triển khai HCM (ECC HCM / H4S4 / SuccessFactors hybrid)
2. Phiên bản Payroll theo quốc gia
3. Có tích hợp FI Posting?

## 📚 Điểm cốt lõi

### Personnel Administration
- **PA30**: Bảo trì infotype
- **PA40**: Hành động nhân sự (tuyển/nghỉ/thăng chức)
- Infotype chính:
  - 0001 (gán tổ chức), 0002 (thông tin cá nhân), 0006 (địa chỉ)
  - 0008 (lương cơ bản), 0014 (khấu trừ định kỳ), 0015 (một lần)

### Time Management
- **PT60**: Time Evaluation
- **PT01**: Work Schedule Rule
- **CAT2**: Nhập chấm công

### Payroll (theo quốc gia)
- **PC00_M{cc}_CALC**: Tính lương
- **PC00_M{cc}_CDTA**: Sinh dữ liệu chi trả
- **PC00_M{cc}_CEDT**: Phiếu lương
- Khai thuế: driver khấu trừ theo quốc gia

### FI Posting
- **PC00_M99_CIPE**: Lương → post FI

## 🇻🇳 Bản địa hóa Việt Nam
- **Số CCCD/CMND** masking bắt buộc (NĐ 13/2023 bảo vệ dữ liệu cá nhân)
- **Bảo hiểm bắt buộc** (BHXH/BHYT/BHTN) tự động tính
- **Quyết toán thuế TNCN** — quy trình payroll chuẩn Việt Nam
- **Biểu thuế lũy tiến TNCN** cập nhật theo lịch cơ quan thuế
- **Trợ cấp thôi việc / hưu trí** xử lý

## ⚠️ Lưu ý
- Truy cập dữ liệu cá nhân giới hạn nghiêm qua **PFCG P_ORGIN**
- **Cấm sửa payroll production** — bắt buộc dev → QA → prod transport
- Mùa quyết toán thuế đầu năm → chuẩn bị tải đồng thời tăng đột biến
