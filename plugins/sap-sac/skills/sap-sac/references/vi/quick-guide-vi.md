<!-- Claude-authored draft (community review welcome) -->

# sap-sac Hướng dẫn nhanh (Tiếng Việt)

> SAP Analytics Cloud — nền tảng BI/lập kế hoạch/dự báo tích hợp trên cloud.

## 🔑 Thu thập thông tin môi trường

1. **Region tenant** — kr/eu/us/ap?
2. **Phiên bản** — BI / Planning / Smart Predict?
3. **Kiểu kết nối** — Live (HANA · S4 CDS) vs Import (Datasphere · file)
4. **Nguồn dữ liệu** — S/4HANA / BW / Datasphere / DB ngoài
5. **Use case** — Story / Analytic App / Planning / Predict

## 📚 Khái niệm cốt lõi

| Mục | Ý nghĩa |
|---|---|
| Live Connection | Query thời gian thực (không sao chép dữ liệu) |
| Import Connection | Nạp định kỳ (giữ bản sao) |
| Story | Dashboard (kéo-thả) |
| Analytic Application | App lập trình được (JS) |
| Planning Model | Nhập liệu · version · phân bổ |
| Predictive Model | Hồi quy · phân loại · chuỗi thời gian |

## 🇻🇳 Bản địa hóa Việt Nam

### Kịch bản thường gặp
- **Dashboard lãnh đạo**: thẻ KPI + drill-down (tháng/quý/năm)
- **Báo cáo tài chính**: Planning Model + S/4 actuals + so sánh ngân sách
- **Phân tích bán hàng**: Geo Map + ma trận khách hàng·sản phẩm
- **Dự báo nhu cầu**: Smart Predict + tích hợp IBP
- **Báo cáo khu vực công**: nơi lưu trú dữ liệu/phân tách mạng, masking

### UI bản địa
- Tiêu đề/nhãn/text Story có thể bản địa hóa
- Tên Dimension nên để tiếng Anh (tương thích cross-tenant)
- Định dạng ngày: chuẩn khu vực (YYYY-MM-DD)

## 🚨 Vấn đề thường gặp

### "Màn hình Story trống"
- Kiểm tra quyền: Story → Sharing → Role
- Kiểm tra quyền model: Modeler permission
- Kiểm tra Filter: thành viên có đổi không

### "Số liệu không khớp S/4"
- Khác biệt Live vs Import (thời điểm cache)
- Quy đổi tiền tệ/đơn vị
- Biến thể năm tài chính (K4 vs K1)

### "Kết nối Live lỗi"
- Cloud Connector GREEN
- Chứng chỉ TLS (STRUST) hết hạn
- Cấu hình BTP destination

### "Planning không lưu được"
- Trạng thái version (Public Locked?)
- Thiết lập Dimension Lock
- Thiếu quyền write

## 🔧 Mẫu khuyến nghị

### Tích hợp S/4 → SAC
1. S/4: expose Released CDS View (`I_*`)
2. Cấu hình BTP Cloud Connector
3. SAC: Live Connection → Cloud Connector
4. Tạo Model từ CDS View trong Story

### Mô hình hóa dữ liệu
- Time Dimension: phân cấp quý/tháng/tuần/ngày
- Currency/Unit conversion
- Account dimension: quy tắc dấu (Income vs Expense)

## 📚 Tham khảo

- `references/connectivity-guide.md` — mẫu kết nối (TBD)
- `references/planning-best-practices.md` — best practice Planning (TBD)
- `../../../sap-btp/skills/sap-btp/SKILL.md` — môi trường BTP
- `../../../sap-cloud/skills/sap-cloud/SKILL.md` — tích hợp Cloud PE

## ⚠️ Ngoài phạm vi

- Thiết kế dataflow BW (BW/4HANA)
- Mô hình hóa Datasphere (sap-integration-cloud)
- Công cụ BI không phải SAC (Tableau, Power BI)
