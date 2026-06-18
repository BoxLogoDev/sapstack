<div align="center">

# 🏛 sapstack

<img src="docs/assets/mascot/standard-en.png" alt="Ms. Standard — linh vật của sapstack" width="280" />

_"Trong SAP, đây là tiêu chuẩn nên không thể thay đổi." — Ms. Standard ([hướng dẫn thương hiệu](MASCOT.md))_

### Nền tảng SAP Enterprise Operations cho AI Coding Assistants

[![npm](https://img.shields.io/npm/v/@boxlogodev/sapstack-mcp?label=npm&color=cb3837)](https://www.npmjs.com/package/@boxlogodev/sapstack-mcp)
[![release](https://img.shields.io/github/v/release/BoxLogoDev/sapstack?label=release&color=2ea043)](https://github.com/BoxLogoDev/sapstack/releases)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![languages](https://img.shields.io/badge/languages-6-orange)](#)

**24 plugin · 20 agent · 22 lệnh · MCP 23 công cụ (npm) · VS Code extension v2.4.0 · Tương thích 8 AI tool · 6 quốc gia · 6 ngôn ngữ · Sẵn sàng tuân thủ**

🌐 [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

</div>

---

## sapstack là gì?

**sapstack** tiêm **kiến thức chuyên môn SAP** vào các công cụ AI như Claude, Copilot, Cursor. Bao phủ toàn bộ vòng đời vận hành SAP — **Configure → Implement → Operate → Diagnose → Optimize**.

```
┌──────────────────────────────────────────────────────────────┐
│ Người vận hành ┐                                              │
│ SAP           ├─→ [AI Tool] ←── sapstack ──→ Kiến thức SAP   │
│ Người đào tạo ─┤      ↓                       + Hướng dẫn IMG │
│ nhân viên mới ├── Evidence Loop               + Best Practice │
│ Tư vấn ────────┘   (chẩn đoán 4 lượt)         + Tuân thủ      │
└──────────────────────────────────────────────────────────────┘
```

> Nguyên tắc ra quyết định nằm ở [**ETHOS.md**](ETHOS.md) — Ground-truth · Bằng chứng trước · Không hardcode · ECC≠S/4 · Ngôn ngữ hiện trường · Người vận hành quyết định.

---

## 👥 Dành cho ai

| Bạn là… | sapstack làm điều này |
|---|---|
| **Người vận hành SAP** (hiện trường, chạy đua chốt sổ) | Chẩn đoán sự cố qua **Evidence Loop (4 lượt)** — giả thuyết→bằng chứng→xác minh→rollback, không cần truy cập trực tiếp. Bắt đầu ngay với lệnh theo triệu chứng (`/sap-migo-debug`, `/sap-payment-run-debug` …). |
| **Người đào tạo / nhân viên mới** | `sap-tutor` phân loại câu hỏi, ủy quyền cho chuyên gia module, và dịch câu trả lời sang ngôn ngữ người mới. Luôn kèm T-code + đường dẫn menu. |
| **Tư vấn / đối tác SAP** | Tiêm 24 module kiến thức + cấu hình IMG + 3-Tier Best Practice + tuân thủ vào công cụ AI, áp dụng nhanh theo từng môi trường khách hàng. |

---

## 🧭 Golden Path — dùng gì khi nào

Không phải công cụ rời rạc, mà là **một con đường**. Hướng dẫn đầy đủ: **[docs/workflow.md](docs/workflow.md)** · Phân tích khoảng cách hoàn thiện: [docs/gstack-gap-analysis.md](docs/gstack-gap-analysis.md)

| Bạn muốn gì | Con đường |
|---|---|
| Câu trả lời nhanh | **Quick Advisory** — cứ hỏi |
| Chẩn đoán sự cố | **Evidence Loop** (4 lượt) → consultant theo module / lệnh theo triệu chứng |
| Không rõ module | `sap-tutor` (phân loại, ủy quyền chuyên gia) |
| Vấn đề cấu hình (IMG) | `/sap-img-guide` |
| Khóa sổ kỳ | `/sap-fi-closing` → `/sap-quarter-close` → `/sap-year-end` |
| Đóng góp cho dự án | Maintainer Golden Path |

> Bí thì lên một cấp (Evidence Loop), không rõ thì bắt đầu với `sap-tutor`.

---

## ✅ Xem nó hoạt động (See it work)

**Tình huống**: _"Tôi cố nhập kho bằng MIGO nhưng cứ thất bại."_ — Evidence Loop thu hẹp bằng bằng chứng, không phải khẳng định.

```
Turn 1 · INTAKE      Môi trường trước: ECC(EhP?) / S/4(release?), loại chuyển động (MvT),
                     toàn văn thông báo lỗi (M7 xxx).
Turn 2 · HYPOTHESIS  A: kỳ ghi sổ chưa mở — kiểm tra: MMRV có cho thấy kỳ hiện tại
                     khớp ngày ghi sổ không? (phản chứng: nếu khớp thì loại A)
                     B: loại chuyển động / xác định tài khoản (OBYC) — kiểm tra: …
Turn 3 · COLLECT     (người vận hành chạy MMRV → báo kết quả)
Turn 4 · VERIFY      Xác nhận lệch kỳ → Fix: chuyển kỳ bằng MMPV (mô phỏng trước,
                     qua Transport). Kèm kế hoạch rollback + con trỏ SAP Note liên quan.
```

> Mỗi giả thuyết có **tiêu chí phản chứng**, mỗi bản sửa có **kế hoạch rollback**. Không ghi trực tiếp vào production — người vận hành quyết định. (→ [ETHOS](ETHOS.md))

---

## Các tính năng chính

### 🎯 Bao phủ toàn bộ module SAP
FI · CO · TR · MM · SD · PP · HCM · PM · QM · WM · EWM · ABAP · BASIS · BTP · SFSF · S4Mig · GTS · BC · **Cloud PE** · Session

### 🤖 19 agent chuyên môn + 1 SAP tutor
16 consultant module (FI·CO·TR·MM·SD·PP·PM·QM·EWM·HCM·IBP·SAC·Ariba·Integration-Cloud·Cloud·BASIS) + ABAP developer + Integration advisor + S4 migration advisor + **SAP tutor** (đào tạo nhân viên mới)

### 🔁 Evidence Loop (v1.5+)
Chẩn đoán không cần truy cập SAP trực tiếp — cấu trúc 4 lượt **INTAKE → HYPOTHESIS → COLLECT → VERIFY**, bắt buộc tiêu chí phản chứng, bắt buộc cặp rollback

### 🏗 Khung cấu hình IMG (v1.6+)
76 hướng dẫn cấu hình dựa trên SPRO — các bước cấu hình, khác biệt ECC vs S/4, phương pháp xác minh

### 📋 3-Tier Best Practice
**Operational** (hàng ngày) · **Period-End** (khóa sổ) · **Governance** (quản trị) — áp dụng cho 23 module

### 🌐 Hỗ trợ 6 ngôn ngữ (v1.7+)
한국어 · English · 中文 · 日本語 · Deutsch · Tiếng Việt — 24 module × 5 ngôn ngữ = 120 quick-guide

### ☁️ Sẵn sàng S/4HANA Cloud PE
Clean Core · Key User Extensibility · 3-Tier Extension · Fit-to-Standard · Cloud ALM

### 🚀 MCP Runtime (v2.0+)
`@boxlogodev/sapstack-mcp` — chạy toàn bộ Evidence Loop từ Claude Desktop. **23 công cụ + 12 prompt + 9 resource**.

### 💻 VS Code Extension (v2.4.0)
Thanh bên quản lý session · Kiểm tra YAML · Render Webview · File Watcher

### 🛡 Sẵn sàng tuân thủ (v2.0+)
K-SOX · SOC 2 · ISO 27001 · GDPR · triển khai mạng cô lập · tự động che PII

---

## Bắt đầu nhanh

### ⚡ Khởi động 5 phút (điểm bắt đầu khuyến nghị)
Từ cài đặt đến chẩn đoán đầu tiên chỉ bằng một lệnh — không cần lập trình. Chi tiết: [docs/quickstart-5min.md](docs/quickstart-5min.md)
```bash
git clone https://github.com/BoxLogoDev/sapstack.git && cd sapstack
./setup.sh        # Windows: ./setup.ps1   ·   chỉ kiểm tra: ./setup.sh --check
```

### Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-session@sapstack
```

### NPM (MCP server)
```bash
npm install -g @boxlogodev/sapstack-mcp
sapstack-mcp --sessions-dir ~/.sapstack/sessions
```

### VS Code Extension
Tìm "sapstack" trong VS Code Marketplace → Install ·(hoặc cài `.vsix` trực tiếp từ [GitHub Release](https://github.com/BoxLogoDev/sapstack/releases))

### Amazon Kiro IDE
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cp sapstack/.kiro/settings/mcp.json .kiro/settings/
cp sapstack/.kiro/steering/*.md .kiro/steering/
```

### Khác (Codex / Copilot / Cursor / Continue.dev / Aider)
Clone repo → tự động nhận diện. Chi tiết: [docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)

---

## Universal Rules

1. **Tuyệt đối không hardcode** — không cố định mã công ty, tài khoản GL, đơn vị tổ chức
2. **Thu thập môi trường trước** — xác nhận release SAP, mô hình triển khai, mã công ty trước
3. **Phân biệt rõ ECC vs S/4HANA** — làm rõ hành vi theo phiên bản
4. **Bắt buộc Transport** — thay đổi production luôn qua Transport
5. **Mô phỏng trước** — AFAB, F.13, FAGL_FC_VAL, MR11, F110, v.v.
6. **Không sửa SE16N** — không khuyến nghị sửa trực tiếp dữ liệu production
7. **T-code + đường dẫn SPRO** — cung cấp cả hai cho mọi thao tác
8. **Tiếng Hàn ưu tiên ngôn ngữ hiện trường** — ghi kép "코스트 센터 (원가센터, KOSTL)"

> *Lý do* đằng sau các quy tắc này nằm ở [**ETHOS.md**](ETHOS.md), toàn bộ quy tắc vận hành ở [CLAUDE.md](CLAUDE.md).

---

## Lộ trình học

| Cấp độ | Lộ trình |
|------|------|
| 🆕 **Nhập môn** | [Hướng dẫn (15 phút)](docs/tutorial.md) → [FAQ](docs/faq.md) |
| 📘 **Thực chiến** | [5 kịch bản](docs/scenarios/) → [Bảng thuật ngữ](docs/glossary.md) |
| 🧭 **Workflow** | [Golden Path](docs/workflow.md) → [Phân tích khoảng cách](docs/gstack-gap-analysis.md) |
| 🏗 **Chuyên sâu** | [Kiến trúc](docs/architecture.md) → [Hướng dẫn Multi-AI](docs/multi-ai-compatibility.md) |
| 🔒 **Bảo mật** | [SECURITY.md](SECURITY.md) → [Tuân thủ](docs/compliance/) |
| 🤝 **Đóng góp** | [CONTRIBUTING](CONTRIBUTING.md) → [Lộ trình](docs/roadmap.md) |

---

## Tài sản dữ liệu

| Tài sản | Số lượng | Tệp |
|------|------|------|
| T-code đã xác minh | 361 | [`data/tcodes.yaml`](data/tcodes.yaml) |
| Chỉ mục triệu chứng ngôn ngữ tự nhiên | 90 (6 ngôn ngữ) | [`data/symptom-index.yaml`](data/symptom-index.yaml) |
| SAP Note/KBA đã xác minh | 112 | [`data/sap-notes.yaml`](data/sap-notes.yaml) |
| Synonym đa ngôn ngữ | 80+ terms × 6 langs | [`data/synonyms.yaml`](data/synonyms.yaml) |
| Trình tự khóa sổ kỳ | 24 bước | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) |
| Ma trận ngành | 7 industries | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) |

---

## Danh mục plugin

| Lĩnh vực | Plugin |
|------|----------|
| 💰 **Tài chính** | [sap-fi](plugins/sap-fi/) · [sap-co](plugins/sap-co/) · [sap-tr](plugins/sap-tr/) |
| 📦 **Logistics** | [sap-mm](plugins/sap-mm/) · [sap-sd](plugins/sap-sd/) · [sap-pp](plugins/sap-pp/) · [sap-pm](plugins/sap-pm/) · [sap-qm](plugins/sap-qm/) · [sap-wm](plugins/sap-wm/) · [sap-ewm](plugins/sap-ewm/) |
| 👥 **Nhân sự** | [sap-hcm](plugins/sap-hcm/) · [sap-sfsf](plugins/sap-sfsf/) |
| 💻 **Công nghệ** | [sap-abap](plugins/sap-abap/) · [sap-s4-migration](plugins/sap-s4-migration/) · [sap-btp](plugins/sap-btp/) · [sap-basis](plugins/sap-basis/) · [sap-cloud](plugins/sap-cloud/) |
| ☁️ **Cloud/Tích hợp** | [sap-ibp](plugins/sap-ibp/) · [sap-sac](plugins/sap-sac/) · [sap-ariba](plugins/sap-ariba/) · [sap-integration-cloud](plugins/sap-integration-cloud/) |
| 🇰🇷 **Hàn Quốc/Toàn cầu** | [sap-bc](plugins/sap-bc/) · [sap-gts](plugins/sap-gts/) |
| 🔁 **Meta** | [sap-session](plugins/sap-session/) (Evidence Loop) |

---

## Review bản dịch — Hoan nghênh đóng góp

Các quick-guide 5 ngôn ngữ (en/zh/ja/de/vi) là **bản nháp do Claude soạn**. Hoan nghênh review từ người bản ngữ + chuyên gia lĩnh vực SAP.

- Quy trình · tiêu chí · định dạng PR: **[docs/TRANSLATION-REVIEW.md](docs/TRANSLATION-REVIEW.md)**
- Phản hồi: [Translation Feedback issue](https://github.com/BoxLogoDev/sapstack/issues/new?template=translation-feedback.md)
- Số T-code/Note không dịch (giữ nguyên)

---

## Giấy phép & Đóng góp

**MIT License** — tự do dùng cho mục đích thương mại và phi thương mại. Giữ thông báo bản quyền.

- 🐛 [Báo lỗi](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ [Yêu cầu tính năng](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 💬 [Thảo luận](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 [Hướng dẫn đóng góp](CONTRIBUTING.md)

---

<div align="center">

**Made with 🇰🇷 by [@BoxLogoDev](https://github.com/BoxLogoDev)**
Built for Korean SAP consultants · Shared with the global community

</div>
