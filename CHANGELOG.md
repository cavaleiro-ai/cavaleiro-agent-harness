# Changelog

All notable changes to Cavaleiro Agent Harness are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and releases use [Semantic Versioning](https://semver.org/). The original project's history is kept unchanged below the separator.

## [Unreleased]

- Identity cleanup: the README files, `CONTRIBUTING.md`, `SECURITY.md`, `.github/`, and the package and plugin manifests now name only Cavaleiro AI (author, homepage, repository, contacts). The original project's funding, community, and social blocks were removed from the README; the README credit is a single line under **License**. Plugin manifests' `repository` and the tests that pin that metadata now use the Cavaleiro identity. The inherited manuals under `docs/` use the Cavaleiro Agent Harness name; release notes, business and funding documents, and the authored guides are left as written.

## Cavaleiro Agent Harness 1.0.0 — 2026-10-17

First release of Cavaleiro Agent Harness, based on commit `76aaa77df6adc5b889e689007bf99b9a4f74af34` (release 2.2.3) of the original project. Every fix below has a regression test that fails on the original code and passes here; the evidence is in [docs/cavaleiro/ENGINEERING.md](docs/cavaleiro/ENGINEERING.md).

### Added

- `scripts/lib/toml-text.js`: a string-aware TOML structure scanner (table headers, key/value lines, dotted keys, multi-line strings and arrays) shared by the Codex merge scripts.
- A safety net in both Codex merges: the merged text must parse before it is written, and `merge-codex-config.js` also refuses to write if any existing value would change. They fail with an explanation instead of writing a `config.toml` that Codex cannot load.
- `pre:powershell:block-no-verify`: the PowerShell `PreToolUse` route now runs `block-no-verify` next to GateGuard, so `git commit --no-verify`, `-n`, and `core.hooksPath` overrides are blocked for PowerShell as they are for Bash. New test: `tests/hooks/powershell-no-verify-route.test.js`.
- Regression tests in `tests/scripts/codex-hooks.test.js` (9), `tests/hooks/mcp-health-check.test.js` (2), `tests/hooks/governance-capture.test.js`, `tests/hooks/pre-bash-commit-quality.test.js` (2), `tests/hooks/config-protection.test.js`, `tests/hooks/hook-flags.test.js`, and `tests/test_docs_governance_audit.py`.
- Documentation: [README.pt-BR.md](README.pt-BR.md), a complete Portuguese guide ([docs/cavaleiro/GUIA-PT-BR.md](docs/cavaleiro/GUIA-PT-BR.md)), an engineering report ([docs/cavaleiro/ENGINEERING.md](docs/cavaleiro/ENGINEERING.md)), README sections *What Cavaleiro Agent Harness adds*, *Compatibility*, and *Credits and license*.
- Community files: a bug report form, rebranded issue links, a Cavaleiro checklist in the pull request template, Contributor Covenant 2.1, and a security policy with private reporting at <https://github.com/cavaleiro-ai/cavaleiro-agent-harness/security/advisories/new>.

### Changed

- Rebranded the project to **Cavaleiro Agent Harness**: README title and banner, repository links (clone URLs, issues, discussions, CI badge), `package.json` `repository`/`homepage`/`bugs`, and `pyproject.toml` project URLs now point to `cavaleiro-ai/cavaleiro-agent-harness`. Identifiers are unchanged: npm package `ecc-universal`, commands `ecc`/`ecc-install`, plugin `ecc@ecc`, skill/agent/command/hook IDs, `ECC_*` variables, and config paths. Plugin manifests kept the original project's `repository` field.
- The original project's funding, partner, and hosted-service blocks in the README moved into a clearly labelled section.
- Fork safety: moved `release.yml`, `reusable-release.yml`, `generator-generic-ossf-slsa3-publish.yml`, `release-announce.yml`, `discussion-announce.yml`, `pr-burst-guard.yml`, `monthly-metrics.yml`, and `maintenance.yml` to [`.github/workflows-disabled/`](.github/workflows-disabled/README.md) (they publish to npm, sign releases, use non-`GITHUB_TOKEN` secrets, or write to issues for the original project). The release tests now read them from that folder. `CODEOWNERS` is `* @cavaleiro-ai`; `FUNDING.yml` was removed.
- `CONTRIBUTING.md` and `.github/PR_MODERATION.md` describe the fork's process (identifiers stay stable, regression tests, temporary `HOME` for installer tests, no publishing under the original project's identity).
- The commit-quality warning no longer tells agents to use `git commit --no-verify` (which `block-no-verify` rejects); it names `ECC_DISABLED_HOOKS=pre:bash:commit-quality` instead.
- `skills/ecc-tools-cost-audit/SKILL.md` no longer links to `../../ECC-Tools`, a sibling repository that is never shipped.
- The `docs-governance` fix is mirrored to `.agents/skills/` and to `pi/core/` (rebuilt with `node scripts/build-pi-core.js`, which also copies the updated `LICENSE`). Because skill file contents changed, `manifests/context-packs/skill-triggers@1.json` has a refreshed `registryDigest`; no skill description changed, so the hand-seeded triggers are unchanged.

