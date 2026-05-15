<!-- Claude-authored draft (community review welcome) -->

# sap-abap Hướng dẫn nhanh (Tiếng Việt)

> Tham khảo nhanh cho phát triển SAP ABAP. Chi tiết đầy đủ ở `SKILL.md` và `references/clean-core-patterns.md`.

## 🔑 Thu thập thông tin môi trường

1. Nền tảng ABAP (Phiên bản ECC / Năm phát hành S/4HANA)
2. Phạm vi phát triển HANA-native (CDS, AMDP, RAP)
3. Biến thể kiểm tra ATC đã cấu hình

## 📚 Chủ đề phát triển cốt lõi

### Nguyên tắc Clean Core
- Không bao giờ sửa trực tiếp các đối tượng SAP chuẩn
- Sử dụng **BAdI** / **Enhancement Point** / **CDS View mở rộng**
- Việc sử dụng Access Key là **dấu hiệu cảnh báo** (audit trail)

### SQL tối ưu cho HANA
- ❌ `SELECT * FROM ...`
- ✅ Chỉ chọn cột cần thiết + `INTO TABLE`
- Lưu ý với `FOR ALL ENTRIES`:
  - Kiểm tra bảng rỗng trước khi sử dụng
  - Khử trùng lặp với `SORT ... DELETE ADJACENT DUPLICATES`
  - Lookup nhỏ → dùng **JOIN** thay thế
- **Push-down** — chuyển logic xuống HANA qua CDS View, AMDP

### CDS Views
- **@ObjectModel.text.element** — văn bản độc lập ngôn ngữ
- **@Semantics.amount.currencyCode** — chú thích trường tiền tệ
- **@EndUserText.label** — hỗ trợ i18n

### RAP (RESTful ABAP Programming)
- Business Object → Service Definition → Service Binding
- Behavior Implementation
- Tự động sinh Fiori Elements

### Phân tích hiệu năng
- **ST05** — SQL Trace
- **SAT** — Phân tích runtime (kế thừa SE30)
- **ST22** — Phân tích dump
- **SM50 / SM66** — Giám sát Work Process

## 🇻🇳 Bản địa hóa Việt Nam

- **Hóa đơn điện tử (Nghị định 123/2020)** — Tích hợp với cơ quan thuế qua API
- **Mã số thuế** validation 10/13 ký tự
- **UTF-8 tiếng Việt** — xử lý dấu tổ hợp (Unicode normalization)
- **Lớp thông báo tiếng Việt** thiếu bản dịch gây MESSAGE_TYPE_X

## ⚠️ Cấm tuyệt đối

- ❌ Sửa đổi đối tượng SAP chuẩn (vi phạm Clean Core)
- ❌ Chạy SE38 trực tiếp ở môi trường production (trừ report whitelist)
- ❌ Thiếu `AUTHORITY-CHECK` (rủi ro kiểm toán)
- ❌ Nối chuỗi input người dùng vào Dynamic SQL (SQL Injection)

## 🤖 Ủy quyền review code
```
/sap-abap-review <đường dẫn file hoặc tên object>
```
→ Sub-agent `sap-abap-developer` review theo chuẩn Clean Core + HANA + ATC

## 📖 Tham khảo
- `../clean-core-patterns.md`
- `../code-review-checklist.md`
