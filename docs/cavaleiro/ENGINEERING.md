# Cavaleiro Agent Harness — engineering report

This report documents how Cavaleiro Agent Harness 1.0.0 was derived from the original project: the architecture as studied, the test baseline, every finding with its severity and evidence, what was changed and how it was verified, and what was deliberately left alone. Portuguese readers can start with the [guia em português](GUIA-PT-BR.md).

- **Original project:** branch `main`, commit `76aaa77df6adc5b889e689007bf99b9a4f74af34` (release 2.2.3), MIT license.
- **Derivative:** `cavaleiro-ai/cavaleiro-agent-harness`, release 1.0.0 (2026-10-17).
- **Environment used:** Windows 10 (19045), Node.js 24.15.0, npm 11.12.1, Python 3.12 (project-local `uv` virtual environment), Git for Windows Bash, ripgrep 14.1.1. The machine was shared with other heavy jobs, so CPU was often at 100% (relevant for timing-sensitive tests).

## 1. Architecture map

```text
 content (Markdown + YAML)            distribution surfaces                 targets
 ┌───────────────────────┐   ┌──────────────────────────────────┐   ┌──────────────────────────┐
 │ skills/ agents/       │──>│ .claude-plugin/ .codex-plugin/   │──>│ Claude Code plugin cache │
 │ commands/ rules/      │   │ .qoder-plugin/ (native plugins)  │   │ Codex plugin cache       │
 │ contexts/ mcp-configs/│   ├──────────────────────────────────┤   ├──────────────────────────┤
 │ legacy-command-shims/ │──>│ ecc CLI: scripts/ecc.js          │──>│ ~/.claude, ~/.codex,     │
 └───────────────────────┘   │  setup → claude-plugin-setup     │   │ .cursor/, .gemini/,      │
                             │  install → install-apply →       │   │ .opencode, .kimi-code/,  │
 manifests/                  │   request → plan (manifests) →   │   │ .github/ (Copilot), ...  │
 install-profiles/modules/ ─>│   install-executor → targets/*   │   │ + install-state.json     │
 components.json             │  doctor/repair/uninstall →       │   └──────────────────────────┘
                             │   install-lifecycle              │
                             ├──────────────────────────────────┤   ┌──────────────────────────┐
                             │ legacy Codex sync:               │──>│ ~/.codex/config.toml,    │
                             │  sync-ecc-to-codex.sh →          │   │ AGENTS.md, prompts,      │
                             │  merge-codex-config.js,          │   │ ownership manifest       │
                             │  merge-mcp-config.js, toml-text  │   └──────────────────────────┘
                             └──────────────────────────────────┘
 runtime: hooks/hooks.json ─> plugin-hook-bootstrap.js ─> run-with-flags.js (hook-flags: profile,
          ECC_DISABLED_HOOKS, ecc/setup.json) ─> hook run(): block-no-verify, config-protection,
          gateguard-fact-force, mcp-health-check, governance-capture, bash dispatchers
          (commit-quality, dev-server, tmux, push reminders), session-start/end, pre-compact, ...
```

