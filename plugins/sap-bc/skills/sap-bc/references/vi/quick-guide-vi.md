<!-- Claude-authored draft (community review welcome) -->

# sap-bc Hướng dẫn nhanh (Tiếng Việt)

> Góc nhìn tư vấn BC bối cảnh nội địa. Chủ đề Basis toàn cầu → xem `sap-basis`.

## 🔑 Thu thập thông tin môi trường (ưu tiên nội địa)
1. Hình thức triển khai: On-Prem / RISE / phân tách mạng (mạng đóng)
2. Bản địa hóa: CVI quốc gia / hóa đơn điện tử / e-Document
3. DB: HANA (thiết lập locale) / Oracle (NLS_LANG)
4. Ngôn ngữ SAPGUI: nội địa / EN / hỗn hợp

## 🇻🇳 Vấn đề BC bản địa Việt Nam — Top 10

### 1. Dump codepage (CONVT_CODEPAGE)
- Triệu chứng: ABAP dump `CONVT_CODEPAGE`
- Nguyên nhân: lỗi chuyển Unicode (legacy non-Unicode)
- Khắc phục: SNOTE 2452523 series, `NLS_LANG=*.AL32UTF8`

### 2. STMS import lỗi 8 (short text đa byte)
- Nguyên nhân: tên object đa byte làm hỏng parser tp
- Log: `/usr/sap/trans/log/ULOG`, `ALOG`
- Khắc phục: nâng cấp tp, chuyển đổi tp Unicode

### 3. Tích hợp hóa đơn điện tử (STRUST)
- Đăng ký **chứng thư số CA quốc gia**
- Root CA: tổ chức chứng thực nội địa
- **Bắt buộc TLS 1.2+** (hướng dẫn an ninh nội địa)
- Tăng cường Web Dispatcher `ssl/ciphersuites`

### 4. Nâng cấp Kernel môi trường phân tách mạng
1. Tải SAP Launchpad ở mạng ngoài
2. Kiểm tra hash SHA256
3. Phê duyệt đội an ninh thông tin
4. Chuyển vào qua USB mã hóa
5. Thay `/usr/sap/<SID>/SYS/exe/` mạng trong

### 5. SAPGUI lỗi font
- Patch SAPGUI 770+
- Windows "Language for non-Unicode programs"
- Kiểm tra `NLSPATH`

### 6. Tái chứng nhận quyền SOX
- Audit review role PFCG hàng quý
- SUIM / S_BCE_68001398
- Quản lý ma trận SoD (FI/MM)

### 7. SAP support nội địa (OSS)
- Mở ticket với SAP support nội địa (tiếng địa phương)
- Vấn đề bản địa qua đội support nội địa
- Priority Very High (production down) → 24/7

### 8. HANA locale
- `COLLATION` phù hợp
- CDS `@Semantics.text.languageCode`
- Khác biệt render SAPGUI vs Fiori

### 9. ChaRM workflow
- Urgent → Normal change cần tài liệu kiểm soát nội bộ
- Đường phê duyệt map theo sơ đồ tổ chức nội địa
- Chính sách bypass tự duyệt cuối tuần/lễ

### 10. Tích hợp SaaS nội địa
- SaaS kế toán nội địa — nhiều connector legacy
- Firewall/IP whitelist theo chính sách bảo mật khách hàng
- Kiểm tra log SMICM khi qua proxy

## 📚 T-code hay dùng
| T-code | Công dụng |
|--------|------|
| STRUST | Quản lý chứng chỉ SSL |
| SMICM | Giám sát ICM (HTTP) |
| STMS | Quản lý Transport |
| PFCG | Quản lý Role |
| SUIM | Hệ thống thông tin quyền |
| SU53 | Truy vết lỗi quyền |
| SM59 | RFC Destination |
| SM21 | System Log |
| ST22 | Phân tích dump |
| RZ20 | CCMS (giám sát) |

## ⚠️ Cấm tuyệt đối
- ❌ Sửa trực tiếp SE16N production (vi phạm SOX)
- ❌ STMS forced import (tp -i ignore)
- ❌ Lưu chứng thư CA dạng file OS (dùng STRUST)
- ❌ Nâng Kernel không backup + test khởi động lại

## 📖 Liên quan
- `../../SKILL.md` — nội dung chi tiết
- `sap-basis` — chủ đề Basis toàn cầu
- `sap-s4-migration` — chuyển đổi Kernel/Unicode
