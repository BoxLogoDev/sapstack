<!-- Claude-authored draft (community review welcome) -->

# sap-sd Hướng dẫn nhanh (Tiếng Việt)

## 🔑 Thu thập thông tin môi trường
1. Tổ chức bán hàng / kênh phân phối / bộ phận (user cung cấp)
2. Phương thức quản lý tín dụng (ECC FD32 / S/4 FSCM UKM)
3. Phương pháp ghi nhận doanh thu (Revenue Recognition)

## 📚 Điểm cốt lõi

### Order-to-Cash
- **VA01/VA02**: Đơn bán hàng
- **VL01N**: Giao hàng (Delivery)
- **VF01**: Lập hóa đơn (Billing)
- **VF04**: Billing Due List
- **VA05**: Danh sách đơn bán hàng

### Pricing
- **V/08**: Quy trình định giá
- **VK11/VK12**: Bản ghi điều kiện
- **VOFM**: Routine (logic định giá)

### Credit Management
- **ECC**: FD32 (hạn mức tín dụng) + VKM1 (chặn đơn) + VKM3 (chặn giao hàng)
- **S/4 FSCM**: UKM_BP (credit segment) + kiểm tra rule-based
- **FD33**: Xem hạn mức

### Billing
- **VF03**: Xem chứng từ billing
- **VF11**: Hủy billing
- Copy Control: **VTFA** (Order→Billing), **VTFL** (Delivery→Billing)

## 🇻🇳 Bản địa hóa Việt Nam
- **Phát hành hóa đơn điện tử (NĐ 123/2020)** — tự động liên kết khi post VF01 (DRC hoặc bên thứ ba)
- **VAT tách/gộp** lẫn lộn — giá gộp VAT B2C có thể là yêu cầu pháp lý
- **Hóa đơn điều chỉnh** quy trình tùy chỉnh khi cần

## ⚠️ Lưu ý
- Hủy VF01 (VF11) có **điều kiện nghiêm ngặt** — lưu ý xung đột với hóa đơn điều chỉnh
- Tín dụng thường liên quan **bảo lãnh trụ sở** (doanh nghiệp lớn) → credit segment phức tạp
