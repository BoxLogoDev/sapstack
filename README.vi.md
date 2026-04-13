<div align="center">

# 🏛 sapstack

### Nền tảng SAP Enterprise Operations cho AI Coding Assistants

**20 plugins · 16 agents · MCP runtime · VS Code extension · 6 languages · Compliance ready**

🌐 [🇰🇷 한국어](README.md) · [🇬🇧 English](README.en.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇩🇪 Deutsch](README.de.md) · [🇻🇳 Tiếng Việt](README.vi.md)

</div>

---

## sapstack là gì?

**sapstack** là một nền tảng mã nguồn mở giúp đưa **chuyên môn SAP** vào các công cụ AI như Claude, Copilot và Cursor. Nó bao gồm toàn bộ vòng đời hoạt động SAP — **Cấu hình → Triển khai → Vận hành → Chẩn đoán → Tối ưu hóa** — với chẩn đoán dựa trên bằng chứng.

```
┌──────────────────────────────────────────────────────────────┐
│ Nhà vận hành SAP ──┐                                         │
│                  ├─→ [Công cụ AI] ←── sapstack ──→ Chuyên môn│
│ Người đào tạo ────┤      ↓                        + IMG Guides│
│                  ├── Evidence Loop               + Best Pract│
│ Tư vấn viên ──────┘   (Chẩn đoán 4 lượt)         + Compliance│
└──────────────────────────────────────────────────────────────┘
```

---

## Các tính năng chính

### 🎯 Bao gồm đầy đủ các mô-đun SAP
FI · CO · TR · MM · SD · PP · HCM · PM · QM · WM · EWM · ABAP · BASIS · BTP · SFSF · S4 Migration · GTS · BC · **Cloud PE** · Session

### 🤖 15 Agents chuyên gia + 1 SAP Tutor
11 Module Consultants + ABAP Developer + BASIS Consultant + Integration Advisor + S/4 Migration Advisor + **SAP Tutor** (onboarding nhân viên mới)

### 🔁 Evidence Loop (v1.5+)
Chẩn đoán mà không cần truy cập SAP trực tiếp — cấu trúc **INTAKE → HYPOTHESIS → COLLECT → VERIFY** 4 lượt, yêu cầu tiêu chí phản chứng, bắt buộc rollback pair

### 🏗 IMG Configuration Framework (v1.6+)
55+ hướng dẫn cấu hình dựa trên SPRO — các bước thiết lập, sự khác biệt ECC vs S/4, phương pháp xác thực bao gồm

### 📋 Best Practice 3-Tier
**Operational** (hàng ngày) · **Period-End** (đóng cửa) · **Governance** (audit) — áp dụng một cách hệ thống trên 11 mô-đun

### 🌐 Hỗ trợ 6 ngôn ngữ (v1.7+)
한국어 · English · 中文 · 日本語 · Deutsch · Tiếng Việt

### ☁️ S/4HANA Cloud PE Ready
Clean Core · Key User Extensibility · 3-Tier Extension · Fit-to-Standard · Cloud ALM

### 🚀 MCP Runtime (v2.0+)
`@boxlogodev/sapstack-mcp` — chạy Evidence Loop đầy đủ trong Claude Desktop. 5 công cụ đọc + 3 công cụ ghi.

### 💻 VS Code Extension (v2.0+)
Session sidebar · YAML validation · Webview rendering · File Watcher

### 🛡 Compliance Ready (v2.0+)
K-SOX · SOC 2 · ISO 27001 · GDPR · Triển khai khoảng không khí · Tự động che dấu PII

---

## Bắt đầu nhanh

### Claude Code
```bash
/plugin marketplace add https://github.com/BoxLogoDev/sapstack
/plugin install sap-fi@sapstack sap-session@sapstack
```

### NPM (MCP Server)
```bash
npm install -g @boxlogodev/sapstack-mcp
sapstack-mcp --sessions-dir ~/.sapstack/sessions
```

### VS Code Extension
Tìm kiếm "sapstack" trong VS Code Marketplace → Cài đặt

### Amazon Kiro IDE
```bash
git submodule add https://github.com/BoxLogoDev/sapstack sapstack
cp sapstack/.kiro/settings/mcp.json .kiro/settings/
cp sapstack/.kiro/steering/*.md .kiro/steering/
```

### Các nền tảng khác (Codex / Copilot / Cursor / Continue.dev / Aider)
Clone repository → tự động phát hiện. Chi tiết: [docs/multi-ai-compatibility.md](docs/multi-ai-compatibility.md)

---

## Universal Rules