| Component | Location | Responsibility and notes |
|---|---|---|
| Content | `skills/` (311), `agents/` (71), `commands/` (97), `rules/` | Markdown with YAML frontmatter. Validated by `scripts/ci/validate-*.js`; counts are pinned in the README and checked by `scripts/ci/catalog.js`. |
| Plugin manifests | `.claude-plugin/`, `.codex-plugin/`, `.qoder-plugin/` | Marketplace `ecc`, plugin `ecc@ecc`. Their `repository` fields are pinned by `tests/plugin-manifest.test.js`. |
| CLI | `scripts/ecc.js` (bin `ecc`, `ecc-universal`), `scripts/install-apply.js` (bin `ecc-install`) | Subcommands: setup, install (incl. guided multi-harness wizard), plan, catalog, consult, profile, doctor, repair, uninstall, list-installed, memory, sessions, status, and more. |
| Installer core | `scripts/lib/install/`, `scripts/lib/install-targets/`, `scripts/lib/install-executor.js`, `scripts/lib/install-state.js`, `scripts/lib/install-lifecycle.js` | Resolves manifests into a plan per target, writes with ownership tracking, and records install-state so doctor/repair/uninstall touch only ECC-owned files. |
| Codex legacy sync | `scripts/sync-ecc-to-codex.sh`, `scripts/codex/*.js`, `scripts/lib/codex-legacy-sync.js` | Bash orchestrator with backup, ownership manifest, and rollback; TOML merges in Node (`@iarna/toml`, TOML 0.5). |
| Hooks | `hooks/hooks.json` (+ `hooks.metadata.json` IDs and fingerprints), `hooks/codex-hooks.json`, `hooks/qoder-hooks.json`, `scripts/hooks/` | Bootstrap locates the plugin root, `run-with-flags.js` gates by profile and disabled IDs, then calls a module's `run(raw)` in-process or spawns it. Exit 2 blocks; advisory hooks fail open. |
| Adapters | `.cursor/`, `.opencode/` (TypeScript plugin, built to `dist`), `.gemini/`, `.zed/`, `.kiro/`, `.agents/skills/`, `pi/core/`, `.github/copilot-instructions.md` | Harness-specific formats generated from or mirroring the canonical content. |
| Python | `src/llm/` (package `llm-abstraction`), Python scripts inside some skills | Tested with pytest; linted with ruff and mypy in CI. |
| 2.0 control plane (alpha) | `ecc2/` (Rust) | Control-plane scaffold; not touched. |
| Tests | `tests/**/*.test.js` (422 files) run by `tests/run-all.js`, one child process per file; `tests/test_*.py` | No shared test framework: most files use a small inline `test()` helper; some use `node:test`. |
| CI | `.github/workflows/ci.yml` (matrix: 3 OS × Node 18/20/22 × npm/pnpm/yarn/bun), plus validate, packed-install lifecycle, Pi core, Python, security, coverage, lint | Release, signing, announcement, moderation, and metrics workflows were moved to `.github/workflows-disabled/`. |

Extension points: new skills, agents, commands, and rules are files plus manifest entries (`manifests/install-*.json`, `agent.yaml`, `package.json` `files`); new hooks are `hooks.json` entries with a matching `hooks.metadata.json` record (`node scripts/ci/validate-hooks.js --update-fingerprints`); new install targets live in `scripts/lib/install-targets/` and `scripts/lib/install-targets/registry.js`.

## 2. Baseline

Commands (run against an untouched copy of the original tree, with `HOME`, `USERPROFILE`, and `XDG_CONFIG_HOME` pointed at a throwaway directory, `CLAUDE_CODE_PACKAGE_MANAGER=npm`, and `GIT_CONFIG_NOSYSTEM=1`, so no test could touch real user configuration):

```bash
npm ci --ignore-scripts
# 15 validators, as in `npm test`:
node scripts/ci/check-unicode-safety.js            # ... and validate-agents, validate-commands,
node scripts/ci/validate-hooks.js                  # validate-rules, validate-skills, validate-skill-host-compat,
node scripts/ci/check-hooks-schema-keys.js         # validate-install-manifests, validate-context-profiles,
node scripts/ci/validate-no-personal-paths.js      # validate-carrier-closure, validate-workflow-security
node scripts/ci/catalog.js --text
node scripts/ci/generate-command-registry.js --check
node tests/run-all.js
# Python (project-local venv):
uv venv .venv --python 3.12 && uv pip install --python .venv/Scripts/python.exe -e '.[dev]'
.venv/Scripts/python.exe -m pytest tests/test_*.py -m "not integration" -q
.venv/Scripts/python.exe -m ruff check src tests
```

