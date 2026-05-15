<!-- Claude-authored draft (community review welcome) -->

# sap-mm Hướng dẫn nhanh (Tiếng Việt)

> SAP MM (Quản lý vật tư) — Mua hàng, tồn kho, kiểm tra hóa đơn, GR/IR.

## 🔑 Thu thập thông tin môi trường

1. SAP release (ECC EhPx / S/4HANA 19xx-23xx)
2. Mô hình triển khai (on-premise / RISE / Cloud PE)
3. Loại mua hàng (dịch vụ / gián tiếp / trực tiếp / gia công / ký gửi)
4. Nhà máy / mã công ty (người dùng cung cấp)
5. Mã thông báo lỗi + T-code

## 📚 Mô-đun cốt lõi

### Yêu cầu mua hàng (PR)
- **ME51N / ME52N / ME53N** — Tạo / Sửa / Hiển thị
- Phân bổ tài khoản: trung tâm chi phí (K), đơn hàng (F), tài sản (A), dự án (P)
- Chiến lược phê duyệt: T-code OMGS (cấu hình), CL30 (nhóm/chiến lược)

### Đơn mua hàng (PO)
- **ME21N / ME22N / ME23N** — Tạo / Sửa / Hiển thị
- Loại PO: NB (chuẩn), FO (hợp đồng khung), UB (chuyển kho), RA (trả hàng)
- Output (in/email): ME9F → thủ công, NACE (cấu hình)

### Nhập kho (GR)
- **MIGO** — Loại chuyển động 101 (nhập kho), 102 (đảo), 161 (trả lại)
- Thông báo nhập kho (kết hợp EWM): VL31N → VL32N → MIGO
- Loại tồn kho: tự do, chất lượng (Q), bị khóa (S)

### Kiểm tra hóa đơn (IV)
- **MIRO** — Nhận hóa đơn (3-way match: PO/GR/Invoice)
- Dung sai: OMR6 (theo mã công ty)
- Khóa: payment block trên dòng → giải phóng MRBR

### Dữ liệu chủ
- **MM01/MM02/MM03** — Vật tư
- **XK01/XK02/XK03** — Nhà cung cấp (ECC)
- **BP** — Business Partner (S/4 thống nhất)
- **ME11/ME12/ME13** — Bản ghi thông tin

## 🚨 Vấn đề thường gặp

### "Nhập kho MIGO lỗi — M7"
- Kỳ đã đóng (MMRV / MMPV)
- Khóa hạch toán trên vật tư (MM02 → dữ liệu nhà máy)
- Thiếu xác định tài khoản (OBYC)
- Yêu cầu tồn kho đặc biệt (E/Q/K)

### "MIRO 3-way match thất bại"
- Vượt dung sai số lượng — OMR6
- Vượt dung sai giá — OMR6
- Mã thuế PO ≠ hóa đơn — sửa thủ công
- Cờ IV theo GR không khớp

### "MMBE tồn kho không đúng"
- Đối chiếu: MB52 (theo vật tư/nhà máy), MB5B (kỳ), MB51 (danh sách chuyển động)
- Reservation (MD04) đang giữ kho?
- Tồn kho chất lượng (MB52 → loại Q) bị bỏ qua?

## 🔧 T-code chính

| Lĩnh vực | T-code |
|---|---|
| PR | ME51N/52N/53N, ME54N (phê duyệt) |
| PO | ME21N/22N/23N, ME9F (output) |
| GR | MIGO (101/102/161), MB51 (danh sách) |
| IV | MIRO, MRBR (giải phóng khóa) |
| Tồn kho | MMBE, MB52, MB5B, MB5T (đang vận chuyển) |
| Dữ liệu chủ | MM01/02/03, XK01/02/03 (ECC), BP (S/4) |
| Info | ME11/12/13 |
| Nguồn cung | ME01 |
| Hợp đồng khung | ME31K (hợp đồng), ME31L (lịch giao hàng) |

## ECC vs S/4HANA

- **Nhà cung cấp**: XK → BP (Business Partner thống nhất)
- **Vật tư**: MM01-03 giữ nguyên, MARA đơn giản hóa
- **Tích hợp EWM**: sâu hơn trong S/4 (embedded EWM)
- **Centralized Sourcing**: chỉ có S/4

## 🇻🇳 Bản địa hóa Việt Nam

- **VAT (Thuế GTGT)**: 0%, 5%, 8%, 10% — cấu hình FTXP
- **Hóa đơn điện tử**: bắt buộc từ 2022 (Nghị định 123/2020/NĐ-CP)
- **Thuế nhập khẩu**: tích hợp tờ khai hải quan
- **Đa tệ**: VND bản tệ + ngoại tệ (FAGL_FC_VAL)
- **Hải quan VNACCS**: kết nối hệ thống hải quan điện tử
- **Báo cáo thuế**: hàng tháng (đầu tháng kế tiếp)

## ⚠️ Ngoài phạm vi

- Bán hàng (dùng SD)
- Chuyển động trong kho (WM/EWM)
- Mua chiến lược / RFx (dùng Ariba)
- Xuất kho sản xuất (dùng PP)

## 📚 Tham khảo

- `references/img/account-determination.md` — cấu hình OBYC
- `../../../sap-fi/skills/sap-fi/SKILL.md` — tích hợp hạch toán hóa đơn
- `../../../sap-ariba/skills/sap-ariba/SKILL.md` — mua chiến lược