1. **Không bao giờ hardcode mã công ty** — Không có mã công ty cố định, tài khoản GL, trung tâm chi phí hoặc đơn vị tổ chức
2. **Intake môi trường trước tiên** — Xác nhận phiên bản SAP, mô hình triển khai và cấu trúc công ty trước
3. **ECC vs S/4HANA rõ ràng** — Hành vi cụ thể theo phiên bản phải được phân biệt rõ ràng
4. **Yêu cầu Transport** — Tất cả các thay đổi sản xuất đều cần yêu cầu transport
5. **Mô phỏng trước khi thực thi** — Chạy AFAB, F.13, FAGL_FC_VAL, MR11, F110 trong kiểm tra trước tiên
6. **Không chỉnh sửa SE16N** — Không khuyến khích sửa đổi dữ liệu trực tiếp trong sản xuất
7. **T-code + SPRO path** — Cung cấp cả hai cho mỗi hành động
8. **Chẩn đoán dựa trên bằng chứng** — Mỗi giả thuyết cần tiêu chí phản chứng

---

## Đường dẫn học tập

| Mức độ | Đường dẫn |
|-------|------|
| 🆕 **Người mới bắt đầu** | [Hướng dẫn (15 phút)](docs/tutorial.md) → [Câu hỏi thường gặp](docs/faq.md) |
| 📘 **Thực hành** | [5 Kịch bản](docs/scenarios/) → [Thuật ngữ](docs/glossary.md) |
| 🏗 **Nâng cao** | [Kiến trúc](docs/architecture.md) → [Hướng dẫn Multi-AI](docs/multi-ai-compatibility.md) |
| 🔒 **Bảo mật** | [SECURITY.md](SECURITY.md) → [Tuân thủ](docs/compliance/) |
| 🤝 **Đóng góp** | [CONTRIBUTING](CONTRIBUTING.md) → [Lộ trình](docs/roadmap.md) |

---

## Data Assets

| Tài sản | Số lượng | Tệp |
|-------|------|------|
| Validated T-codes | 340+ | [`data/tcodes.yaml`](data/tcodes.yaml) |
| Natural Language Symptom Index | 62 (6 ngôn ngữ) | [`data/symptom-index.yaml`](data/symptom-index.yaml) |
| SAP Notes | 57+ | [`data/sap-notes.yaml`](data/sap-notes.yaml) |
| Multilingual Synonyms | 80+ terms × 6 languages | [`data/synonyms.yaml`](data/synonyms.yaml) |
| Period-End Sequence | 24 steps | [`data/period-end-sequence.yaml`](data/period-end-sequence.yaml) |
| Industry Matrix | 3 sectors | [`data/industry-matrix.yaml`](data/industry-matrix.yaml) |

---

## Plugin Catalog

| Lĩnh vực | Plugins |
|--------|---------|
| 💰 **Tài chính** | [sap-fi](plugins/sap-fi/) · [sap-co](plugins/sap-co/) · [sap-tr](plugins/sap-tr/) |
| 📦 **Logistics** | [sap-mm](plugins/sap-mm/) · [sap-sd](plugins/sap-sd/) · [sap-pp](plugins/sap-pp/) · [sap-pm](plugins/sap-pm/) · [sap-qm](plugins/sap-qm/) · [sap-wm](plugins/sap-wm/) · [sap-ewm](plugins/sap-ewm/) |
| 👥 **Nhân sự** | [sap-hcm](plugins/sap-hcm/) · [sap-sfsf](plugins/sap-sfsf/) |
| 💻 **Công nghệ** | [sap-abap](plugins/sap-abap/) · [sap-s4-migration](plugins/sap-s4-migration/) · [sap-btp](plugins/sap-btp/) · [sap-basis](plugins/sap-basis/) · [sap-cloud](plugins/sap-cloud/) |
| 🌍 **Toàn cầu** | [sap-bc](plugins/sap-bc/) · [sap-gts](plugins/sap-gts/) |
| 🔁 **Meta** | [sap-session](plugins/sap-session/) (Evidence Loop) |

---

## Giấy phép và Đóng góp

**MIT License** — Miễn phí cho cả sử dụng thương mại và không thương mại. Cần ghi công.

- 🐛 [Báo cáo lỗi](https://github.com/BoxLogoDev/sapstack/issues/new?template=bug_report.md)
- ✨ [Yêu cầu tính năng](https://github.com/BoxLogoDev/sapstack/issues/new?template=feature_request.md)
- 💬 [Bắt đầu thảo luận](https://github.com/BoxLogoDev/sapstack/discussions)
- 📖 [Hướng dẫn đóng góp](CONTRIBUTING.md)

---

<div align="center">

**Made with 🇰🇷 by [@BoxLogoDev](https://github.com/BoxLogoDev)**
Xây dựng cho các chuyên gia SAP toàn cầu · Chia sẻ với cộng đồng mã nguồn mở

</div>