### Fixed

- **Codex MCP merge duplicated an existing server table.** `merge-mcp-config.js` treated `[mcp_servers.chrome-devtools]` without a `command` (for example only `enabled = false`) as missing and appended a second table, so Codex rejected the whole `config.toml` while the sync reported success.
- **`--update-mcp` and `ECC_DISABLED_MCPS` missed quoted, spaced, and indented headers** (`[mcp_servers."chrome-devtools"]`) and then appended a duplicate. Inline (`chrome-devtools = { ... }`) and dotted-key servers are now left untouched with a warning instead of being duplicated.
- **Section removal deleted user content.** Removing a server table also removed the comment lines that introduce the next table and swallowed an indented following table; removal now stops after the table's last key/value line.
- **`merge-codex-config.js` re-opened tables defined with dotted keys** (`features.x = true` followed by an appended `[features]`; `explorer.description` inside `[agents]` followed by `[agents.explorer]`). That is valid TOML 0.5 (`@iarna/toml`) but invalid TOML 1.0, which Codex parses. Such tables are now skipped with the existing "could not be safely updated" warning.
- **`merge-codex-config.js` inserted keys inside multi-line strings.** A line such as `[Rules]` inside a `"""` string was taken as the first table, so the baseline keys were injected into the user's prompt text, never actually set, and duplicated on every run.
- **`merge-codex-config.js` wrote an unparseable file for inline parent tables.** With `agents = { explorer = { ... } }`, it appended `[agents.reviewer]` and `[agents.docs_researcher]`, which TOML forbids, and printed "Done". Those tables are now skipped with a warning.
- **Both Codex merges failed on a UTF-8 BOM** (`Unknown character "65279"`), as written by Windows PowerShell 5.1 `Set-Content`/`Out-File`, which rolled back the whole sync. The BOM is now accepted and preserved.
- **Managed hook config with a UTF-8 BOM was ignored** (`ecc/setup.json` or `ECC_HOOK_CONFIG`): `hooks.enabled: false` and the chosen profile silently fell back to "enabled, standard". Fixes original issue #3623.
- **`mcp-health-check` ran its PreToolUse logic for `PostToolUseFailure` events.** It read the event name only from `CLAUDE_HOOK_EVENT_NAME`, which Claude Code does not set, so failures were never recorded (no circuit breaker) and every MCP failure spawned the server as a probe, sometimes exiting 2. It now reads `hook_event_name` from the stdin payload first.
- **`mcp-health-check` let an MCP tool's own arguments pick the server.** A `server`/`connector` argument (`mcp__ssh__run_command {"server":"github"}`) blocked a healthy server or skipped the backoff of an unhealthy one. The `mcp__<server>__<tool>` name now takes precedence; explicit fields remain the fallback for non-`mcp__` tool names.
- **`governance-capture` labelled every PreToolUse event as `post`** (same environment-variable assumption) and emitted post-only security findings before the tool ran.
- **The `docs-governance` audit (`skills/docs-governance/scripts/audit-docs.py`) crashed on Windows whenever its output was captured.** Windows pipes default to the ANSI code page (cp1252), which cannot encode the report's `✓`/`✗`, so every run ended in `UnicodeEncodeError`; on Windows this made 107 of the 110 audit tests fail. The script now switches stdout/stderr to UTF-8 when they cannot encode those marks.
- **The strict commit-quality check blocked commits that only mention the word "debugger"** in JSDoc, block comments, or strings. It now matches `debugger` statements, including `if (x) debugger;` and `case 1: debugger;`.

