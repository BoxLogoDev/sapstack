<!-- Claude-authored draft (community review welcome) -->

# sap-session Hướng dẫn nhanh (Tiếng Việt)

> Bộ điều phối Evidence Loop. Skill cấp cao chạy vòng lặp 4 lượt bất đồng bộ ("tiếp nhận → giả thuyết → thu thập bằng chứng → xác minh") cho chẩn đoán vận hành trong môi trường không truy cập SAP trực tiếp. Chi tiết ở `SKILL.md` và `references/turn-formats.md`.

## 🔑 Khi nào dùng sap-session

| Tình huống | Mode |
|---|---|
| Câu hỏi đơn giản "FB01 là gì?" | **Quick Advisory** — không cần sap-session, consultant module trả lời trực tiếp |
| "F110 chạy nhưng một NCC hiện 'No payment method'" | **Evidence Loop** — khởi động sap-session |
| Tiền kiểm đóng kỳ / hồi cứu | Evidence Loop |
| Tác động thay đổi cross-module (FI config → MM/SD) | Evidence Loop |
| 2+ giả thuyết cần thu hẹp bằng bằng chứng | Evidence Loop |
| Operator không truy cập SAP trực tiếp, AI chỉ tư vấn | Evidence Loop (use case cốt lõi) |

## 🔁 4 lượt

```
Turn 1 INTAKE      (operator)  triệu chứng ban đầu + 1 Evidence Bundle
Turn 2 HYPOTHESIS  (AI)        2-4 giả thuyết + điều kiện phản chứng + Follow-up Request
Turn 3 COLLECT     (operator)  chạy checklist follow-up trong SAP, thêm Bundle
Turn 4 VERIFY      (AI)        xác nhận/bác bỏ; nếu xác nhận Fix + Rollback
```

- Mỗi giả thuyết PHẢI có điều kiện phản chứng. "Giả thuyết không thể phản chứng" không cho phép.
- Có Fix plan PHẢI có Rollback plan (Rollback-or-no-Fix).
- Mọi thay đổi trạng thái ghi append-only vào `session.audit_trail` (cấm sửa/xóa).

## 📦 Cấu trúc file session

1 session = 1 thư mục `.sapstack/sessions/{id}/`:

| File | Khi nào |
|---|---|
| `state.yaml` | mỗi lượt (trạng thái hiện tại, hành động kế) |
| `bundles/evb-*.yaml` | Turn 1, 3 — bằng chứng operator upload |
| `hypotheses/h-*.yaml` | Turn 2 — giả thuyết AI |
| `requests/flr-*.yaml` | Turn 2 — checklist follow-up AI |
| `verdicts/vdc-*.yaml` | Turn 4 — phán quyết xác nhận/bác bỏ |

Định dạng session ID: `sess-YYYYMMDD-XXXXXX`

## 🚀 Ví dụ luồng operator

```bash
# Turn 1 INTAKE
/sap-session-start "F110 Proposal lỗi — NCC 100234, 'No valid payment method'"
/sap-session-add-evidence sess-20260514-m2p9xt ./f110-log.txt ./lfb1-dump.csv

# Turn 2 HYPOTHESIS (AI sinh giả thuyết + follow-up)
/sap-session-next-turn sess-20260514-m2p9xt
#   H1: LFB1.ZWELS rỗng (phổ biến nhất)
#   H2: FBZP bank determination thiếu phương thức T/C
#   H3: payment method chưa active theo company code

# Turn 3 COLLECT (operator chạy checklist, upload)
/sap-session-add-evidence sess-20260514-m2p9xt ./xk03-zwels-check.txt

# Turn 4 VERIFY (AI xác nhận/bác bỏ, Fix + Rollback)
/sap-session-next-turn sess-20260514-m2p9xt
#   H1 xác nhận, Fix: XK02 set ZWELS, Rollback: XK02 xóa ZWELS

/sap-session-handoff sess-20260514-m2p9xt --to web_triage
```

## 🧰 Tự định tuyến

Theo `impacted_modules` của giả thuyết, gọi song song consultant module: FI→`sap-fi-consultant`, MM→`sap-mm-consultant`, SD→`sap-sd-consultant`, PP→`sap-pp-consultant`, HCM→`sap-hcm-consultant`, TR→`sap-tr-consultant`, CO→`sap-co-consultant`, PM→`sap-pm-consultant`, QM→`sap-qm-consultant`, WM/EWM→`sap-ewm-consultant`, ABAP→`sap-abap-developer`, BASIS→`sap-basis-consultant`, Cloud PE→`sap-cloud-consultant`, S/4 migration→`sap-s4-migration-advisor`, BTP/CPI→`sap-integration-advisor`, người mới→`sap-tutor`. Đa module → gọi song song, tổng hợp verdict.

## 🌍 Nguyên tắc ngôn ngữ hiện trường

sapstack dùng ngôn ngữ hiện trường SAP, không dịch từ điển:
- Ưu tiên ngôn ngữ hiện trường (giữ T-code/viết tắt nguyên dạng: F110, MIGO, ST22, PO, GR, TR)
- Cho phép văn nói
- Mốc lịch nghiệp vụ bản địa
- Hướng dẫn đầy đủ: `references/korean-field-language.md`; từ đồng nghĩa: `data/synonyms.yaml`

## ⚠️ Phi mục tiêu rõ ràng
- Không kết nối SAP trực tiếp (không gọi RFC/OData/Fiori)
- Không tự sửa dữ liệu production — operator thực hiện mọi fix
- Không tự transport — cần phê duyệt người
- Không ép CLI lên end user — họ dùng cổng web

## 🚦 Quan hệ với module khác

| | Quick Advisory | sap-session (Evidence Loop) |
|---|---|---|
| Lượt | 1 | đa lượt (bất đồng bộ) |
| Phù hợp | "X là gì?" | "X không chạy" |
| Giả thuyết | đáp án đơn | 2-4 + phản chứng |
| Bằng chứng | không | checklist follow-up rõ |
| Trạng thái | không | `.sapstack/sessions/...` |
| Rollback | tùy chọn | **bắt buộc** |

Quy tắc: dự kiến 2+ lượt HOẶC 2+ ứng viên giả thuyết → sap-session.

## 📚 Đọc thêm
- `references/turn-formats.md`, `references/evidence-bundle-guide.md`
- `references/session-state-lifecycle.md`, `references/korean-field-language.md`
- `../../../schemas/` — 5 JSON Schema; `../../../CLAUDE.md` — Universal Rules
