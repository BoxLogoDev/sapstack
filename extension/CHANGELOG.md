# sapstack for VS Code — Changelog

## v1.6.0 (2026-04-13) — MVP Implementation

### Features
- **Session Management** — Create and resume Evidence Loop sessions via quick input
- **Tree Views** — Active Sessions, Pending Follow-ups, Installed Plugins
- **Evidence Addition** — Add files as evidence bundles with SHA256 hashing
- **Turn Progression** — Advance through Intake → Hypothesis → Collect → Verify loop
- **Session File Watching** — Auto-refresh tree views when YAML files change
- **Status Bar** — Display current session ID in VS Code status bar
- **Configuration** — Workspace settings for session directory, language, country, default SAP release

### Commands Implemented
- `sapstack.session.start` — Create new session with symptom intake
- `sapstack.session.resume` — Load existing session from workspace
- `sapstack.session.addEvidence` — Add evidence files to current session
- `sapstack.session.nextTurn` — Advance to next turn (hypothesis/collect/verify)
- `sapstack.session.viewEvidence` — Browse evidence bundles in current session
- `sapstack.resolveNote` — SAP Note keyword lookup (placeholder)
- `sapstack.checkTcode` — T-code validation (placeholder)
- `sapstack.listPlugins` — Browse installed sapstack plugins
- `sapstack.runQualityGates` — Run quality gates (placeholder)

### Commands Stubbed (v1.7.0)
- `sapstack.session.showFollowup` — Follow-up request checklist webview
- `sapstack.session.showVerdict` — Verdict rendering webview
- `sapstack.session.handoff` — Session handoff to another surface
- `sapstack.session.exportBundle` — Export session as shareable bundle
- `sapstack.session.openInWeb` — Open session in web viewer

### Architecture
- **TypeScript strict mode** — Full type safety
- **Schema validation** — AJV-based validation for session artifacts
- **File-based state** — All session data in `.sapstack/sessions/*/` YAML files
- **Tree data providers** — Extensible tree view model for sessions, followups, plugins
- **Debounced file watching** — Efficient refresh with 500ms debounce

### Configuration
- `sapstack.sapstackPath` — Path to sapstack repository
- `sapstack.language` — Response language (ko/en/de/ja/auto)
- `sapstack.country` — Localization country code
- `sapstack.sessionsRoot` — Session directory (default: `.sapstack/sessions`)
- `sapstack.defaultRelease` — Default SAP release (ECC/S4/RISE/Cloud PE)
- `sapstack.showInStatusBar` — Display current session in status bar
- `sapstack.autoOpenFollowup` — Auto-open followup after Turn 2
- `sapstack.piiScanEnabled` — Scan evidence for PII before processing
- `sapstack.webViewerUrl` — Web viewer URL for session sharing

### Known Limitations
- Webview panels (followup checklist, verdict) deferred to v1.7.0
- PII scanning is configured but not yet implemented
- SAP Note resolution and T-code lookup are stubs
- Quality gates check is a stub
- No Claude API integration yet (placeholder architecture)

### Dependencies
- `js-yaml` — YAML parsing and serialization
- `ajv` — JSON Schema validation
- `@types/vscode` — VS Code API types
- `esbuild` — Fast TypeScript bundling

---

## v1.5.0 (2026-04-12) — Contract Definition

### Status
- Stub implementation with command contract in `package.json`
- `contributes` section defines full command API
- YAML validation via GitHub Pages schemas (requires Red Hat YAML extension)
- Snippets for ABAP and sapstack YAML schemas

### Why Stub First?
Evidence Loop is file-based (no backend service), so the contract
is more important than the implementation. Users can edit session files
directly with schema IntelliSense before TypeScript code exists.

---

## v1.4.0 and earlier
See git history for pre-1.5.0 development.
