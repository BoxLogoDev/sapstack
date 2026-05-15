<!-- Claude-authored draft (community review welcome) -->

# sap-tr Hướng dẫn nhanh (Tiếng Việt)

## 🔑 Thu thập thông tin môi trường
1. Phiên bản SAP + TRM (Treasury Risk Management) có kích hoạt?
2. Tiền tệ giao dịch (VND/USD/JPY ...)
3. Phương thức kết nối ngân hàng (MT940 / H2H / SaaS)

## 📚 Điểm cốt lõi

### Cash Management
- **FF7A**: Vị thế tiền mặt
- **FF7B**: Dự báo thanh khoản
- **FLQDB / FLQITEM**: Master Liquidity Item
- Upload sao kê ngân hàng: **FF_5**, **FEBAN**

### Payment
- **F110**: Chạy thanh toán (dùng chung với FI)
- **DMEE**: Định dạng phương tiện thanh toán (theo ngân hàng)
- **FI12 / BAM (S/4)**: Quản lý House Bank

### Kết nối ngân hàng
- Ngân hàng lớn thường có **định dạng firm-banking riêng**
- Nhiều trường hợp dùng **XML/EDI** thay vì MT940
- Tham chiếu chuẩn ngân hàng điện tử của tổ chức bù trừ
- Tự động ghi nợ, tài khoản ảo thường cần tùy chỉnh

### TRM (tùy chọn)
- **FTR_CREATE**: Tạo giao dịch tài chính
- Phái sinh (FX forward, IRS, CRS) kế toán phức tạp — lưu ý công bố IFRS

## 🇻🇳 Bản địa hóa Việt Nam
- **Dự báo thanh khoản VND** là use case phổ biến nhất
- Nhiều dự án lấy nguồn tỷ giá ngoài (tỷ giá NHNN/thị trường)
- **Báo cáo ngoại hối**: nghĩa vụ báo cáo giao dịch xuyên biên giới theo ngưỡng

## ⚠️ Lưu ý
- Đổi House Bank môi trường production bắt buộc Transport + mô phỏng
- Môi trường test MT940 bắt buộc — cấm first-try trên production
