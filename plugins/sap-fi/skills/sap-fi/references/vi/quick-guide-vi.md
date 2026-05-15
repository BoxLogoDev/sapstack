<!-- Claude-authored draft (community review welcome) -->

# sap-fi Hướng dẫn nhanh (Tiếng Việt)

> Tham khảo nhanh SAP FI (Kế toán tài chính). Chi tiết đầy đủ trong `SKILL.md` và `references/closing-checklist.md`.

## 🔑 Thu thập thông tin môi trường

1. SAP release (ECC 6.0 EhPx / S/4HANA 19xx-23xx)
2. Mô hình triển khai (on-premise / RISE / Cloud PE)
3. Biến thể năm tài chính (K4 năm dương lịch hoặc tùy chỉnh)
4. Mã công ty (người dùng cung cấp — không giả định)
5. Mã thông báo lỗi + T-code nơi xảy ra

## 📚 Mô-đun cốt lõi

### AP — Phải trả nhà cung cấp
- Lỗi hạch toán **FB60 / MIRO**:
  - Mã thuế chưa gán → kiểm tra **FTXP**
  - Vượt dung sai → **OMR6** giới hạn theo mã công ty
  - Sai khớp IV theo GR → so sánh PO item Invoice tab với số lượng nhập kho
- Chạy thanh toán **F110**:
  - Thiếu phương thức thanh toán (LFB1-ZWELS)
  - Ngân hàng chưa xác định → **FBZP**
  - Tệp DME chưa tạo → **DMEE** theo phương thức thanh toán
- Khấu trừ thuế (mở rộng) — **WTAD** + gán SPRO

### AR — Phải thu khách hàng
- **FD32** (ECC) / **UKM_BP** (S/4 FSCM): quản lý tín dụng
- **F150** đòi nợ → **FBMP** quy trình đòi nợ
- **VKM1 / VKM3**: giải phóng đơn hàng / giao hàng bị khóa tín dụng
- Ứng trước: **F-37** (yêu cầu), **F-29** (hạch toán), **F-39** (xóa nợ)

### GL — Sổ cái
- Xung đột trạng thái trường — ba nguồn: **OBC4** (loại chứng từ) + **OB14** (mã hạch toán) + **FS00** (tài khoản)
- Đánh giá ngoại tệ — **FAGL_FC_VAL** (luôn chạy Test Run trước)
- Đối trừ tự động — **F.13** (Test Run trước)
- Chuyển số dư — **F.16** (ECC) / **FAGLGVTR** (New G/L)

### AA — Kế toán tài sản
- Chạy khấu hao — **AFAB**
- Chuyển tài sản — **ABUMN**
- Đóng năm — **AJAB**

## 🚨 Vấn đề thường gặp

### "FB01 không thể hạch toán vào tài khoản đối chiếu nhà cung cấp"
- Nguyên nhân: LFB1-AKONT là tài khoản đối chiếu
- Giải pháp: Dùng **FB60** (hóa đơn nhà cung cấp) hoặc Special G/L (F-47/F-48). FB01 không thể hạch toán trực tiếp vào tài khoản đối chiếu.

### "F110 không chọn được mục nào"
- Nhà cung cấp thiếu phương thức thanh toán (XK03 → LFB1.ZWELS trống)
- Hoặc mục chưa đến hạn — kiểm tra ngày đến hạn
- Hoặc mã công ty chưa kích hoạt trong run thanh toán

### "Không khớp mã thuế trong MIRO"
- Mã thuế bị vô hiệu hóa hạch toán (FTXP)
- Quy trình thuế theo mã công ty đã thay đổi
- Đảo + nhập lại với mã đúng

### "Kỳ kế toán đã đóng — không thể hạch toán"
- OB52 → điều chỉnh nhóm phân quyền (không mở kỳ trước tùy tiện)
- Đối chiếu trạng thái chuyển số dư cuối năm (F.16 / FAGLGVTR)

## 🔧 Bảng T-code chính

| Lĩnh vực | T-code |
|---|---|
| Hạch toán chứng từ | FB01, FB50, FB60, FB70 |
| Hiển thị chứng từ | FB03 |
| Chi tiết GL | FBL3N, FAGLB03 (số dư) |
| Chi tiết nhà cung cấp | FBL1N |
| Chi tiết khách hàng | FBL5N |
| Thanh toán | F110, F-58 |
| Đóng sổ | F.05, F.13, F.16, FAGL_FC_VAL, FAGLGVTR |
| Kỳ | OB52 |
| Cấu hình | FBZP, FBMP, FTXP, OMR6, OBYC |

## ECC vs S/4HANA điểm chính

- **GL**: BSEG/BKPF → ACDOCA (Universal Journal trong S/4)
- **AR Tín dụng**: FD32 → UKM_BP (FSCM)
- **AA**: AA cổ điển → New Asset Accounting (bắt buộc trong S/4)
- **Bank**: FI12 → BAM (Bank Account Management)

## 🇻🇳 Bản địa hóa Việt Nam

- **VAT (Thuế GTGT)**: tỷ suất 0%, 5%, 8%, 10% — cấu hình FTXP
- **Hóa đơn điện tử (E-Invoice)**: theo Nghị định 123/2020/NĐ-CP — bắt buộc từ 2022
- **PIT (Thuế TNCN)**: khấu trừ tại nguồn — WTAD
- **Báo cáo thuế GTGT**: hàng tháng/quý
- **Báo cáo tài chính**: VAS (Chuẩn mực kế toán Việt Nam) song song IFRS
- **Bảo hiểm xã hội**: SI/HI/UI — tích hợp với HCM module
- **GDT (Tổng cục Thuế)**: kết nối hệ thống thuế điện tử

## ⚠️ Ngoài phạm vi

- Hóa đơn bán hàng (dùng SD)
- Kế toán trung tâm chi phí (dùng CO)
- Theo dõi chi phí sản xuất (dùng CO + PP)
- Quản lý tiền (dùng plugin TR)

## 📚 Tham khảo

- `closing-checklist.md` — danh sách kiểm tra đóng sổ tháng/quý/năm
- `tcode-reference.md` — danh sách T-code đầy đủ
- `../../../sap-co/skills/sap-co/SKILL.md` — tích hợp kế toán chi phí
- `../../../sap-tr/skills/sap-tr/SKILL.md` — tích hợp quản lý tiền
