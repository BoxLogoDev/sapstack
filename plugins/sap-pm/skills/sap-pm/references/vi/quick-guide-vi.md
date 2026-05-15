<!-- Claude-authored draft (community review welcome) -->

# SAP PM Hướng dẫn nhanh (Tiếng Việt)

## Thu thập thông tin môi trường
1. Phiên bản SAP (ECC EhP / S/4HANA năm)
2. Mô hình triển khai (On-Premise / RISE / Cloud PE)
3. Planning Plant (nhà máy lập kế hoạch bảo trì)
4. Ngành (sản xuất, hóa chất, năng lượng, tiện ích)

## T-code chính

### Equipment Master
| T-code | Công dụng |
|--------|------|
| IE01 | Tạo thiết bị |
| IE02 | Sửa thiết bị |
| IE03 | Xem thiết bị |
| IL01 | Tạo functional location |
| IL02 | Sửa functional location |

### Thông báo bảo trì (Notification)
| T-code | Công dụng |
|--------|------|
| IW21 | Tạo thông báo (báo hỏng) |
| IW22 | Sửa thông báo |
| IW28 | Danh sách thông báo |
| IW29 | Phân tích thông báo |

### Lệnh bảo trì (Maintenance Order)
| T-code | Công dụng |
|--------|------|
| IW31 | Tạo lệnh (phát hành lệnh công việc) |
| IW32 | Sửa lệnh |
| IW38 | Danh sách lệnh |
| IW39 | Phân tích lệnh |

### Bảo trì phòng ngừa
| T-code | Công dụng |
|--------|------|
| IP01 | Tạo kế hoạch bảo trì |
| IP10 | Lập lịch kế hoạch bảo trì |
| IP30 | Giám sát kỳ hạn |
| IA01 | Tạo task list |

### Quyết toán / KPI
| T-code | Công dụng |
|--------|------|
| KO88 | Quyết toán lệnh |
| IW65 | Đọc counter |

## Bản địa hóa Việt Nam

### Quy định an toàn lao động
- Lưu trữ lịch sử kiểm tra thiết bị (thông báo = hồ sơ kiểm tra)
- Trách nhiệm vận hành: tăng cường nghĩa vụ an toàn thiết bị
- Đưa chu kỳ kiểm định pháp định vào kế hoạch bảo trì phòng ngừa

### Quản lý thiết bị sản xuất
- Tích hợp MES: thu thập trạng thái thiết bị real-time → tự động IW21
- Ca 3: hồ sơ bàn giao thiết bị theo ca
- Bảo trì thuê ngoài: nhập service bên ngoài (vd PM10 service)

### KPI
- MTBF (thời gian trung bình giữa hỏng hóc): càng cao càng tốt
- MTTR (thời gian sửa trung bình): càng thấp càng tốt
- OEE (hiệu suất thiết bị tổng thể): khả dụng × hiệu năng × chất lượng

## Liên quan
- `../../SKILL.md` — nội dung chi tiết
- `/plugins/sap-mm/skills/sap-mm/SKILL.md` — vật tư/phụ tùng
- `/plugins/sap-co/skills/sap-co/SKILL.md` — chi phí bảo trì
