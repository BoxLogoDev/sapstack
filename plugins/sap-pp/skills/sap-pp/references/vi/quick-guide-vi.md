<!-- Claude-authored draft (community review welcome) -->

# sap-pp Hướng dẫn nhanh (Tiếng Việt)

## 🔑 Thu thập thông tin môi trường
1. Phương thức sản xuất (Discrete / Process / Repetitive / KANBAN)
2. Phương thức MRP (Classic MRP / MRP Live — S/4)
3. Plant và tổ chức sản xuất (user cung cấp)

## 📚 Điểm cốt lõi

### Master Data
- **CS01/CS02**: BOM (định mức vật tư)
- **CA01/CA02**: Routing (trình tự công đoạn)
- **CR01/CR02**: Work Center
- **MD04**: Danh sách Stock/Requirements

### MRP
- **MD01**: MRP Run (toàn nhà máy — thường không khuyến nghị)
- **MD02**: MRP Run (một vật tư)
- **MD03**: MRP Run (một vật tư đa cấp)
- **MD41/MD43**: Planning Evaluation
- S/4HANA: **MRP Live** (CDS + HANA push-down)

### Production Orders
- **CO01/CO02**: Tạo/sửa lệnh sản xuất
- **CO11N**: Xác nhận (Confirmation)
- **CO15**: Hủy xác nhận
- **COGI**: Xử lý danh sách auto-GR thất bại

### Repetitive Manufacturing
- **MFBF**: Backflush
- **MF50**: Planning Table

## 🇻🇳 Bản địa hóa Việt Nam
- **Khu vực sản xuất trọng điểm** — PP là module cốt lõi
- **Gia công ngoài** (Subcontracting) phức tạp — phân biệt nhận/giao gia công
- **Kiểm soát giao hàng** yêu cầu nghiêm ngặt (chuẩn nhà cung cấp OEM)

## ⚠️ Lưu ý
- MRP toàn nhà máy (MD01) chỉ chạy **ngoài giờ vận hành**
- Sau khi đổi BOM phải tính lại Low-level code (**OMIW**)
