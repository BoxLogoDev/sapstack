<!-- Claude-authored draft (community review welcome) -->

# sap-co Hướng dẫn nhanh (Tiếng Việt)

## 🔑 Thu thập thông tin môi trường
1. Phiên bản SAP (ECC / S/4HANA) — S/4 mặc định Account-based CO-PA
2. Company code + Controlling Area
3. Phương pháp tính giá thành (Standard / Actual / Mixed)
4. Loại CO-PA (Costing-based / Account-based)

## 📚 Điểm cốt lõi từng module

### CCA (Cost Center Accounting)
- **KS01/KS02**: Tạo/sửa cost center
- **KSU5**: Assessment (phân bổ)
- **KSV5**: Distribution (phân phối)
- Planning: **KP06** (theo cost element), **KP26** (activity type)

### PCA (Profit Center Accounting)
- **KE51**: Tạo profit center
- S/4HANA: PCA tích hợp New G/L — không phải ledger riêng
- **KE5Z**: Chi tiết thực tế PCA

### IO (Internal Order)
- **KO01**: Tạo internal order
- **KO88**: Settlement (kết toán)
- Lưu ý phân biệt Real vs Statistical

### CO-PC (Product Costing)
- **CK11N**: Tạo cost estimate
- **CK24**: Cập nhật giá (áp standard cost)
- **KKS1/KKS2**: Phân tích chênh lệch
- **CKMLCP** (S/4): Actual Costing Run

### CO-PA (Profitability Analysis)
- **KE30**: Chạy báo cáo
- S/4HANA: **Account-based CO-PA** mặc định — dùng ACDOCA
- ECC: Costing-based CO-PA dùng bảng riêng (CE1~CE4)

## 🇻🇳 Bản địa hóa Việt Nam
- **Kế toán quản trị + điều chỉnh thuế** thường yêu cầu đồng thời (doanh nghiệp lớn)
- **Tính standard cost** là critical path đóng sổ tháng — thời điểm CK24 quan trọng
- **Biến động chi phí nguyên liệu**: tỷ giá nguyên liệu dao động mạnh → cân nhắc Actual Costing

## 🤖 Command liên quan
- `/sap-fi-closing` (CO phụ thuộc đóng sổ FI)

## 📖 Tham khảo
- `../period-end.md`
