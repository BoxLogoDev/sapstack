<div align="center">

# 🏛 sapstack

<img src="docs/assets/mascot/standard-en.png" alt="Cô Tiêu Chuẩn — linh vật của sapstack" width="280" />

_"Trong SAP đây là tiêu chuẩn nên không thể thay đổi." — Cô Tiêu Chuẩn ([hướng dẫn thương hiệu](MASCOT.md))_

### AI Desktop dành cho vận hành SAP

**Cài đặt và cứ hỏi — từ quy trình chuẩn đến các chương trình tùy chỉnh (Z/Y) của công ty bạn.**

[![npm](https://img.shields.io/npm/v/@boxlogodev/sapstack-mcp?label=npm&color=cb3837)](https://www.npmjs.com/package/@boxlogodev/sapstack-mcp)
[![release](https://img.shields.io/github/v/release/BoxLogoDev/sapstack?label=release&color=2ea043)](https://github.com/BoxLogoDev/sapstack/releases)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![languages](https://img.shields.io/badge/languages-6-orange)](#)

**Ứng dụng desktop Windows v2.6.0 · 24 plugin · 21 agent · 23 lệnh · CBO snapshot · hỗ trợ mạng cách ly · 6 ngôn ngữ · sẵn sàng tuân thủ**

🌐 [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

</div>

---

## sapstack là gì?

**sapstack** là **ứng dụng AI desktop chuyên dụng cho SAP**, dành cho người dùng nghiệp vụ và tư vấn viên.
Không cần ADT, không cần quyền phát triển, không cần API key riêng — mở ứng dụng và gõ câu hỏi.

```
"Chạy F110 bị lỗi"                       → Chẩn đoán Evidence Loop 4 lượt (giả thuyết→bằng chứng→xác minh→rollback)
"Trình tự đóng sổ cuối tháng là gì?"      → Chuỗi đóng kỳ + T-code/đường dẫn menu
"Chương trình ZFI0042 làm gì?"            → Đọc mã tùy chỉnh của công ty (CBO snapshot) và giải thích bằng ngôn ngữ nghiệp vụ
```

Bên dưới là tri thức SAP bao phủ toàn bộ vòng đời vận hành
(**Configure → Implement → Operate → Diagnose → Optimize**) — 24 plugin theo phân hệ, hướng dẫn IMG,
Best Practice và tuân thủ — cùng một tri thức cũng dùng được từ Claude Code, MCP, VS Code
(→ [Tích hợp cho nhà phát triển & power user](#-tích-hợp-cho-nhà-phát-triển--power-user)).

> Nguyên tắc ra quyết định: [**ETHOS.md**](ETHOS.md) — ground truth · bằng chứng trước · cấm hardcode · ECC≠S/4 · thuật ngữ hiện trường · người vận hành quyết định.

---

## 👥 Dành cho ai

| Bạn là… | sapstack desktop giúp bạn |
|---|---|
| **Người dùng nghiệp vụ SAP** (chạy deadline, không có quyền phát triển) | Chỉ cần gõ câu hỏi ở màn hình chính — sự cố tự động vào **Evidence Loop 4 lượt**, câu hỏi thực tế được trả lời ngay. **Các chương trình Z/Y của công ty** cũng được giải thích dựa trên snapshot (không đoán mò, luôn ghi rõ ngày cơ sở). |
| **Quản trị viên / IT** | **Triển khai không cần cấu hình** với một tệp `provision.yaml` — người dùng chỉ giải nén và chạy exe. CBO snapshot thu thập tự động ban đêm → xuất bản lên thư mục chia sẻ → ứng dụng tự cập nhật. Mạng cách ly dùng LLM cục bộ đi kèm. |
| **Tư vấn viên / đối tác SAP** | Tri thức 24 phân hệ + cấu hình IMG + Best Practice 3 tầng + tuân thủ, dùng được cả trên desktop lẫn công cụ AI — áp dụng nhanh theo môi trường từng khách hàng. |

---

## 🖥 Desktop làm được gì

### 💬 Bắt đầu bằng một câu hỏi
Gõ vào màn hình chính — sự cố rẽ vào **Evidence Loop**
(INTAKE→HYPOTHESIS→COLLECT→VERIFY, bắt buộc có điều kiện phản chứng và kế hoạch rollback),
câu hỏi thực tế đi vào **Quick Advisory**. Các chip câu hỏi mẫu giúp bạn chép câu hỏi đầu tiên.

### 🗂 CBO snapshot — hỏi về mã tùy chỉnh của công ty
Quản trị viên xuất mã nguồn ABAP tùy chỉnh (Z/Y) thành snapshot; ứng dụng đọc bản sao đó
**không cần kết nối SAP** và trả lời "chương trình này làm gì?" bằng ngôn ngữ nghiệp vụ.
Ba kênh phân phối — đóng gói trong ZIP phân phối · tự cập nhật từ thư mục chia sẻ ·
"Nhập từ ZIP" trong Cài đặt. Mọi câu trả lời đều ghi rõ **ngày cơ sở của snapshot**.
→ [docs/cbo-snapshot.md](docs/cbo-snapshot.md)

### 📦 Triển khai hàng loạt không cần cấu hình (provisioning quản trị)
Kèm một tệp `provision.yaml` cạnh exe: lần chạy đầu tự cấu hình kết nối LLM (key công ty,
gateway hoặc mô hình cục bộ), môi trường SAP và chế độ người dùng nghiệp vụ — **người dùng
không thấy bất kỳ màn hình thiết lập nào.** Đổi key chỉ cần tăng version và phân phối lại.
→ [docs/provisioning.md](docs/provisioning.md)

### 🙋 Chế độ người dùng nghiệp vụ
Màn hình chính đơn giản, tập trung vào câu hỏi (3 thẻ + chip câu hỏi mẫu), ẩn menu dành cho
nhà phát triển, không có hộp thoại phê duyệt công cụ (mặc định chỉ đọc). Chuyển đổi trong
Cài đặt → Giao diện.

### 🔒 Hỗ trợ mạng cách ly (air-gap)
Đi kèm engine suy luận cục bộ `llama-server` (llama.cpp) — mang gói mô hình GGUF vào bằng USB
là chạy được không cần internet. Với `air_gapped: true`, cả báo cáo sự cố lẫn kiểm tra cập nhật
đều bị tắt. → [docs/compliance/air-gapped-deployment.md](docs/compliance/air-gapped-deployment.md)

### 📚 Tri thức SAP bên dưới (cơ sở của mọi câu trả lời)
- **24 phân hệ**: FI · CO · TR · MM · SD · PP · HCM · PM · QM · WM · EWM · ABAP · BASIS · BTP · SFSF · S4Mig · GTS · BC · Cloud PE · Session v.v.
- **21 agent**: 16 tư vấn viên phân hệ + ABAP developer + Integration/S4 migration advisor + SAP tutor (đào tạo người mới) + **CBO explainer** (giải thích mã tùy chỉnh cho người dùng nghiệp vụ)
- **Khung cấu hình IMG**: 76 hướng dẫn dựa trên SPRO (kèm khác biệt ECC vs S/4, cách xác minh)
- **Best Practice 3 tầng**: Operational · Period-End · Governance
- **6 ngôn ngữ**: 한국어 · English · 中文 · 日本語 · Deutsch · Tiếng Việt (24 phân hệ × 5 ngôn ngữ quick-guide)
- **Tuân thủ**: K-SOX · SOC 2 · ISO 27001 · GDPR · tự động che PII

---

## ✅ Ví dụ thực tế

**Tình huống 1**: _"Ghi nhận nhập kho bằng MIGO cứ thất bại."_ — Evidence Loop thu hẹp bằng bằng chứng thay vì khẳng định.

```
Turn 1 · INTAKE      Môi trường trước: ECC (EhP?) / S/4 (phiên bản?), loại di chuyển (MvT),
                     toàn văn thông báo lỗi (M7 xxx).
Turn 2 · HYPOTHESIS  Giả thuyết A: kỳ ghi sổ chưa mở — kiểm tra: kỳ hiện tại trong MMRV có
                     khớp ngày ghi sổ không? (khớp thì loại A)
                     Giả thuyết B: loại di chuyển/xác định tài khoản (OBYC) — kiểm tra: …
Turn 3 · COLLECT     (người vận hành tra MMRV và báo kết quả)
Turn 4 · VERIFY      Xác nhận lệch kỳ → Fix: chuyển kỳ bằng MMPV (mô phỏng trước,
                     qua Transport). Kèm kế hoạch rollback + chỉ dẫn SAP Note liên quan.
```

**Tình huống 2**: _"ZFI0042 làm gì?"_ — trả lời từ CBO snapshot (ví dụ hư cấu), theo định dạng:

```
Tóm tắt một dòng  (mục đích chương trình rút từ header nguồn/catalog của snapshot)
Dùng ở đâu        Màn hình, nút chức năng (nếu ánh xạ T-code nằm ngoài snapshot thì nói rõ)
Luồng xử lý       Kiểm tra quyền → truy vấn → danh sách/in — luồng thật đọc từ mã nguồn
Lưu ý             Thông báo người dùng sẽ gặp và cách xử lý (không đoán — không có trong
                  snapshot thì trả lời "không có")
Ngày cơ sở        Câu trả lời này dựa trên snapshot ngày YYYY-MM-DD.
```

> Mỗi giả thuyết có **tiêu chí phản chứng**, mỗi bản sửa có **kế hoạch rollback**. Chỉ hướng dẫn, không thay đổi trực tiếp production — người vận hành quyết định. (→ [ETHOS](ETHOS.md))

---

## Bắt đầu nhanh

### 🖥 Desktop (khuyến nghị — người dùng nghiệp vụ & tư vấn viên)

**Nhận được ZIP phân phối?** Giải nén và chạy `sapstack-Desktop-*-Portable-x64.exe` — xong.
(Nếu quản trị viên kèm provision.yaml, bạn có thể hỏi ngay mà không qua màn hình thiết lập nào.)

**Tự cài đặt**: tải `sapstack-Desktop-<phiên bản>-Setup-x64.exe` (NSIS, per-user, không cần
quyền admin) hoặc bản Portable từ [GitHub Releases](https://github.com/BoxLogoDev/sapstack/releases).
Cần Git for Windows (Git Bash); khoảng 249MB (đo trên v2.4.1).
→ Cài đặt: [docs/desktop-install.md](docs/desktop-install.md) · Đóng gói phân phối: [docs/provisioning.md](docs/provisioning.md)

**3 đường dữ liệu SAP** — không đường nào sửa đổi SAP:
① mặc định dán thủ công ② cầu ADT chỉ đọc (Cài đặt > Kết nối SAP, [docs/adt-bridge.md](docs/adt-bridge.md))
③ CBO snapshot (bản sao offline, [docs/cbo-snapshot.md](docs/cbo-snapshot.md))

### ⚡ Làm quen trong 5 phút (dựa trên repository)
```bash
git clone https://github.com/BoxLogoDev/sapstack.git && cd sapstack
./setup.sh        # Windows: ./setup.ps1   ·   chỉ kiểm tra: ./setup.sh --check
```
Chi tiết: [docs/quickstart-5min.md](docs/quickstart-5min.md)

---

## 🔧 Tích hợp cho nhà phát triển & power user

Các lối vào khác của cùng một kho tri thức SAP.

### Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-session@sapstack
```

### NPM (máy chủ MCP) — 23 công cụ + 12 prompt + 9 tài nguyên
```bash
npm install -g @boxlogodev/sapstack-mcp
sapstack-mcp --sessions-dir ~/.sapstack/sessions
```

### Tiện ích VS Code
Tìm "sapstack" trong VS Code Marketplace → Install · (hoặc cài trực tiếp `.vsix` từ [GitHub Release](https://github.com/BoxLogoDev/sapstack/releases))

### Amazon Kiro IDE
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cp sapstack/.kiro/settings/mcp.json .kiro/settings/
cp sapstack/.kiro/steering/*.md .kiro/steering/
```

### Khác (Codex / Copilot / Cursor / Continue.dev / Aider)
Clone repository → tự nhận diện. Chi tiết: [docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)

### 🧭 Golden Path — tình huống nào dùng gì
Hướng dẫn đầy đủ: [docs/workflow.md](docs/workflow.md)

| Bạn muốn | Đường đi |
|---|---|
| Câu trả lời thực tế nhanh | **Quick Advisory** — cứ hỏi |
| Chẩn đoán sự cố | **Evidence Loop** (4 lượt) → tư vấn viên phân hệ / lệnh triệu chứng |
| Hiểu một chương trình tùy chỉnh (Z/Y) | Hỏi ngay ở màn hình chính desktop / `/sap-cbo-explain` |
| Không biết thuộc phân hệ nào | `sap-tutor` (phân loại rồi chuyển cho chuyên gia) |
| Vấn đề cấu hình (IMG) | `/sap-img-guide` |
| Đóng kỳ | `/sap-fi-closing` → `/sap-quarter-close` → `/sap-year-end` |

---

## Universal Rules

1. **Tuyệt đối không hardcode** — cấm dùng giá trị cố định cho mã công ty, tài khoản G/L, đơn vị tổ chức
2. **Thu thập môi trường trước** — xác nhận phiên bản SAP, mô hình triển khai, mã công ty
3. **Phân biệt rõ ECC vs S/4HANA** — nêu rõ khác biệt hành vi theo phiên bản
4. **Bắt buộc Transport** — thay đổi production luôn qua Transport
5. **Mô phỏng trước** — AFAB, F.13, FAGL_FC_VAL, MR11, F110 v.v.
6. **Cấm sửa bằng SE16N** — không khuyến nghị sửa dữ liệu production trực tiếp
7. **T-code + đường dẫn SPRO** — cung cấp cả hai cho mọi thao tác
8. **Tiếng Hàn ưu tiên thuật ngữ hiện trường** — ghi kép như "코스트 센터 (원가센터, KOSTL)"

> *Lý do* đằng sau các quy tắc: [**ETHOS.md**](ETHOS.md) · quy tắc vận hành đầy đủ: [CLAUDE.md](CLAUDE.md).

---

## Lộ trình học

| Cấp độ | Lộ trình |
|------|------|
| 🆕 **Nhập môn** | [Hướng dẫn (15 phút)](docs/tutorial.md) → [FAQ](docs/faq.md) |
| 🖥 **Vận hành desktop** | [Cài đặt](docs/desktop-install.md) → [Provisioning](docs/provisioning.md) → [CBO snapshot](docs/cbo-snapshot.md) |
| 📘 **Thực chiến** | [5 kịch bản](docs/scenarios/) → [Bảng thuật ngữ](docs/glossary.md) |
| 🧭 **Quy trình** | [Golden Path](docs/workflow.md) → [Phân tích khoảng trống hoàn thiện](docs/gstack-gap-analysis.md) |
| 🏗 **Chuyên sâu** | [Kiến trúc](docs/architecture.md) → [Hướng dẫn Multi-AI](docs/multi-ai-compatibility.md) |
| 🔒 **Bảo mật** | [SECURITY.md](SECURITY.md) → [Tuân thủ](docs/compliance/) |
| 🤝 **Đóng góp** | [CONTRIBUTING](CONTRIBUTING.md) → [Lộ trình phát triển](docs/roadmap.md) |

---

## Tài sản dữ liệu

| Tài sản | Số lượng | Tệp |
|------|------|------|
| T-code đã xác nhận | 472 | [`data/tcodes.yaml`](data/tcodes.yaml) |
| Chỉ mục triệu chứng ngôn ngữ tự nhiên | 90 (6 ngôn ngữ) | [`data/symptom-index.yaml`](data/symptom-index.yaml) |
| SAP Note/KBA đã xác nhận | 112 | [`data/sap-notes.yaml`](data/sap-notes.yaml) |
| Từ đồng nghĩa đa ngôn ngữ | 80+ thuật ngữ × 6 ngôn ngữ | [`data/synonyms.yaml`](data/synonyms.yaml) |
| Chuỗi đóng kỳ | 24 bước | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) |
| Ma trận ngành | 7 ngành | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) |

---

## Danh mục plugin

| Lĩnh vực | Plugin |
|------|----------|
| 💰 **Tài chính** | [sap-fi](plugins/sap-fi/) · [sap-co](plugins/sap-co/) · [sap-tr](plugins/sap-tr/) |
| 📦 **Logistics** | [sap-mm](plugins/sap-mm/) · [sap-sd](plugins/sap-sd/) · [sap-pp](plugins/sap-pp/) · [sap-pm](plugins/sap-pm/) · [sap-qm](plugins/sap-qm/) · [sap-wm](plugins/sap-wm/) · [sap-ewm](plugins/sap-ewm/) |
| 👥 **Nhân sự** | [sap-hcm](plugins/sap-hcm/) · [sap-sfsf](plugins/sap-sfsf/) |
| 💻 **Kỹ thuật** | [sap-abap](plugins/sap-abap/) · [sap-s4-migration](plugins/sap-s4-migration/) · [sap-btp](plugins/sap-btp/) · [sap-basis](plugins/sap-basis/) · [sap-cloud](plugins/sap-cloud/) |
| ☁️ **Cloud/Tích hợp** | [sap-ibp](plugins/sap-ibp/) · [sap-sac](plugins/sap-sac/) · [sap-ariba](plugins/sap-ariba/) · [sap-integration-cloud](plugins/sap-integration-cloud/) |
| 🇰🇷 **Hàn Quốc/Toàn cầu** | [sap-bc](plugins/sap-bc/) · [sap-gts](plugins/sap-gts/) |
| 🔁 **Meta** | [sap-session](plugins/sap-session/) (Evidence Loop) |

---

## Đóng góp hiệu đính bản dịch

Quick-guide 5 ngôn ngữ (en/zh/ja/de/vi) là **bản nháp do Claude viết**. Rất hoan nghênh hiệu đính từ người bản ngữ có chuyên môn SAP.

- Quy trình, tiêu chí, định dạng PR: **[docs/TRANSLATION-REVIEW.md](docs/TRANSLATION-REVIEW.md)**
- Phản hồi: [issue Translation Feedback](https://github.com/BoxLogoDev/sapstack/issues/new?template=translation-feedback.md)
- Không dịch số T-code/Note (giữ nguyên)

---

## Giấy phép & đóng góp

**MIT License** — tự do sử dụng thương mại lẫn phi thương mại. Giữ ghi chú bản quyền.

- 🐛 [Báo lỗi](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ [Yêu cầu tính năng](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 💬 [Thảo luận](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 [Hướng dẫn đóng góp](CONTRIBUTING.md)

---

<div align="center">

**Made with 🇰🇷 by [@BoxLogoDev](https://github.com/BoxLogoDev)**
Built for Korean SAP consultants · Shared with the global community

</div>