| Suite | Baseline result | Duration |
|---|---|---|
| Validators (15 + catalog + command registry) | all pass | < 1 min |
| JS suite (`node tests/run-all.js`) | 7547 tests: **7513 passed, 34 failed**; files: 403 passed, 19 failed (of 422) | 7234 s (shared CPU) |
| Python (`pytest -m "not integration"`) | **414 passed, 119 failed, 5 skipped** | 63 s |
| ruff | pass | — |

Pre-existing failures and their causes (all reproduced on the untouched original tree):

- **Windows symlink privilege (EPERM / WinError 1314)** — the bulk of the JS failures (`lib/codex-legacy-sync`, `lib/state-store`, `lib/memory-vault`, `skills/build-agreement`, `scripts/command-runtime`, `hermes-hooks`, `lib/eval-harness/security`, `scripts/memory-mcp`, `skills/frontend-design-direction`, ...) and 5 Python failures: creating symlinks needs Developer Mode or admin rights on Windows.
- **`scripts/codex-hooks.test.js` "pre-commit ... through the real scanner" (4)** — the real secret scanner is not installed on this machine.
- **Timing under load** — `hooks/hookify-runtime` (1), `lib/powershell-destructive-command` (time budget), `hooks/context-prompt-suggestions` (1), and the probe tests in `hooks/mcp-health-check` vary between runs: the original code fails 1–4 of them depending on CPU load, with 100–1000 ms probe timeouts.
- **Environment-dependent** — `ci/no-personal-paths`, `ci/validators` ("passes on real project skills"), and `ci/context-profiles` failed only inside the throwaway-HOME harness; the same validators pass when run directly.
- **Python, `test_docs_governance_audit.py` (107)** — a real product bug, fixed below (F16).
- **Python, `test_selector_workflows.py` (11)** — the test fixture launches Python with an environment that lacks `SYSTEMROOT`/`USERPROFILE`, which Windows Python needs; test portability, not product behavior.
- **Python, 2 deletion-zone cases** — the test creates files literally named `ftp://...` and `urn:...`, which NTFS forbids.

## 3. Findings

Sources: careful reading of the install, sync, and hook paths; reproduction in throwaway homes; the original project's issue tracker; the project's own linters and validators; and a run of the Python suite on Windows.

