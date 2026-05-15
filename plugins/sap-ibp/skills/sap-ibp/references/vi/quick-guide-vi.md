<!-- Claude-authored draft (community review welcome) -->

# sap-ibp Hướng dẫn nhanh (Tiếng Việt)

> SAP IBP (Integrated Business Planning) — nền tảng hoạch định cung/cầu cloud-native cho kỷ nguyên S/4. Kế nhiệm APO.

## 🔑 Thu thập thông tin môi trường

1. **Phiên bản IBP** — theo quý (2402 / 2308 / 2305...)
2. **Triển khai** — chỉ BTP SaaS (không on-premise)
3. **Module** — Demand / S&OP / Supply / Inventory / Response / Control Tower
4. **Tích hợp** — S/4HANA → CPI Integration Content, hoặc BW
5. **Phiên bản Excel UI** — IBP Excel Add-In trên máy planner
6. **Planning Area** — chuẩn (SAP7, SAPIBP1) hoặc tùy chỉnh

## 📚 Tổng quan module

| Module | Mục đích |
|---|---|
| **Demand** | Dự báo thống kê · demand sensing (DS) |
| **S&OP** | Sales & operations — tích hợp cầu/cung/tài chính |
| **Supply** | Chuỗi cung ứng đa cấp (heuristic/optimizer) |
| **Inventory** | Tồn kho an toàn · tối ưu tái đặt hàng |
| **Response & Supply** | ATP · phân bổ · gating |
| **Control Tower** | KPI · phát hiện bất thường |

## 🇻🇳 Bản địa hóa Việt Nam

### Mẫu dự báo nhu cầu
- **Tết Nguyên đán / cao điểm theo mùa**: đăng ký vào Time Event Master
- **Hàng hạn sử dụng ngắn**: thực phẩm/mỹ phẩm/bán dẫn → horizon ngắn
- **EOL/NPI**: mô hình hóa Product Lifecycle rõ ràng
- **Tách ảnh hưởng khuyến mãi**: baseline vs event lift

### Vận hành đa nhà máy
- Trụ sở + công ty con → mô hình đa quốc gia
- **Tiền tệ**: VND + USD quy đổi toàn cầu
- **Giá chuyển nhượng**: tích hợp vào S&OP (transfer pricing)

### Kịch bản thường gặp
- "Ra mắt mẫu mới → thông báo sớm cho nhà cung cấp linh kiện (release PIR)"
- "Phụ thuộc nhập khẩu nguyên liệu → phân tích kịch bản tỷ giá"
- "Yêu cầu rút ngắn lead-time → cân bằng tồn kho vs response"

## 🔧 UI / T-code chính

IBP là BTP SaaS — không có T-code SAP GUI. Thay vào đó:

| UI | Công dụng |
|---|---|
| **IBP Web UI** | Master data · cấu hình · thực thi |
| **IBP Excel Add-In** | Lập kế hoạch hằng ngày (planner) |
| **IBP App (Fiori)** | KPI di động |
| **SAP Cloud ALM** | Giám sát |

T-code phía S/4 tích hợp:
- **MD01N/MD02** — MRP (sau khi nhận PIR)
- **CO40/CO41** — chuyển đổi production order (PIR → Production Order)
- **VOFM/VFX3** — đơn bán hàng (kết quả Response & Supply)

## 🚨 Vấn đề thường gặp

### "Không sinh dự báo"
- Nguyên nhân: thiếu định nghĩa operator, lịch sử không đủ, lỗi mapping master
- Chẩn đoán:
  1. Planning Area Configuration → Forecast Model
  2. Log Planning Run (Application Job Monitor)
  3. Mapping master (Product, Location)

### "Excel UI chậm"
- Nguyên nhân: Planning View quá lớn, nhiều user đồng thời
- Khắc phục:
  1. Thu nhỏ Planning View (≤ 10K cells)
  2. Dùng batch refresh
  3. Tách view theo module

### "Tích hợp CPI lỗi"
- Nguyên nhân: lỗi message mapping, ID mismatch sau khi đổi master S/4
- Chẩn đoán: CPI tenant → Monitor → Messages → phân loại lỗi
- Khắc phục: IBP Configuration → External Codes ánh xạ lại

## 🔄 Phối hợp với PP

S/4 PP thực thi kế hoạch IBP tạo:
- **PIR (Planned Independent Requirement)** — nhu cầu → release sang S/4 PP
- **MRP Run (MD01N)** — hoạch định vật tư từ PIR
- **Chuyển đổi Production Order** — CO40/CO41

Khi lỗi, truy vết tầng nào tắc:
1. IBP → release PIR ổn? (IBP Application Job)
2. S/4 → PIR hiển thị trong MD63?
3. Kết quả chạy MRP S/4?

## 📚 Tham khảo

- `references/forecast-models.md` — so sánh model thống kê (TBD)
- `references/cpi-integration.md` — mapping message CPI (TBD)
- `../../../sap-pp/skills/sap-pp/SKILL.md` — tích hợp PP
- `../../../sap-integration-cloud/skills/sap-integration-cloud/SKILL.md` — hướng dẫn CPI

## ⚠️ Ngoài phạm vi

- Lập lịch sản xuất ngắn hạn (PP/DS, MES)
- Công cụ không phải SAP (Anaplan, o9, Kinaxis)
- Vận hành APO (đã ngừng; user APO xem hướng dẫn migration IBP)