### Security

- **The PowerShell tool bypassed `block-no-verify`.** On Windows, `git commit --no-verify` and `git -c core.hooksPath=... commit` through Claude Code's PowerShell tool skipped the git-hook guard entirely (see *Added*).
- **`config-protection` could be bypassed through NTFS aliases.** `.eslintrc.js::$DATA`, `.eslintrc.js.`, and `.eslintrc.js` with a trailing space open the protected file on Windows but did not match the protected name. They are now checked against the name the filesystem opens.
- Publishing and signing workflows cannot run from this repository by accident (see *Changed*).

---

## Original project history

The entries below are the original project's changelog at commit `76aaa77` (release 2.2.3), unchanged. Their "Unreleased" section describes the original `main` at that commit.

## Unreleased

### Changed

- GateGuard first-touch denials ask questions that fit the target: by class (instruction, test, prose, config, code) on its project-relative path, and for code by what the change touches. An edit that changes no public declaration asks for the in-module call sites instead of importers and public API, and the data-schema question is dropped when the change handles no data. Changes the hook cannot read with confidence keep the original four questions word for word.
- GateGuard's external-contract question ("name what outside this repository decides the format, units, timezone or protocol semantics") is opt-in through `GATEGUARD_EXTERNAL_CONTRACT_QUESTION`. Hidden-intent trials did not show it helps, so by default a code change that handles data asks only the data-schema question, and an unreadable change gets the original four questions and condensed hint.
- GateGuard credits investigation that already happened: a completed, non-error `Glob`, `Grep`, `LS`, or search-style Bash/PowerShell command in the current human turn that names the target and whose scope contains it passes the first touch with a note. `Read` never counts, nor do searches in the same batch, before a compaction, with error results, or whose filters exclude the target or limit the search to another directory. When a denial follows a search that nearly counted, it names that search and why it did not count.
- GateGuard passes comment and whitespace-only edits of code, test and prose files with a note, without marking the file checked, so the next change that alters code is still gated.
- GateGuard asks once for a batch of new files: after a new file is denied, later new files of the same class in the same real directory within the same human turn pass with a note.
- Read-only shell commands (`ls`, `cat`, `rg`, `git status`/`log`/`diff`, `Get-ChildItem`, …) no longer use up the once-per-session routine shell gate; the first other command is still gated (#2573).
- GateGuard session state keyed by a session id or transcript path now expires after 8 idle hours instead of 30 minutes; the project-directory fallback keeps 30 minutes.
- Add opt-in `GATEGUARD_FACT_FORCE_MAX_DENIALS`, a per-session denial cap: once that many first-touch denials have been issued, further new paths pass through (counted in `cap_allows`). Unset keeps the current behaviour; a malformed value is reported once on stderr and leaves the gate uncapped (#2755, thanks @SulimanAbdulrazzaq; closes #2608).
- GateGuard loads its target-classification, transcript, search-matching and change-profile modules only on the calls that use them, and parses only the searches that name the target, so shell commands and edits of already checked files stay within a few milliseconds of the previous hook.
- Add a development-only harness, `docker/gateguard-effectiveness/`, that runs real Claude sessions on six trapped coding tasks with no gate, the gate, the gate without the question meant to catch each trap, and a placebo gate, and grades the results with hidden graders (see `docs/gateguard/question-effectiveness.md`).
- Report that harness's pilot: 72 sessions in which every arm passed every trial, so it measured the gate's cost (about 45% more turns) and nothing about its effect. Add a second runner, `run-intent.js`, for exploratory effectiveness measurements: the deciding fact exists only in a simulated user's hidden intent and sessions are multi-turn. Scenario files omit declared gate-question targets, but the authors knew the taxonomy and this is not blind authorship.
- Add opt-in `GATEGUARD_METRICS` decision metrics (codes only, never paths, commands or content) and `scripts/gateguard-report.js` to summarise them.
- Sensitive targets (`.env*`, keys and certificates, `credentials*`, `secrets.*`, `auth`/`security`/`payment(s)`/`billing`/`migrations` path segments, `.github/workflows/`) and files with more than one hard link get none of these allowances, judged on the path as written and its real location, and are gated in subagents too. `GATEGUARD_EXEMPT_GLOBS` still takes precedence.
- Newly denied: a subagent's first touch of a sensitive or hard-linked file, and the first NotebookEdit of each notebook. Every other rule only removes denials and never returns an `allow` decision. See `skills/gateguard/SKILL.md`.

### Fixed

- GateGuard keys checked files by canonical path, resolving relative targets against the tool `cwd`, so `a.py`, `./a.py`, and the absolute path (or differently cased and separated Windows spellings) share one first touch. Keys from earlier state files are still honoured.
- GateGuard gates a MultiEdit call as its `tool_input.file_path` when its entries do not name their own path, which is the tool's own shape; such calls were never gated before, including on sensitive files.
- GateGuard gates NotebookEdit as a first-touch edit of its `notebook_path`; notebooks were never gated before.
- GateGuard prior-search credit no longer counts a search that never saw the target. File-type filters (`rg -t`/`-T`/`--type`/`--type-not`, `fd -e`/`--extension`, the Grep tool's `type`), the Glob tool's pattern, shell glob operands, and git pathspecs now filter like include globs, so `rg -t py tokenizer src` or `Glob **/tokenizer.py` no longer credits `tokenizer.js`. A search confined to the target's own file name (`Glob **/tokenizer.js`, `find -name tokenizer.js`, Grep `glob: 'tokenizer.js'`) is a lookup and never credits it. PowerShell searches keep backslashes as path separators.
- GateGuard no longer passes an edit as comment-only when its text contains U+2028, U+2029, or U+0085, which end a JavaScript or C# line comment.

## 2.2.3 - 2026-10-01

### Changed

#### Naming

- `pi/core` refers to the project as ECC only. The generated README and the bundled `blueprint` skill no longer expand the name; profile contents, package name (`ecc-pi-core`) and paths are unchanged.

### Fixed

#### Release workflow

- Poll the npm registry for up to five minutes after `npm publish` before verifying the published artifact, so a slow registry no longer fails the run before `latest` is promoted and the GitHub Release is created.

## 2.2.2 - 2026-09-15

### Added

#### Pi core profile

- Add `pi/core/`, a curated Pi-native skills+prompts-only profile for downstream packagers that mirror GitHub Releases: 123 portable engineering skills and 24 pure prompt-workflow commands, no extensions, no hooks, no runtime downloads, and no network or SaaS dependencies. The profile is generated deterministically from the explicit include/exclude lists in `manifests/pi-core.json` by `scripts/build-pi-core.js` and committed so release tarballs contain it verbatim; `pi/core/CURATION.md` lists every excluded skill and command with its reason.
- The build fails on safety violations: non-allowlisted URL hosts, pipe-to-shell or fetch-and-run download forms, secrets or tokens, absolute per-user home paths, symlinks, invalid SKILL.md frontmatter, and duplicate skill names. The `council` skill ships as `ecc-council` inside pi/core to avoid catalog name clashes.
- CI rebuilds pi/core and verifies it is committed up to date, then installs the Pi coding agent CLI and proves the profile loads fully offline (`PI_OFFLINE=1`), asserting every curated command is actually registered. The release workflow verifies VERSION matches the tag and that pi/core is current.

### Fixed

#### Packaging

- Explicitly include the compiled OpenCode payload in the npm package and verify that packing builds it from a clean state with lifecycle scripts enabled.

#### Memory and MCP

- Distinguish incomplete memory reads from missing records and classify directory traversal failures (`90ef62cb`, `8321021c`).
- Accept the reserved `_meta` parameter on memory MCP ping requests (`380f4b35`).

#### Hooks and Windows compatibility

- Keep `hooks.json` within Claude Code's schema by moving stable hook metadata into a validated sidecar (`1ac07903`).
- Handle stuck optional values and long-option prefixes in the no-verify guard (`4f373874`).
- Support Windows linter paths and ESLint 9 (`2083c983`).
- Tolerate missing Windows device IDs in settings updates while retaining full-precision inode checks and strict matching when both device IDs are available (`d3af582b`).

#### Workflow guidance and catalog

- Filter epic sync issues by label (`3033436d`).
- Remove instructions to auto-merge dependency bumps and synchronize localized merge authority (`22d7ed51`, `678c6dea`).
- Keep common naming and Boolean guidance language-neutral (`072e4684`, `a0ecb793`, `013ed0a8`).
- Distinguish the `prp-pr` command alias (`cc91c24f`).
- Correct Rails skill discovery, invoice tax calculation order, and framework documentation (`b6ddd13a`).
- Remove Serply and Squish catalog entries (`c4904e3f`).

#### Dependency security

- Update `lru` to 0.18.2 for RUSTSEC-2026-0253 (`4fc950c4`).
- Update `js-yaml` to 4.3.2 for GHSA-2883-xcg3-v3hh (`549c1469`).

## 2.2.0 - 2026-08-25

### Added

- Guided, manifest-driven setup across supported harnesses, with exact install-state ownership, health checks, repair, and uninstall workflows.
- Native Antigravity 2.0 installation under `.agents/`, including rules, workflows, skills, and adapted agents, plus a cross-platform installation guide.
- New workflow and operator capabilities including the Itô skill family, an experimental Nasiko CLI lifecycle bridge, multi-model council review, dev-team collaboration, agent evaluation, living-docs governance, secure terminal opening, and TasteForge multimodal workflows.
- A thin Pi adapter and expanded cross-harness support, release artifact lifecycle testing, Docker-based CLI testing, and stronger Python validation.

### Changed

- Default MCP connector set reduced to a single connector (`chrome-devtools`) per the new connector policy (`docs/MCP-CONNECTOR-POLICY.md`). The six previous defaults (`github`, `context7`, `exa`, `memory`, `playwright`, `sequential-thinking`) were retired after the June 2026 audit: their jobs are covered by skills wrapping CLIs/REST APIs (`github-ops`, `documentation-lookup`, `exa-search`, e2e skills) or by harness-native features (memory, extended thinking, web search). All six remain opt-in via `mcp-configs/mcp-servers.json`.
- OpenCode home installs now use its canonical `~/.config/opencode` location, safely discover and migrate unchanged ECC-managed files from legacy `~/.opencode` installs, and preserve modified legacy files for review. Bundled agents inherit the model selected by the user instead of pinning an Anthropic provider.
- `skill-comply` is now part of the install manifest and npm distribution, with generated Python caches excluded from both install and package surfaces.
- Release automation now verifies the tag is exactly on `origin/main`, fails closed on npm registry errors, tests the exact packed artifact across Linux, macOS, and Windows, publishes stable versions to a staging dist-tag, verifies registry bytes before promoting `latest`, creates the GitHub Release after promotion, and uses reviewed release notes.

### Fixed

- `ecc memory` writes and `--body-file` reads failed on Windows under Node 22.12-22.16 and 24.0-24.1. libuv resolved path-based `stat()`/`lstat()` through `GetFileInformationByName` without setting the volume serial, while `fstat()` reported it, so the memory vault's TOCTOU guard rejected every operation. Fixed upstream in libuv 1.51.0; the guard no longer depends on the runtime's patch level. The guard's stat calls now request `BigInt` values, so Windows file IDs past `Number.MAX_SAFE_INTEGER` can no longer collapse two distinct files into one identity.
- Selective reinstall now merges the prior ownership ledger, so later module additions do not orphan files from earlier installs and uninstall removes the complete managed surface.
- Legacy Codex sync uninstall now uses ownership evidence, preserves user files, and requires an explicit opt-in for weaker marker-only cleanup.
- The experimental Nasiko CLI lifecycle bridge now recovers locks only after confirming the recorded owner is dead, preserves replacement locks, strictly rejects malformed tar sizes, padding, terminators, and trailing data, and fails uninstall when staged files remain.
- Hook, plan-canvas, session, memory, observer, skill-evolution, Discord delivery, and Windows compatibility regressions fixed across the runtime.

### Release audit

- Audited the complete delta from `v2.1.0`: 108 commits across 530 files, with 40,299 insertions and 4,679 deletions on the pre-release baseline.
- The release gate installs and exercises the exact npm archive, including cumulative ownership, doctor, drift detection, repair, uninstall, and user-file preservation.

## 2.0.0 - 2026-06-09

### Added

- Discord community launch: server + GitHub PR/issue/release feed, `release-announce.yml` workflow (announce + pin + Discussions cross-post), and a dependency-free community bot (`scripts/discord/ecc-bot.mjs`) with `/ecc`, `/help`, `/skill`, `/docs`, `/release`.
- `orch-*` orchestrator skill family and dynamic workflow team orchestration.
- `kubernetes-patterns` skill, worktree-lifecycle service, MCP inventory (`ecc.mcp.v1`), codex-worktree and opencode session adapters.

### Fixed

- Plugin hooks silently no-oped on Node 21+ (`require.main` undefined under `node -e`).
- Windows reliability: `CLAUDE_PLUGIN_ROOT` normalization, stdin prompt passing, symlink/chmod test guards.
- Session-end `$`-sequence corruption, project-detect boundary matching, install manifest gaps, corrupted legacy shim truncation.

### Changed

- Version graduated to 2.0.0 stable across package, plugin, marketplace, OpenCode, and agent metadata.
- Smaller default OpenCode install surface; `rules/zh` removed from the always-loaded default install.

## 2.0.0-rc.1 - 2026-04-28

### Highlights

- Adds the public ECC 2.0 release-candidate surface for the Hermes operator story.
- Documents ECC as the reusable cross-harness substrate across Claude Code, Codex, Cursor, OpenCode, and Gemini.
- Adds a sanitized Hermes import skill surface instead of publishing private operator state.

### Release Surface

- Updated package, plugin, marketplace, OpenCode, agent, and README metadata to `2.0.0-rc.1`.
- Added `docs/releases/2.0.0-rc.1/` with release notes, social drafts, launch checklist, handoff notes, and demo prompts.
- Added `docs/architecture/cross-harness.md` and regression coverage for the ECC/Hermes boundary.
- Kept `ecc2/` versioning independent for now; it remains an alpha control-plane scaffold unless release engineering decides otherwise.

### Notes

- This is a release candidate, not a GA claim for the full ECC 2.0 control-plane roadmap.
- Prerelease npm publishing should use the `next` dist-tag unless release engineering explicitly chooses otherwise.

## 1.10.0 - 2026-04-05

### Highlights

- Public release surface synced to the live repo after multiple weeks of OSS growth and backlog merges.
- Operator workflow lane expanded with voice, graph-ranking, billing, workspace, and outbound skills.
- Media generation lane expanded with Manim and Remotion-first launch tooling.
- ECC 2.0 alpha control-plane binary now builds locally from `ecc2/` and exposes the first usable CLI/TUI surface.

### Release Surface

- Updated plugin, marketplace, Codex, OpenCode, and agent metadata to `1.10.0`.
- Synced published counts to the live OSS surface: 38 agents, 156 skills, 72 commands.
- Refreshed top-level install-facing docs and marketplace descriptions to match current repo state.

### New Workflow Lanes

- `brand-voice` — canonical source-derived writing-style system.
- `social-graph-ranker` — weighted warm-intro graph ranking primitive.
- `connections-optimizer` — network pruning/addition workflow on top of graph ranking.
- `customer-billing-ops`, `google-workspace-ops`, `project-flow-ops`, `workspace-surface-audit`.
- `manim-video`, `remotion-video-creation`, `nestjs-patterns`.

### ECC 2.0 Alpha

- `cargo build --manifest-path ecc2/Cargo.toml` passes on the repository baseline.
- `ecc-tui` currently exposes `dashboard`, `start`, `sessions`, `status`, `stop`, `resume`, and `daemon`.
- The alpha is real and usable for local experimentation, but the broader control-plane roadmap remains incomplete and should not be treated as GA.

### Notes

- The Claude plugin remains limited by platform-level rules distribution constraints; the selective install / OSS path is still the most reliable full install.
- This release is a repo-surface correction and ecosystem sync, not a claim that the full ECC 2.0 roadmap is complete.

## 1.9.0 - 2026-03-20

### Highlights

- Selective install architecture with manifest-driven pipeline and SQLite state store.
- Language coverage expanded to 10+ ecosystems with 6 new agents and language-specific rules.
- Observer reliability hardened with memory throttling, sandbox fixes, and 5-layer loop guard.
- Self-improving skills foundation with skill evolution and session adapters.

### New Agents

- `typescript-reviewer` — TypeScript/JavaScript code review specialist (#647)
- `pytorch-build-resolver` — PyTorch runtime, CUDA, and training error resolution (#549)
- `java-build-resolver` — Maven/Gradle build error resolution (#538)
- `java-reviewer` — Java and Spring Boot code review (#528)
- `kotlin-reviewer` — Kotlin/Android/KMP code review (#309)
- `kotlin-build-resolver` — Kotlin/Gradle build errors (#309)
- `rust-reviewer` — Rust code review (#523)
- `rust-build-resolver` — Rust build error resolution (#523)
- `docs-lookup` — Documentation and API reference research (#529)

### New Skills

- `pytorch-patterns` — PyTorch deep learning workflows (#550)
- `documentation-lookup` — API reference and library doc research (#529)
- `bun-runtime` — Bun runtime patterns (#529)
- `nextjs-turbopack` — Next.js Turbopack workflows (#529)
- `mcp-server-patterns` — MCP server design patterns (#531)
- `data-scraper-agent` — AI-powered public data collection (#503)
- `team-builder` — Team composition skill (#501)
- `ai-regression-testing` — AI regression test workflows (#433)
- `claude-devfleet` — Multi-agent orchestration (#505)
- `blueprint` — Multi-session construction planning
- `everything-claude-code` — Self-referential ECC skill (#335)
- `prompt-optimizer` — Prompt optimization skill (#418)
- 8 Evos operational domain skills (#290)
- 3 Laravel skills (#420)
- VideoDB skills (#301)

### New Commands

- `/docs` — Documentation lookup (#530)
- `/aside` — Side conversation (#407)
- `/prompt-optimize` — Prompt optimization (#418)
- `/resume-session`, `/save-session` — Session management
- `learn-eval` improvements with checklist-based holistic verdict

### New Rules

- Java language rules (#645)
- PHP rule pack (#389)
- Perl language rules and skills (patterns, security, testing)
- Kotlin/Android/KMP rules (#309)
- C++ language support (#539)
- Rust language support (#523)

### Infrastructure

- Selective install architecture with manifest resolution (`install-plan.js`, `install-apply.js`) (#509, #512)
- SQLite state store with query CLI for tracking installed components (#510)
- Session adapters for structured session recording (#511)
- Skill evolution foundation for self-improving skills (#514)
- Orchestration harness with deterministic scoring (#524)
- Catalog count enforcement in CI (#525)
- Install manifest validation for all 109 skills (#537)
- PowerShell installer wrapper (#532)
- Antigravity IDE support via `--target antigravity` flag (#332)
- Codex CLI customization scripts (#336)

### Bug Fixes

- Resolved 19 CI test failures across 6 files (#519)
- Fixed 8 test failures in install pipeline, orchestrator, and repair (#564)
- Observer memory explosion with throttling, re-entrancy guard, and tail sampling (#536)
- Observer sandbox access fix for Haiku invocation (#661)
- Worktree project ID mismatch fix (#665)
- Observer lazy-start logic (#508)
- Observer 5-layer loop prevention guard (#399)
- Hook portability and Windows .cmd support
- Biome hook optimization — eliminated npx overhead (#359)
- InsAIts security hook made opt-in (#370)
- Windows spawnSync export fix (#431)
- UTF-8 encoding fix for instinct CLI (#353)
- Secret scrubbing in hooks (#348)

### Translations

- Korean (ko-KR) translation — README, agents, commands, skills, rules (#392)
- Chinese (zh-CN) documentation sync (#428)

### Credits

- @ymdvsymd — observer sandbox and worktree fixes
- @pythonstrup — biome hook optimization
- @Nomadu27 — InsAIts security hook
- @hahmee — Korean translation
- @zdocapp — Chinese translation sync
- @cookiee339 — Kotlin ecosystem
- @pangerlkr — CI workflow fixes
- @0xrohitgarg — VideoDB skills
- @nocodemf — Evos operational skills
- @swarnika-cmd — community contributions

## 1.8.0 - 2026-03-04

### Highlights

- Harness-first release focused on reliability, eval discipline, and autonomous loop operations.
- Hook runtime now supports profile-based control and targeted hook disabling.
- NanoClaw v2 adds model routing, skill hot-load, branching, search, compaction, export, and metrics.

### Core

- Added new commands: `/harness-audit`, `/loop-start`, `/loop-status`, `/quality-gate`, `/model-route`.
- Added new skills:
  - `agent-harness-construction`
  - `agentic-engineering`
  - `ralphinho-rfc-pipeline`
  - `ai-first-engineering`
  - `enterprise-agent-ops`
  - `nanoclaw-repl`
  - `continuous-agent-loop`
- Added new agents:
  - `harness-optimizer`
  - `loop-operator`

### Hook Reliability

- Fixed SessionStart root resolution with robust fallback search.
- Moved session summary persistence to `Stop` where transcript payload is available.
- Added quality-gate and cost-tracker hooks.
- Replaced fragile inline hook one-liners with dedicated script files.
- Added `ECC_HOOK_PROFILE` and `ECC_DISABLED_HOOKS` controls.

### Cross-Platform

- Improved Windows-safe path handling in doc warning logic.
- Hardened observer loop behavior to avoid non-interactive hangs.

### Notes

- `autonomous-loops` is kept as a compatibility alias for one release; `continuous-agent-loop` is the canonical name.

### Credits

- inspired by [zarazhangrui](https://github.com/zarazhangrui)
- homunculus-inspired by [humanplane](https://github.com/humanplane)
