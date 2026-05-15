<!-- Claude-authored draft (community review welcome) -->

# sap-ewm Hướng dẫn nhanh (Tiếng Việt)

## 🔑 Thu thập thông tin môi trường

Trước khi làm SAP EWM (Enhanced Warehouse Management) xác nhận:

### 1. Nền tảng SAP & triển khai
- **S/4HANA On-Premise**: khuyến nghị EWM 2020+
- **RISE (Private Cloud)**: EWM đầy đủ + tự cập nhật
- **Cloud Public Edition**: EWM hạn chế (chỉ cơ bản)

### 2. Kiến trúc triển khai EWM
- **Embedded**: cùng instance S/4HANA (nhỏ/vừa)
- **Decentralized**: instance độc lập + RFC (lớn, khuyến nghị > 5.000 dòng/ngày)

### 3. Quy mô & độ phức tạp DC
- Lượng ngày (dòng nhập/xuất)
- Đa storage strategy (FIFO/LIFO), cross-dock, trung tâm hoàn trả
- Độ tích hợp MM/SD/TM

### 4. Yêu cầu bản địa
- **TMĐT**: giao trong ngày/hôm sau → picking/phân loại tự động
- **Quy định**: mã hóa địa chỉ giao, chứng từ giao điện tử (kết nối đơn vị VC)
- **Vận hành**: đêm/24h → ổn định hệ thống critical

## 📚 T-code chính & vai trò

### Giám sát
| T-code | Chức năng |
|--------|------|
| **/SCWM/MON** | Dashboard giám sát tích hợp |
| **/SCWM/ACT** | Xem activity |
| **/SCWM/AREA** | Trạng thái zone & bin |

### Inbound
| T-code | Chức năng |
|--------|------|
| **/SCWM/GOODS_IN** | Nhận hàng |
| **/SCWM/PUT_AWAY** | Chỉ thị cất hàng |
| **/SCWM/PUTAWAY_MON** | Giám sát cất hàng |

Luồng: MM PO → EWM → /SCWM/GOODS_IN inbound delivery → scan + QC → /SCWM/PUT_AWAY auto-bin → RF xác nhận.

### Outbound
| T-code | Chức năng |
|--------|------|
| **/SCWM/WAVE** | Lập & chạy wave |
| **/SCWM/PICK** | Picking |
| **/SCWM/PACK** | Đóng gói & nhãn |
| **/SCWM/SHIP** | Xác nhận giao hàng |

Luồng: SD SO → EWM → /SCWM/WAVE nhóm → /SCWM/PICK (barcode) → /SCWM/PACK gợi ý thùng → /SCWM/SHIP chứng từ giao của đơn vị VC.

### RF / Mobile
| T-code | Chức năng |
|--------|------|
| **/SCWM/RFUI** | RF terminal cơ bản |
| **/SCWM/RFUI_WAVE** | RF picking (wave) |
| **/SCWM/MOBILE** | App mobile (Fiori) |

### Quyết toán / Interface
| T-code | Chức năng |
|--------|------|
| **/SCWM/PI** | Physical interface (chứng từ giao) |
| **/SCWM/TM_INTERFACE** | Kết nối Transport Management |
| **/SCWM/CONF** | Xác nhận giao + post FI |

## 🇻🇳 Bản địa hóa Việt Nam

### Vận hành trung tâm fulfillment online hằng ngày
- Sáng(06-12): tập trung nhập — /SCWM/GOODS_IN + /SCWM/PUT_AWAY (mục tiêu: nhận→bin < 2h)
- Trưa(12-17): tập trung picking — /SCWM/WAVE chia 3-4 wave, song song /SCWM/PICK + /SCWM/PACK (300-500 dòng/h)
- Tối(17-22): đơn vị VC lấy hàng — /SCWM/SHIP + /SCWM/PI (API chứng từ giao → khách theo dõi)

### Tích hợp tự động hóa
- Sorter: /SCWM/PACK chỉ thị cửa ra sorter
- AS/RS: /SCWM/PUT_AWAY tự phân bổ bin

