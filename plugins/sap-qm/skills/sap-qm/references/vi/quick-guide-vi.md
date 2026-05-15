<!-- Claude-authored draft (community review welcome) -->

# SAP QM Hướng dẫn nhanh (Tiếng Việt)

## Thu thập thông tin môi trường
1. Phiên bản SAP (ECC EhP / S/4HANA năm)
2. Mô hình triển khai (On-Premise / RISE / Cloud PE)
3. Trạng thái kích hoạt QM (thiết lập kiểm tra theo material type)
4. Ngành (sản xuất, dược, thực phẩm, linh kiện ô tô)

## T-code chính

### Quality Planning
| T-code | Công dụng |
|--------|------|
| QP01 | Tạo inspection plan |
| QP02 | Sửa inspection plan |
| QS21 | Master inspection characteristic (MIC) |
| QDV1 | Quy trình lấy mẫu |

### Quality Inspection
| T-code | Công dụng |
|--------|------|
| QA01 | Tạo inspection lot thủ công |
| QA03 | Xem inspection lot |
| QE01 | Ghi kết quả (đơn) |
| QE51N | Ghi kết quả (worklist) |

### Usage Decision
| T-code | Công dụng |
|--------|------|
| QA11 | Usage decision |
| QA32 | Usage decision (hàng loạt) |

### Quality Notification
| T-code | Công dụng |
|--------|------|
| QM01 | Tạo quality notification (lỗi/khiếu nại) |
| QM02 | Sửa quality notification |

### Certificate / Đánh giá NCC
| T-code | Công dụng |
|--------|------|
| QC21 | Tạo certificate (báo cáo thử nghiệm) |
| QI01 | Quality info record (kiểm tra đầu vào) |
| ME61 | Đánh giá nhà cung cấp |

## Bản địa hóa Việt Nam

### Chứng nhận ISO / IATF
- ISO 9001: hệ thống quản lý chất lượng (hầu hết sản xuất)
- IATF 16949: linh kiện ô tô (yêu cầu nhà cung cấp OEM)
- Inspection plan (QP01) là bằng chứng audit cốt lõi

### Dược GMP
- Tiêu chuẩn cơ quan quản lý (Bộ Y tế / DAV)
- Validation 3 giai đoạn: IQ → OQ → PQ
- Quản lý sai lệch: theo dõi qua quality notification (QM01)

### Thực phẩm HACCP
- Giám sát CCP (điểm kiểm soát tới hạn)
- Map inspection characteristic (MIC) vào hạng mục CCP

### Quản lý chất lượng nhà cung cấp
- Tăng cường kiểm tra đầu vào (Inspection Type 01)
- Đánh giá NCC (ME61): tự phản ánh điểm chất lượng
- Không đạt → quality notification (Q3) → yêu cầu hành động khắc phục

## Liên quan
- `../../SKILL.md` — nội dung chi tiết
- `/plugins/sap-mm/skills/sap-mm/SKILL.md` — mua hàng/vật tư
- `/plugins/sap-pp/skills/sap-pp/SKILL.md` — sản xuất/kiểm tra trong quá trình
