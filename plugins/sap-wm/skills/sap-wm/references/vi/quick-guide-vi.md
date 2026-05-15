<!-- Claude-authored draft (community review welcome) -->

# sap-wm Hướng dẫn nhanh (Tiếng Việt)

## 🔑 Thu thập thông tin môi trường

Trước khi làm SAP WM (Warehouse Management) xác nhận:

### 1. Phiên bản SAP & hỗ trợ
- **ECC 6.0**: WM hỗ trợ đầy đủ
- **S/4HANA**: WM **đã ngừng** — bắt buộc chuyển EWM

### 2. Chế độ cấu hình WM
- **Standard WM**: lưu trữ đơn giản, DC nhỏ
- **Lean WM**: chức năng nâng cao, DC lớn

### 3. Cấu hình barcode/RF
- Dùng RF terminal
- Máy in barcode & chính sách nhãn
- Phụ thuộc mạng di động

### 4. Môi trường logistics
- **Giao hàng TMĐT**: B2C lượng ngày lớn
- **Phân phối B2B**: nhập/xuất hàng loạt
- **Trung tâm hoàn trả**: trả hàng + kiểm tra chất lượng

## 📚 T-code chính & vai trò

### Inbound (Nhập)
| T-code | Chức năng |
|--------|------|
| **LT01** | Nhập hàng (Goods Receipt) |
| **LT04** | Trạng thái nhập |
| **LT03** | Hủy/sửa nhập |

Luồng: tham chiếu PO → nhập/scan số lượng → gợi ý bin → xác nhận (cập nhật tồn tức thì).

### Storage (Lưu trữ)
| T-code | Chức năng |
|--------|------|
| **LS01N** | Tổng quan tồn kho |
| **LS01** | Tồn theo bin |

LS01N: tồn real-time theo bin, theo dõi hàng lỗi, cảnh báo hàng chậm luân chuyển.

### Outbound (Xuất)
| T-code | Chức năng |
|--------|------|
| **LB01** | Tạo danh sách picking |
| **LI01N** | Xuất hàng (Goods Issue) |
| **LI04** | Trạng thái xuất |

Luồng: tham chiếu SO → LB01 chỉ thị picking (có barcode) → pick + scan xác nhận → LI01N xuất cuối → FI giảm tồn.

## 🇻🇳 Bản địa hóa Việt Nam

### Vận hành DC online hằng ngày
- Lượng ngày: trung tâm fulfillment lớn
- Sáng nhập (LT01) + chuẩn bị picking (LB01) → chiều picking + xuất (LI01N) → tối đơn vị vận chuyển lấy hàng + chốt

### Vận hành barcode/RF
- Tự in barcode khi nhập → dán vào bin
- RF terminal: đội kho scan picking/xuất real-time
- Độ tin cậy mạng: vùng WiFi yếu có thể cần offline mode

### Xử lý hoàn trả
- Quy trình: khách trả → nhập → kiểm tra chất lượng → xuất lại hoặc loại bỏ
- Bin khu hoàn trả riêng, theo dõi qua LS01N
- Tỷ lệ hoàn trả TMĐT cao → xử lý WM hiệu quả là thiết yếu

## ⚠️ WM vs EWM & chuyển đổi

| Mục | WM (ECC) | EWM (S/4HANA) |
|-----|---------|--------------|
| Hỗ trợ | ✓ (ECC EOL ~2027) | ✓ (khuyến nghị) |
| Khả năng mở rộng | trung bình | cao (đa kho) |
| Barcode/RF | cơ bản | nâng cao (DAS, mobile) |
| Mobile app | hạn chế | đầy đủ |
| Tích hợp | MM/SD | MM/SD/TM đầy đủ |

Chuyển đổi: ECC+WM → S/4HANA+EWM khuyến nghị (dự án 6-12 tháng, đào tạo lại đội).

## Vấn đề thường gặp

| Triệu chứng | Nguyên nhân | Chẩn đoán | Khắc phục |
|------------|------------|-----------|-----------|
| Nhập trễ | lỗi bin/phân bổ | log LT01 | cấu hình lại storage strategy |
| Sót xuất | LI01N chưa xác nhận | LI04 | xác nhận hàng loạt |
| Lỗi barcode | pin/mạng RF | log terminal | kiểm tra WiFi, sạc |
| Lệch tồn | chưa xác nhận nhập/xuất | LS01N vs thực tế | cycle count |

## 📊 KPI
- Throughput nhập (LT01 số ngày)
- Độ chính xác xuất (tỷ lệ lỗi LI01N, mục tiêu < 1%)
- Độ chính xác tồn (LS01N vs thực tế, mục tiêu < 0.5%)

## Chi tiết luồng (Process Flows)

Nhập (LT01):
```
1. Nhập chứng từ (tham chiếu PO)
2. Nhập/scan số lượng nhận
3. bin tự gợi ý hoặc thủ công
4. Xác nhận → cập nhật master tồn tức thì
```

Xuất (LB01 → LI01N):
```
1. Tham chiếu SO hoặc tạo thủ công
2. LB01: chỉ thị picking (barcode)
3. Kho: pick + scan barcode xác nhận
4. LI01N: xuất cuối → FI giảm tồn
```

Vận hành hằng ngày:
```
Sáng: nhập (LT01) + chuẩn bị picking (LB01)
Chiều: thực hiện picking + xuất (LI01N)
Tối: đơn vị VC lấy hàng + chốt
```

Chuyển đổi S/4HANA:
```
Hiện tại: ECC 6.0 + WM
Lựa chọn 1: giữ ECC (đến ~2027 EOL) — rủi ro: không công nghệ mới
Lựa chọn 2: S/4HANA + EWM (khuyến nghị) — dự án 6-12 tháng
```

## Liên quan
- `../../SKILL.md` — hướng dẫn WM đầy đủ
- `docs/enterprise/wm-ewm-migration.md` — chuyển đổi S/4HANA
- `references/img/wm-configuration.md` — thiết lập IMG
