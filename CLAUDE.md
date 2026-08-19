# CLAUDE.md — sapstack

## Project operating contract

Before changing this repository or answering any SAP question, read `AGENTS.md`.
Universal Rules, the dual-mode response format (Quick Advisory / Evidence Loop),
plugin and subagent routing, the compatibility matrix, multilingual behavior,
and the reference map all live there. `ETHOS.md` holds the _why_ behind those
rules, and `CONTRIBUTING.md` holds the contribution gates.

Keep this file limited to Claude Code / gstack routing so project instructions
do not diverge across agents. Do not restate project facts here — point at
`AGENTS.md` instead.

## Claude Code entry points

- Knowledge source: `plugins/*/skills/*/SKILL.md` (Korean: `references/ko/`)
- Slash commands: `commands/*.md`
- Subagents: `agents/*.md`
- Install as a marketplace plugin:
  `/plugin marketplace add https://github.com/BoxLogoDev/sapstack`

## Skill routing

When the user's request matches an available skill, invoke it via the Skill
tool. When in doubt, invoke the skill.

- Evidence Loop diagnosis session → `/sap-session-start`, then
  `/sap-session-add-evidence` and `/sap-session-next-turn`
- Module-specific workflows → the matching `commands/sap-*.md` slash command
- Bugs/errors in this repository's own code → `/investigate`
- Code review / diff check → `/review`
- Ship / deploy / PR → `/ship` or `/land-and-deploy`
- Save progress → `/context-save`; resume → `/context-restore`

## Quality gates before committing

```bash
./scripts/lint-frontmatter.sh
./scripts/check-marketplace.sh
./scripts/check-hardcoding.sh --strict
./scripts/check-tcodes.sh
npm run check:doc-stats
```