| # | Finding | Severity | Status | Evidence / test |
|---|---|---|---|---|
| F1 | `merge-mcp-config.js` appended a second `[mcp_servers.chrome-devtools]` when the existing table had no `command` (for example `enabled = false`); Codex rejects the whole file and the sync still reported success | High | Fixed | `codex-hooks.test.js`: "keeps an existing server table without command instead of duplicating it" |
| F2 | `--update-mcp` / `ECC_DISABLED_MCPS` matched headers textually, so quoted (`[mcp_servers."chrome-devtools"]`), spaced, or indented headers were not removed and a duplicate was appended; inline definitions were duplicated too | High | Fixed | "replaces a quoted server header in place", "leaves an inline server definition untouched instead of duplicating it" |
| F3 | Section removal deleted the comments that introduce the next table and swallowed an indented following table | Medium | Fixed | "keeps comments that belong to the next table when repairing a section" |
| F4 | `merge-codex-config.js` re-opened tables defined by dotted keys (`features.x = true` + appended `[features]`) — valid TOML 0.5, invalid TOML 1.0 (Codex) | High | Fixed | "does not re-open a table that dotted keys already define (TOML 1.0)" |
| F5 | `merge-codex-config.js` treated a `[Section]` line inside a `"""` string as the first table, injected the baseline keys into the user's prompt text, and grew it on every run | Medium | Fixed | "ignores header-like lines inside multi-line strings and stays idempotent" |
| F6 | With an inline parent (`agents = { ... }`), `merge-codex-config.js` appended `[agents.reviewer]`, wrote an unparseable file, and printed "Done" | High | Fixed | "never appends sub-tables under an inline parent table" (found while validating F4–F5) |
| F7 | Both Codex merges failed on a UTF-8 BOM (PowerShell 5.1), rolling back the sync | Medium (Windows) | Fixed | two BOM tests in `codex-hooks.test.js` |
| F8 | Managed hook config (`ecc/setup.json`, `ECC_HOOK_CONFIG`) with a BOM was ignored, so `hooks.enabled: false` silently became "enabled" (original issue #3623) | Medium | Fixed | `hooks/hook-flags.test.js`: "managed config saved with a UTF-8 BOM is honored" |
| F9 | `mcp-health-check` read the event only from `CLAUDE_HOOK_EVENT_NAME`, which Claude Code does not set, so the `PostToolUseFailure` route ran PreToolUse logic: no failure recorded, server probed, sometimes exit 2 | High | Fixed | `hooks/mcp-health-check.test.js`: "post-failure reads hook_event_name from the stdin payload when no env var is set" |
| F10 | `mcp-health-check` let the MCP tool's own `server`/`connector` argument choose the server (false blocks and backoff bypass) | Medium | Fixed | "mcp__<server>__ tool names take precedence over the tool's own server arguments" |
| F11 | `governance-capture` labelled every PreToolUse event `post` (same env-var assumption) and emitted post-only findings early | Low | Fixed | `hooks/governance-capture.test.js`: "takes the hook phase from the stdin hook_event_name" |
| F12 | The PowerShell tool bypassed `block-no-verify` (`git commit --no-verify`, `-n`, `core.hooksPath`) | Medium-High (security, Windows) | Fixed | new `hooks/powershell-no-verify-route.test.js` runs the exact configured commands |
| F13 | Strict commit-quality blocked commits whose staged code merely contains the word "debugger" in JSDoc or strings | Medium-Low | Fixed | `hooks/pre-bash-commit-quality.test.js`: 2 new tests (false positives allowed; inline/case statements still blocked) |
| F14 | Commit-quality told agents to "use `git commit --no-verify`", which `block-no-verify` always rejects (contradiction between hooks) | Low | Fixed | message now names `ECC_DISABLED_HOOKS=pre:bash:commit-quality` |
| F15 | `config-protection` could be bypassed with NTFS aliases (`.eslintrc.js::$DATA`, trailing dot or space) | Low (security, Windows) | Fixed | `hooks/config-protection.test.js`: "blocks NTFS stream and trailing-dot aliases" |
| F16 | `skills/docs-governance/scripts/audit-docs.py` crashed with `UnicodeEncodeError` whenever its output was captured on Windows (cp1252 pipes) | Medium (Windows) | Fixed | `tests/test_docs_governance_audit.py`: "audit survives a non-UTF-8 output encoding" (forces `PYTHONIOENCODING=cp1252`, so it also runs on Linux) |
| F17 | `skills/ecc-tools-cost-audit/SKILL.md` linked to `../../ECC-Tools`, a sibling repository that is never shipped | Low | Fixed | relative-link scan over `skills/ rules/ agents/ commands/ hooks/ manifests/` now reports 0 broken links |
| F18 | `auto-tmux-dev` (via the Bash dispatcher) prints the whole modified event to stdout, which Claude Code rejects as hook output (see the project's own #2239 tests); the dev-server rewrite therefore never applies | Medium | Not fixed | Replacing it with `hookSpecificOutput.updatedInput` changes permission semantics (`allow` auto-approves); needs verification against a live Claude Code build |
| F19 | `block-no-verify` does not recognize PowerShell's call operator (`& "C:\...\git.exe" commit --no-verify`) | Low | Not fixed | documented limitation; plain `git ...` forms are blocked |
| F20 | `block-no-verify` blocks harmless pipelines of 16+ short stages ("work budget exceeded") | Low | Not fixed | fail-closed by design; changing the budget needs its own analysis |
| F21 | The Codex baseline adds `notify = ["terminal-notifier", ...]` (macOS-only) on every OS | Low | Not fixed | not verified against Codex on Windows/Linux |
| F22 | `sync-ecc-to-codex.sh` `replace_ecc_section` may normalize a CRLF `AGENTS.md` to LF; its awk marker scan does not skip fenced code | Low | Not verified | from code reading only |
| F23 | `check-codex-global-state.sh` warns when `core.hooksPath` is `C:/...` and the expected path is `/c/...` | Low | Not fixed | cosmetic false warning on Git Bash |
| F24 | Python test fixtures (`test_selector_workflows.py`) and two deletion-zone cases are not portable to Windows | Low (tests) | Not fixed | see baseline |

## 4. Improvements and verification

Every bug fix followed the same loop: write the regression test, run it against the untouched original code (it must fail for the stated reason), apply the smallest fix in the surrounding style, re-run the test file, then re-run the full suite at the end.

1. **String-aware TOML scanning** — new `scripts/lib/toml-text.js` (`scanTomlStructure`, `isTableDefinedByDottedKeys`) understands basic/literal/multi-line strings, nested arrays and inline tables, quoted and dotted keys. `merge-codex-config.js` uses it for header lookup (F5) and to refuse re-opening dotted-key tables (F4); `merge-mcp-config.js` uses it to remove `[mcp_servers.<name>]` and all its sub-tables by key path, through the last key/value line, so quoted/indented headers are found and the next table's comments are kept (F2, F3).
2. **Write-time safety net** — both merges parse the final text before writing; `merge-codex-config.js` also checks that every value present before the merge is unchanged (`findChangedValue`). On failure they exit 1 without touching the file, which makes `sync-ecc-to-codex.sh` roll back. Missing tables whose append would not parse (inline parent) are skipped with a warning (F6).
3. **Existing tables count as present** in `merge-mcp-config.js` (F1); servers that cannot be removed textually (inline, dotted) are reported and left untouched (F2).
4. **BOM handling** — Codex merges strip and restore a leading BOM (F7); `hook-flags.js` strips it before `JSON.parse` (F8).
5. **Hook event names from stdin** — `mcp-health-check.js` and `governance-capture.js` prefer `hook_event_name` from the payload and keep the env var as a fallback (F9, F11), mirroring what `session-activity-tracker.js` already did.
6. **MCP target precedence** — `mcp__<server>__<tool>` names win; explicit `server`/`connector` fields remain the fallback for non-MCP tool names, so both existing explicit-target tests keep passing (F10).
7. **PowerShell route** — `hooks/hooks.json` runs `block-no-verify` (hook ID `pre:powershell:block-no-verify`, profiles minimal/standard/strict) inside the existing single PowerShell route, which keeps the original test that pins one dedicated PowerShell route. `hooks.metadata.json` fingerprints were regenerated with the documented `--update-fingerprints` flow. Benign PowerShell commands (pipelines, here-strings, `$env:` assignments, `-C` paths) were probed and are not blocked (F12).
8. **Commit quality** — `hasDebuggerStatement()` ignores block-comment lines, string literals, and trailing `//` comments, and matches statement positions (line start, after `;{}():`, after `else`) (F13); the bypass advice no longer contradicts `block-no-verify` (F14).
9. **Config protection** — names are also checked after removing an NTFS stream suffix and trailing dots/spaces (F15).
10. **docs-governance audit** — `use_utf8_output()` switches stdout/stderr to UTF-8 only when they cannot encode `✓✗` (F16). The file is mirrored byte-for-byte to `.agents/skills/docs-governance/` and to `pi/core/` (rebuilt with `node scripts/build-pi-core.js`, as CI requires). Skill file contents feed the context registry digest, so `manifests/context-packs/skill-triggers@1.json` got a refreshed `registryDigest` (the manifest is hand-seeded original; no skill description changed, so the triggers stay valid and `validate-context-profiles.js` passes). The generator script was not run because it calls a paid model provider.

Before/after evidence for the targeted tests (all on Windows):

| Test file | Original code | Cavaleiro |
|---|---|---|
| `codex-hooks.test.js` merge tests (22: 13 existing + 9 new) | 13 passed, **9 failed** | 22 passed |
| `codex-config.test.js` | 13 passed | 13 passed (fixture now copies `scripts/lib/toml-text.js`) |
| `hooks/mcp-health-check.test.js` (2 new) | new tests fail (exit 2 / blocked healthy server) | new tests pass; remaining failures are the load-dependent probe tests, which also fail on original code under the same load |
| `hooks/governance-capture.test.js` | 35 passed, **1 failed** | 36 passed |
| `hooks/powershell-no-verify-route.test.js` (new) | 4 passed, **4 failed** | 8 passed |
| `hooks/pre-bash-commit-quality.test.js` | 25 passed, **1 failed** | 26 passed |
| `hooks/config-protection.test.js` | 14 passed, **1 failed**, 1 skipped | 15 passed, 1 skipped |
| `hooks/hook-flags.test.js` | 63 passed, **1 failed** | 64 passed |
| `tests/test_docs_governance_audit.py` | 107 failed (crash) | 102 passed, 7 failed (symlink privilege, NTFS names), 1 skipped |

Final full runs are in [section 8](#8-final-verification).

## 5. Rebrand and fork safety

- Renamed: README titles and banner (`docs/assets/cavaleiro-banner.svg`), repository self-links in `README.md` and the translated READMEs (clone URLs, issues, discussions, CI badge, marketplace sources in docs), `package.json` `repository`/`homepage`/`bugs`, `pyproject.toml` URLs, issue-template links, `CODEOWNERS` (`* @cavaleiro-ai`).
- Kept: npm package `ecc-universal`, all bins (`ecc`, `ecc-install`, ...), plugin and marketplace IDs (`ecc@ecc`), skill/agent/command/hook IDs, `ECC_*` variables, config paths, original issue numbers (as plain text), the runtime welcome/feedback links and the guided setup's marketplace source (documented in the README *Compatibility* section, not silently repointed).
- Identity cleanup (after 1.0.0): the public layer (README files, CONTRIBUTING, SECURITY, `.github/`, package and plugin manifests) names only Cavaleiro AI. The original project's funding, community, and social blocks were removed; plugin manifests' `author`, `homepage`, and `repository` point to Cavaleiro AI, and the tests that pin that metadata (`tests/plugin-manifest.test.js`, the README funding-surface checks of the Itô compute test in `tests/scripts/`, and the notified login in `tests/ci/pr-burst-guard-workflow.test.js`) now pin the Cavaleiro identity. The inherited manuals under `docs/` use the Cavaleiro Agent Harness name, except release notes, business and funding documents, and the authored guides.
- Disabled workflows (moved to `.github/workflows-disabled/` with a README): `release.yml`, `reusable-release.yml`, `generator-generic-ossf-slsa3-publish.yml`, `release-announce.yml`, `discussion-announce.yml`, `pr-burst-guard.yml`, `monthly-metrics.yml`, `maintenance.yml`. The four release/announcement test files that load them now read them from that folder with unchanged assertions. Kept: `ci.yml`, `reusable-test.yml`, `reusable-validate.yml`, `supply-chain-watch.yml`, `taste-skills.yml` (read-only `GITHUB_TOKEN`). `FUNDING.yml` removed; `pr-burst-policy.json` notifies `@cavaleiro-ai`.
- License: the MIT text and the original copyright notice are kept verbatim, with `Copyright (c) 2026 Cavaleiro AI (modifications in Cavaleiro Agent Harness)` added.

## 6. What was not done, and why

- **No full README rewrite.** About 40 test files read the README and assert its wording and structure (install order, language switcher, catalog counts), so the README was edited surgically.
- **Identifiers keep the `ecc` name.** The CLI, package, plugin, and hook-ID namespace still say `ecc`, and a few README and manual strings that tests pin keep the original wording. Release notes and historical docs under `docs/releases/` are left as written.
- **F18–F23** — see the findings table; each needs either a live harness to verify or a design decision that belongs to the original project.
- **No dependency upgrades or refactors.** `@iarna/toml` (TOML 0.5) stays; the TOML 1.0 cases are handled by the scanner instead of adding a new direct dependency.
- **The original translations were not re-translated**; they received a note, a title, repointed self-links, and the product rename.

## 7. Known limitations

- The Codex merges still edit TOML as text. The scanner assumes the input already parsed with `@iarna/toml`; TOML 1.0-only constructs that `@iarna/toml` rejects still make the merge refuse to run (fail-safe, not silent).
- `npx ecc-universal` and the guided Claude setup install or register **the original project**; using the Cavaleiro fixes requires a checkout (`node scripts/ecc.js ...`) or adding this repository as the marketplace.
- Hook behavior was verified with the exact configured commands and payload shapes, not inside a live Claude Code or Codex session.
- The JS suite is slow on Windows (two hours under load) and several tests are timing-sensitive.

## 8. Final verification

The same commands as the baseline, run on the finished derivative after the last change:

| Suite | Baseline (original) | Final (Cavaleiro) |
|---|---|---|
| Validators (15 + catalog + command registry) | all pass | all pass |
| JS suite, tests | 7547: 7513 passed, 34 failed | 7570: **7532 passed**, 38 failed |
| JS suite, files | 403 passed, 19 failed (of 422) | **407 passed**, 16 failed (of 423) |
| JS suite, duration | 7234 s | 2188 s (lighter machine load) |
| Python pytest | 414 passed, 119 failed, 5 skipped | **515 passed**, 19 failed, 5 skipped |
| ruff | pass | pass |
| ESLint on changed JS files | — | 0 errors (only pre-existing `complexity` warnings) |
| markdownlint on changed Markdown | — | 0 errors |
| `git diff --check` on changed lines | — | clean |
| Relative links and anchors in written docs | — | all resolve (2 pre-existing broken image links in `docs/ja-JP/README.md` are the original project's) |

How the failures compare:

- Every test that failed in a file failing in both runs failed identically (same test names), so no existing test regressed.
- Fixed in the final run: `hooks/context-prompt-suggestions`, `hooks/hookify-runtime`, `lib/powershell-destructive-command` (timing; they pass under lighter load), and `ci/no-personal-paths`, `ci/validators` (environment).
- New in the final run, and caused only by the derivative having no commit yet (the release process forbids committing here): `docker/gateguard-effectiveness.test.js` ("git rev-parse failed: Needed a single revision") and two `hooks/hooks.test.js` session-metadata tests that read the current branch. In a scratch copy of the same tree with one commit, all three affected files pass: `hooks/hooks.test.js` 258/258, `docker/gateguard-effectiveness.test.js` 39/39, `scripts/install-apply.test.js` 48/48.
- Python: the 100 recovered tests are F16; the remaining 19 are the Windows test-environment cases listed in the baseline.

## 9. Recommended next steps

1. Offer F1–F17 to the original project as focused pull requests (the tests are self-contained).
2. Decide F18 with a live Claude Code build: either emit `hookSpecificOutput.updatedInput` with `permissionDecision: "ask"` or drop the dev-server rewrite.
3. Make the timing-sensitive hook tests deterministic (inject the clock and probe results instead of real 100–1000 ms timeouts).
4. Teach `block-no-verify` the PowerShell call operator (`&`) and `Start-Process git`.
5. Make the Python test fixtures Windows-portable (pass `SYSTEMROOT`/`USERPROFILE`, avoid `:` in file names) and mark symlink tests as skipped without the privilege.
6. Validate Codex output with a TOML 1.0 parser in CI (for example as a dev-only check) to catch future 0.5/1.0 drift.