### Trung tâm hoàn trả
- /SCWM/GOODS_IN (bin khu hoàn trả riêng) → QC → xuất lại or loại bỏ
- Tỷ lệ hoàn trả TMĐT cao (sau sale) → theo dõi riêng là thiết yếu

### Quyền riêng tư địa chỉ
- Mã hóa địa chỉ giao; đội picking chỉ thấy số chứng từ giao
- Xóa địa chỉ sau thời gian lưu trữ

## ⚠️ Embedded vs Decentralized

| | Embedded | Decentralized |
|---|---|---|
| Ưu | đơn giản, chi phí thấp | throughput cao, độc lập, dễ mở rộng |
| Nhược | tải hệ thống cao, giới hạn mở rộng | cấu hình phức tạp, quản lý RFC |
| Khuyến nghị | DC < 2.000 dòng/ngày | DC > 5.000 dòng/ngày |

Kiến trúc tham chiếu: S/4HANA (Core) → RFC/OData → EWM (Decentralized) → API/EDI → TM → Sorter/RF/hệ thống VC.

## Vấn đề thường gặp

| Triệu chứng | Nguyên nhân | Chẩn đoán | Khắc phục |
|------------|------------|-----------|-----------|
| Picking trễ (wave ùn) | thiếu bin/bố trí item | /SCWM/MON | tối ưu put-away (FIFO) |
| Chứng từ giao chưa liên kết | /SCWM/PI lỗi/API VC | log /SCWM/PI | kiểm tra API VC |
| Lỗi RF (không thấy hàng) | dữ liệu scan lệch | log RF | kiểm tra lại barcode |
| Lệch tồn | chưa xác nhận nhập/xuất | /SCWM/MON | cycle count |
| Giảm hiệu năng | lượng > năng lực | tab perf /SCWM/MON | chỉnh wave/scale |

## 📊 KPI
- Throughput nhập (100-200/h)
- Độ chính xác picking (lỗi /SCWM/PICK < 0.5%)
- Thời gian giao (đơn → chứng từ giao < 30 phút)
- Độ chính xác tồn (> 99.5%)
- Khả dụng hệ thống (99.9% SLA)

## Chi tiết luồng (Process Flows)

Inbound:
```
MM PO → EWM tự chuyển
/SCWM/GOODS_IN: đăng ký inbound delivery
scan + QC → bất thường thì chỉ thị trả hàng
/SCWM/PUT_AWAY: tự phân bổ bin → RF xác nhận
```

Outbound:
```
SD SO → EWM tự chuyển
/SCWM/WAVE: nhóm thành 3-4 wave
/SCWM/PICK: picking (barcode) → RF scan xác nhận
/SCWM/PACK gợi ý thùng → /SCWM/SHIP chứng từ giao
```

Công việc RF:
```
1. Đăng nhập → chọn loại việc (GOODS_IN/PICK/PACK)
2. Scan barcode sản phẩm hoặc nhập vị trí
3. Hệ thống so số lượng dự kiến → xác nhận hoặc cảnh báo
4. Xác nhận: nút RF → server cập nhật tức thì
```

Vận hành hằng ngày:
```
06-12 Nhập: /SCWM/GOODS_IN + /SCWM/PUT_AWAY
12-17 Picking: /SCWM/WAVE + /SCWM/PICK + /SCWM/PACK
17-22 Giao: /SCWM/SHIP + /SCWM/PI đơn vị VC lấy hàng
```

Kiến trúc tham chiếu:
```
S/4HANA (Core) → RFC/OData
  → EWM (Decentralized) → API/EDI
  → TM → Sorter / RF / hệ thống VC
```

Hoàn trả:
```
Khách trả → /SCWM/GOODS_IN (bin khu hoàn trả)
QC → tốt: xuất lại / lỗi: loại bỏ hoặc trả NSX
Theo dõi /SCWM/MON; xóa địa chỉ sau thời hạn lưu
```

## Liên quan
- `../../SKILL.md` — hướng dẫn EWM đầy đủ
- `references/img/ewm-configuration.md` — thiết lập IMG
- `docs/enterprise/ewm-operations-korea.md` — hướng dẫn vận hành
