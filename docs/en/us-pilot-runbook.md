# US pilot runbook — sapstack Desktop for LS Mtron USA

> Audience: LS ITC (kit builder, SAP development) and LS Mtron USA IT (deployment).
> Korean operations references: [provisioning](../provisioning.md), [CBO snapshots](../cbo-snapshot.md), [desktop install](../desktop-install.md).

## 1. Who does what

| Role | Responsibility |
| --- | --- |
| LS ITC (Korea) | Nightly CBO snapshot export from the shared S/4 landscape (DS4/QS4), kit build, LLM key, receiving change requests |
| LS Mtron USA IT | Distributing the kit to business PCs, outbound network allowance, PC prerequisites |
| Business users (`@lsinjectionusa.com`) | Asking questions about custom (Z/Y) programs; raising change requests to LS ITC (from v2.6) |

The US entity uses the **same global S/4 instance** as Korea, so the Korean snapshot is the correct source. Nothing in this setup writes to SAP.

## 2. What the kit contains

`sapstack-Desktop-CBO-<SID>-<date>-en.zip`

- `sapstack-Desktop-<version>-Portable-x64.exe` — no installation, no admin rights
- `cbo\<SID>\` — offline copy of custom ABAP sources (`manifest.yaml`, `catalog.*`, `guide.md`, `guide.en.md`, `src\`)
- `provision.yaml` — administrator configuration (LLM connection, English UI, business-user mode)
- `README.txt` — five-line user instructions

## 3. PC prerequisites (LS Mtron USA IT)

- Windows 10/11 x64, about 1 GB free disk, no SAP GUI or SAP network access required
- Outbound HTTPS to the LLM endpoint: `api.anthropic.com` (Anthropic API key) **or** the Microsoft Foundry resource host if that option is chosen
- Optional outbound HTTPS to `github.com` / `objects.githubusercontent.com` for in-app updates; otherwise redistribute the portable exe
- Proxy: the app honours system proxy settings

## 4. Building the kit (LS ITC)

1. Make sure the nightly export finished: `~/.sapstack/cbo/<SID>/manifest.yaml` has today's `exported_at` and `status` is not `failed`. Review `meta/pii-report.json`.
2. Copy `scripts/cbo/examples/provision-lsmtron-usa.yaml` to `provision.yaml`, fill in the API key (dedicated key with a spend limit).
3. Build:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/cbo/make-distribution.ps1 -Sid DS4 -Language en -ProvisionFile .\provision.yaml
   ```
4. **Mandatory smoke test** on a clean PC or the provisioning sandbox (see `docs/provisioning.md`): unzip, run the exe, no setup screens appear, ask `What does program ZFI0171 do?`, the answer is in English and ends with `Snapshot as of: <date>`.
5. Deliver the ZIP through an approved channel only (it contains the plaintext key until first run) and delete the source copy afterwards.

## 5. First run (business user)

1. Extract the ZIP anywhere (keep the folder together) and run the portable exe.
2. The app applies `provision.yaml`, registers `cbo\<SID>` as a source, and opens the chat in English.
3. Ask about a custom program by name (`ZFI0171`, `SAPMZFI0010`) or in plain words ("our custom invoice report").
4. Every answer ends with **Snapshot as of** — if it is older than 30 days, ask LS ITC for a refresh.

## 6. LLM backend

- **Default: Anthropic API key** — measured quality baseline, zero code. Use a dedicated key in an Anthropic Console workspace ("LS Mtron USA pilot") with a monthly spend limit.
- **Alternative: Claude via Microsoft Foundry** — for Azure billing or US data-residency requirements. Requires the US entity's own pay-as-you-go Azure subscription (Korean EA agreements do not cover Foundry Claude). Configure in `provision.yaml`:
  ```yaml
  llm:
    kind: api_key
    apiKey: <Foundry key>
    baseUrl: https://<resource>.services.ai.azure.com/anthropic
    api: anthropic-messages
    models: [claude-sonnet-4-5]
  ```
- Local (offline) models are not recommended for this pilot: 4–12B models have no SAP knowledge (see `docs/eval/`).

## 7. Snapshot refresh

Weekly, LS ITC builds a snapshot-only ZIP and publishes it to the agreed SharePoint/Teams library:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/cbo/make-distribution.ps1 -Sid DS4 -SnapshotOnly
```

Users import it via **Settings › CBO snapshots › Import from ZIP**. The app only replaces a snapshot when the new `exported_at` is newer.

## 8. Data protection

- The snapshot is a **read-only copy of custom code**; no business data tables are exported.
- Masked in the snapshot before it leaves Korea: Korean resident IDs, business registration numbers, credit cards, US SSNs, hard-coded passwords. Reported (not altered): bank accounts, phone numbers, e-mails — reviewed by LS ITC before shipping.
- In-app scrubbing of chat input covers Korean patterns plus US SSN (`###-##-####`), EIN and phone numbers; SAP document and PO numbers are never altered.
- The assistant never modifies ABAP or writes to SAP. Change requests (v2.6) are documents, not code.
- Crash reports contain a hashed host name only; set `airGapped: true` in `provision.yaml` to disable crash reporting and update polling entirely.

## 9. Support

- In the app: **Save support bundle** (sensitive data excluded) → send the file to LS ITC.
- Typical issues: no answer / "connection failed" → outbound HTTPS blocked (section 3); Korean text in the UI → `language: en` missing in `provision.yaml`; "not in the snapshot" → object outside the exported packages or created after the snapshot date.

## 10. Updates

- Portable exe: redistribute a new kit or just the new exe (keep `cbo\` and `provision.yaml`).
- In-app update from GitHub Releases works when outbound access is allowed; it is disabled when `airGapped: true`.

## 11. v2.6 — Microsoft sign-in and change requests

- **Microsoft sign-in** with the LS ITC tenant (US users as B2B guests). When the kit's `provision.yaml` has an `auth:` block, the app shows a sign-in screen before anything else. Access is controlled by an Entra security group; unassigned users see a clear message to contact LS ITC IT. Offline use is allowed for `offlineGraceDays` (default 14) after the last online check. **Settings › Account** shows who is signed in and offers Sign out (use it on shared PCs). Admin setup: `docs/entra-signin.md` (Korean).
- **Request a change to this program** button under an answer about a custom (Z/Y) program: opens a short form pre-filled from the conversation (title, affected objects, your original question, the assistant's explanation). Add the expected behavior and a priority, optionally attach the conversation, and submit. A change-request work item is created in LS ITC's Azure DevOps Boards under your own name — nothing is changed in SAP. Track it in **Settings › Change requests** (My requests, Refresh); LS ITC receives e-mail/Teams notifications and you get an e-mail when the state changes. If the PC is offline the draft is kept locally and can be retried from the same page.
- Configuration lands in `provision.yaml` (`auth:` and `changeRequests:` blocks, see the example file).
