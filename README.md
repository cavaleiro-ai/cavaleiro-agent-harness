**English** · [Português (Brasil)](README.pt-BR.md)

<p align="center">
  <img src="docs/assets/cavaleiro-banner.svg" alt="Cavaleiro Agent Harness — skills, memory and security for coding agents" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/cavaleiro-ai/cavaleiro-agent-harness/actions/workflows/ci.yml"><img src="https://github.com/cavaleiro-ai/cavaleiro-agent-harness/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license" /></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/release-1.0.0-informational.svg" alt="Cavaleiro Agent Harness 1.0.0" /></a>
</p>

<p align="center">
  <strong>Language:</strong>
  <a href="README.md">English</a> |
  <a href="README.pt-BR.md">Português (Brasil)</a> |
  <a href="docs/ar/README.md">العربية</a> |
  <a href="README.zh-CN.md">简体中文</a> |
  <a href="docs/zh-TW/README.md">繁體中文</a> |
  <a href="docs/ja-JP/README.md">日本語</a> |
  <a href="docs/ko-KR/README.md">한국어</a> |
  <a href="docs/tr/README.md">Türkçe</a> |
  <a href="docs/ru/README.md">Русский</a> |
  <a href="docs/vi-VN/README.md">Tiếng Việt</a> |
  <a href="docs/th/README.md">ไทย</a> |
  <a href="docs/de-DE/README.md">Deutsch</a> |
  <a href="docs/es/README.md">Español</a> |
  <a href="docs/uk-UA/README.md">Українська</a> |
  <a href="docs/pl/README.md">Polski</a> |
  <a href="docs/bn/README.md">বাংলা</a>
</p>

<p align="center"><sub>English and Português (Brasil) describe Cavaleiro Agent Harness. The other languages are older translations and may lag behind.</sub></p>

> [!NOTE]
> **Cavaleiro Agent Harness** is maintained by [Cavaleiro AI](https://github.com/cavaleiro-ai). It ships skills, agents, hooks, rules, and installers for coding agents, with verified fixes for config merging and hook safety ([what it adds](#what-cavaleiro-agent-harness-adds)). Package, command, plugin, and skill identifiers keep their `ecc` names, so commands on this page still say `ecc`; see [Compatibility](#compatibility).

## Install with Claude Code

Use the [guided setup](#install-ecc) or [native plugin commands](#claude-code-details). Both install the same `ecc@ecc` plugin. Choose one and do not stack a full manual Claude install on top.

<p align="center"><a href="#install-ecc">Jump to install ↓</a></p>

# Cavaleiro Agent Harness

Your agent can write code, but Cavaleiro Agent Harness gives it a coordinated engineering system and toolbox: it plans before it builds, verifies changes with tests, reviews its own work from a fresh context, remembers what matters, and turns repeated wins into reusable skills and workflows.

```text
plan -> test -> implement -> review -> verify -> remember -> improve
```

Instead of rebuilding that process in every prompt, you install it once and make it part of how your agent works.

> Optimize the context window. Persist everything else.

Cavaleiro Agent Harness is MIT-licensed open source. It works best with Claude Code today, has native Codex and Qoder plugin paths, and provides capability-limited adapters for Cursor, OpenCode, Gemini, Zed, GitHub Copilot, Antigravity, Qwen, and other harnesses. See the [support status matrix](#platform-support) before assuming feature parity.

Access to 71 agents, 311 skills, and 97 legacy command shims, plus hooks, rules, memory, continuous learning, and AgentShield security scanning. The agents are specialized for planning, review, build repair, security, architecture, and domain work.

| Included         |       Count | What it gives you                                                                    |
| ---------------- | ----------: | ------------------------------------------------------------------------------------ |
| Agents           |   71 agents | Planning, review, build repair, security, architecture, and domain work              |
| Skills           |  311 skills | TDD, research, security, docs, frontend, data, ML, operations, and more              |
| Commands         | 97 commands | Convenient entry points while Cavaleiro Agent Harness moves to a skills-first surface                    |
| Hooks and memory |     Runtime | Enforcement, session summaries, continuous learning, instincts, and context controls |
| Rules            |   Selective | Always-loaded standards you choose by language or project                            |
| AgentShield      |    Included | Scanning for prompts, hooks, MCP config, permissions, secrets, and agent files       |

## What Cavaleiro Agent Harness adds

Everything from the 2.2.3 engine of the original project, plus fixes that were each proven with a regression test that fails on the original code ([full list in the changelog](CHANGELOG.md#cavaleiro-agent-harness-100--2026-10-17)):

- **Codex config merges never write a file Codex cannot load.** `merge-codex-config.js` and `merge-mcp-config.js` now scan TOML with string awareness, respect TOML 1.0 dotted-key and inline-table rules, keep comments that belong to the next table, accept the UTF-8 BOM that Windows PowerShell 5.1 writes, and re-parse the result (and check every existing value survived) before writing.
- **No more duplicate `[mcp_servers.*]` tables.** An existing server table without `command` (for example `enabled = false`) is treated as present, and inline or quoted server definitions are left alone instead of duplicated.
- **MCP health checks work in real Claude Code sessions.** The hook reads `hook_event_name` from the stdin payload, so the `PostToolUseFailure` circuit breaker actually records failures, and an MCP tool's own `server` argument can no longer redirect or bypass the check.
- **The PowerShell tool can no longer skip git hooks.** `git commit --no-verify`, `-n`, and `core.hooksPath` overrides are blocked for PowerShell exactly as for Bash.
- **Fewer false blocks, fewer bypasses.** The strict commit-quality check flags real `debugger` statements, not the word in comments or strings; config protection also covers NTFS aliases such as `.eslintrc.js::$DATA` and `.eslintrc.js.`; governance capture labels PreToolUse events correctly; a managed `ecc/setup.json` saved with a UTF-8 BOM is honored again (original issue #3623); the `docs-governance` audit no longer crashes on Windows when its output is captured.
- **Fork-safe repository.** Publishing, signing, and announcement workflows are parked in [`.github/workflows-disabled/`](.github/workflows-disabled/README.md); CI, lint, and security scans still run.
- **Portuguese documentation:** [README.pt-BR.md](README.pt-BR.md) and a complete [guia em português](docs/cavaleiro/GUIA-PT-BR.md), plus an [engineering report](docs/cavaleiro/ENGINEERING.md) with the baseline, findings, and evidence.

## Compatibility

Cavaleiro Agent Harness renames the **project**, not the **identifiers** your tools and configs depend on:

| Identifier | Value (unchanged) |
|---|---|
| npm package name | `ecc-universal` |
| CLI commands | `ecc`, `ecc-install`, `ecc-universal`, `ecc-control-pane`, `ecc-memory-mcp`, `ecc-plan-canvas` |
| Claude Code / Codex / Qoder plugin and marketplace ID | `ecc@ecc` (marketplace `ecc`) |
| Skill, agent, command, and hook IDs | unchanged (for example `/ecc:configure-ecc`, `pre:bash:block-no-verify`) |
| Environment variables | `ECC_*`, `CLAUDE_*`, `CODEX_HOME`, ... |
| Config files and folders | `~/.claude/`, `~/.codex/config.toml`, `.cursor/`, `.kimi-code/`, `hooks/hooks.json`, ... |

Two consequences to keep in mind:

- **`npx ecc-universal@2.2.3 ...` installs the original project, not this repository.** Cavaleiro Agent Harness does not publish to npm. To get the Cavaleiro fixes, clone this repository and run the same commands from the checkout: `node scripts/ecc.js setup`, `node scripts/ecc.js install ...`, `./install.sh ...` or `.\install.ps1 ...`. Wherever this page shows `npx ecc-universal@2.2.3 <command>`, `node scripts/ecc.js <command>` is the checkout equivalent.
- **Some runtime surfaces still point at the original project's infrastructure.** The guided Claude plugin setup registers the `ecc` marketplace from the original project's GitHub source, and `ecc feedback`, the welcome banner, and AgentShield links refer to the original project. The harness does not upload diagnostics or telemetry automatically. To load this repository's plugin instead, register this repository's URL as the Claude Code plugin marketplace and install `ecc@ecc` (the exact commands are in [Claude Code details](#claude-code-details)).

A few install headings and notes below keep the short name **ECC**, which matches the `ecc` identifiers above.

## Install ECC

> [!IMPORTANT]
> ECC 2.2 includes guided package setup for Claude Code, Codex, and Kimi Code.
> The universal package requires Node.js 18 or newer. Claude plugin setup also
> requires Git and Claude Code 2.1 or newer on `PATH`.

### Recommended: universal guided setup

For Claude Code plugin setup, updates, scope changes, and hook-profile changes:

```bash
npx ecc-universal@2.2.3 setup
```

#### Windows first-time walkthrough

If you are new to command-line tools, use this copy-and-paste path:

1. Install Node.js 18 or newer, Git, and Claude Code.
2. Open **PowerShell** from the Windows Start menu.
3. Confirm that each prerequisite is available:

   ```powershell
   node --version
   git --version
   claude --version
   ```

4. Run the guided installer:

   ```powershell
   npx ecc-universal@2.2.3 setup
   ```

5. For a typical personal setup, choose **Global user**, choose **Standard** hooks, and confirm.
6. Start a new Claude Code session and run `/plugin list` to verify that `ecc@ecc` is enabled.

This path does not require cloning the repository. If any prerequisite command is not found, install or repair that prerequisite before rerunning Cavaleiro Agent Harness setup.

If npm reports a version or cache error, confirm the registry version before retrying:

```bash
npm view ecc-universal version
```

Cavaleiro Agent Harness 2.2 supports the same guided setup through modern package runners:

| Package runner | Guided setup command |
|---|---|
| npm / npx | `npx ecc-universal@2.2.3 setup` |
| pnpm | `pnpm dlx ecc-universal@2.2.3 setup` |
| Yarn 2+ | `yarn dlx ecc-universal@2.2.3 setup` |
| Bun | `bunx ecc-universal@2.2.3 setup` |

The examples select [the published `ecc-universal` 2.2.3 release](https://www.npmjs.com/package/ecc-universal/v/2.2.3), matching this repository's release version. A version pin is not a security audit or an integrity check. Review the release source and registry integrity before running package code; use a reviewed checkout for unreleased changes.

Yarn Classic 1 does not provide `yarn dlx`; use `npx`, install the package globally, or upgrade Yarn for a temporary one-shot run.

The wizard inventories the official marketplace and every native Claude install scope before making changes, then installs, updates, or safely moves `ecc@ecc` to the scope you choose. Rerun the same command whenever you want to update Cavaleiro Agent Harness, change scope, or change its hook profile. This setup wizard currently configures the Claude Code plugin; use the multi-harness wizard below for Codex or Kimi Code.

To configure more than one coding agent in one reviewed flow, use the multi-harness wizard:

```bash
npx ecc-universal@2.2.3 install --guided
```

It lets you select any combination of Claude Code, Codex, and Kimi Code, shows each install channel and destination, preflights every selection before the first write, and asks for one final confirmation.

| Harness | Guided install behavior |
|---|---|
| Claude Code | Native `ecc@ecc` plugin with one `user`, `project`, or `local` scope and a Cavaleiro Agent Harness hook profile |
| Codex | Native Codex marketplace/plugin lifecycle; hook review and trust remain Codex-owned |
| Kimi Code | Managed project files under `./.kimi-code`; Cavaleiro Agent Harness hooks, model/provider settings, and authentication are not configured |

For automation, make every provider-specific choice explicit:

```bash
npx ecc-universal@2.2.3 install --guided \
  --harness claude --harness codex --harness kimi \
  --claude-scope local --claude-hooks standard \
  --profile core --yes
```

Verify the native guided Codex path and managed Kimi path without writing first:

```bash
npx ecc-universal@2.2.3 install --guided --harness codex --dry-run
npx ecc-universal@2.2.3 install --profile core --target kimi --dry-run
```

Additional package-name commands are also available through the 2.2 alias:

```bash
npx ecc-universal@2.2.3 consult "security reviews" --target claude
npx ecc-universal@2.2.3 install --profile minimal --target claude --with capability:machine-learning
npx ecc-universal@2.2.3 doctor --target kimi
```

Do not use `npx ecc-install --profile minimal --target claude`: `ecc-install` is a binary name inside `ecc-universal`, not a separately published npm package.

Cavaleiro Agent Harness also ships advanced managed adapters for `cursor`, `antigravity`, `gemini`, `opencode`, `codebuddy`, `joycode`, `qwen`, `zed`, `hermes`, and `openclaw`. Those targets still use their documented `ecc install --target ...` paths until each adapter has passed the guided collision, update, repair, and uninstall lifecycle matrix. Neither wizard silently installs into every detected harness.

### Pick one path only (per harness)

You can use Cavaleiro Agent Harness with Claude Code, Codex, and other harnesses at the same time. Choose one install method for each harness:

- **Recommended default:** run the guided Claude plugin setup above
- **Also supported for Claude Code:** use the [native plugin commands](#claude-code-details)
- **Available in release 2.2:** guided package setup for Claude Code, Codex, and Kimi Code
- **Works:** Claude Code plugin + Codex native plugin
- **Works:** Claude Code plugin + the legacy Codex sync flow
- **Avoid:** Claude Code plugin + full Claude manual install
- **Avoid:** Codex sync + Codex marketplace plugin

**Do not stack install methods.** Installing Cavaleiro Agent Harness twice into the same harness can duplicate skills, commands, hooks, or configuration; installing it once into multiple harnesses does not.

If you already layered multiple installs and things look duplicated, skip straight to [Reset / Uninstall Cavaleiro Agent Harness](#reset--uninstall-ecc).

**Install trouble?** Open the short [install or runtime problem form](https://github.com/cavaleiro-ai/cavaleiro-agent-harness/issues/new?template=install-problem.yml), or run `ecc feedback`. Cavaleiro Agent Harness never uploads diagnostics automatically.

### Claude Code details

Alternatively, run Claude Code's native plugin commands inside Claude Code:

```text
/plugin marketplace add https://github.com/cavaleiro-ai/cavaleiro-agent-harness
/plugin install ecc@ecc
```

The native path installs Cavaleiro Agent Harness's skills, agents, commands, and plugin-managed hooks. If you choose it, stop there. Do not also run a full manual install into Claude Code.

Claude Code owns these built-in commands, including their errors when a marketplace, plugin, or conflicting scope already exists. Cavaleiro Agent Harness cannot intercept that parser. If either native command reports an existing install or scope conflict, use the 2.2 guided setup or resolve the conflicting Claude plugin scope before retrying; do not layer a manual install on top.

After Cavaleiro Agent Harness is installed, `/ecc:configure-ecc` is the namespaced in-Claude reconfiguration skill. It delegates to the same safe setup flow, but it is available only after the plugin is installed and cannot replace Claude Code's built-in `/plugin` command during a first install.

Claude Code plugins cannot distribute `rules`, so add only the rule packs you actually want:

```bash
git clone https://github.com/cavaleiro-ai/cavaleiro-agent-harness.git
cd cavaleiro-agent-harness
mkdir -p ~/.claude/rules/ecc
cp -R rules/common ~/.claude/rules/ecc/
cp -R rules/typescript ~/.claude/rules/ecc/  # replace with your stack
```

Start with `rules/common` plus one language or framework pack you actually use. If you install the plugin, do not run `./install.sh --profile full` afterward.

<details>
<summary><strong>Prefer settings.json? Add the marketplace declaratively</strong></summary>

Add directly to your `~/.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "ecc": {
      "source": {
        "source": "github",
        "repo": "cavaleiro-ai/cavaleiro-agent-harness"
      }
    }
  },
  "enabledPlugins": {
    "ecc@ecc": true
  }
}
```

This gives you the same result as the two `/plugin` commands above.
</details>

<details>
<summary><strong>Naming + migration note (ecc@ecc, ecc-universal)</strong></summary>

Cavaleiro Agent Harness has three public identifiers, and they are not interchangeable:

- GitHub source repo: `cavaleiro-ai/cavaleiro-agent-harness`
- Claude marketplace/plugin identifier: `ecc@ecc`
- npm package: `ecc-universal`

This is intentional. Anthropic marketplace/plugin installs are keyed by a canonical plugin identifier, so Cavaleiro Agent Harness uses `ecc@ecc` to keep tool names and slash-command namespaces short enough for strict Desktop/API validators. Older posts may still show the former long marketplace identifier; treat that as a legacy alias only. Separately, the npm package stayed on `ecc-universal`, so npm installs and marketplace installs intentionally use different names.

npm releases are cut per version tag, not per commit, so `ecc-universal` tracks releases (2.1, 2.2, ...) rather than every push to `main`. Install from git if you want the bleeding edge.

If your local Claude setup was wiped or reset, that does not mean you need to repurchase anything. Start with `node scripts/ecc.js list-installed`, then run `node scripts/ecc.js doctor` and `node scripts/ecc.js repair` before reinstalling. That usually restores harness-managed files without rebuilding your setup.
</details>

### Codex App and CLI

Current Codex releases can install Cavaleiro Agent Harness as a native repo-marketplace plugin. The marketplace entry uses the repository root so Codex's cache receives the manifest together with all referenced skills, MCP configuration, hook runtime, scripts, and assets:

```bash
codex plugin marketplace add cavaleiro-ai/cavaleiro-agent-harness
codex plugin add ecc@ecc
codex plugin list --json
node scripts/codex/check-plugin-cache.js
```

Both add commands are idempotent. To refresh later, run `codex plugin marketplace upgrade ecc` followed by `codex plugin add ecc@ecc`. Codex stores one enabled plugin state in the active `CODEX_HOME`; it does not offer Claude's `user`, `project`, and `local` scopes. Its native hooks require an explicit trust decision and do not use Claude's four Cavaleiro Agent Harness hook profiles. Inside Codex, invoke `$configure-ecc` for the guided provider-aware flow.

The older `scripts/sync-ecc-to-codex.sh` path is a deprecated compatibility option for users who intentionally need copied and merged configuration in `~/.codex`; it is not required for the native plugin. New sync runs write an ownership manifest so cleanup can preserve modified user files. Run Codex once first so `~/.codex/config.toml` exists, then:

```bash
git clone https://github.com/cavaleiro-ai/cavaleiro-agent-harness.git
cd cavaleiro-agent-harness
npm install
bash scripts/sync-ecc-to-codex.sh
```

To inspect or remove that legacy layer without touching Codex conversations or native plugin caches:

```bash
node scripts/ecc.js uninstall --legacy-codex-sync --dry-run
node scripts/ecc.js uninstall --legacy-codex-sync
```

Pre-manifest installations are handled conservatively: Cavaleiro Agent Harness removes its marked `AGENTS.md` block but preserves copied files it cannot prove it owns and reports them for review.

You can also open the Cavaleiro Agent Harness repository directly in Codex for a project-local setup. Codex reads the root `AGENTS.md` and the trusted project configuration in `.codex/` without a global sync. Do not add the native marketplace plugin on top of the sync flow.

For repo navigation, surface ownership, and PR diff packet guidance, read the [Codex Cavaleiro Agent Harness Navigation Map](docs/CODEX-NAVIGATION-GUIDE.md). See the [.codex plugin notes](.codex-plugin/README.md) for native lifecycle details.

### Qoder CLI and IDE

Cavaleiro Agent Harness ships a native Qoder plugin that reuses the canonical skills, agents,
95 legacy command shims, and the pinned `chrome-devtools` MCP definition. From a
reviewed checkout, validate and install it with Qoder CLI:

```bash
qoder plugins validate . --strict
qoder plugins install .
qoder plugins list
```

For Qoder IDE, upload a ZIP of the repository root. The ZIP root must contain
`.qoder-plugin/` together with `skills/`, `agents/`, `commands/`, `hooks/`,
`scripts/`, and `.mcp.json`; uploading only the manifest directory or one
`SKILL.md` omits required resources.

The universal Node.js 18+ requirement applies to Qoder's non-interactive hook
environment. The MCP server also requires `npx` and network access on first use.
Qoder receives one reviewed, cross-platform `SessionStart` bootstrap using
`QODER_PLUGIN_ROOT` and exec-form arguments. Cavaleiro Agent Harness does not copy the full Claude
hook profile into Qoder: blocking tool hooks, async stop jobs, and
Claude-specific matchers remain outside this initial native integration. See
the [.qoder-plugin notes](.qoder-plugin/README.md) for the exact boundary.

### Other agents and editors

<details>
<summary><strong>Cursor, OpenCode, Gemini, Zed, Antigravity, Qwen, Hermes, OpenClaw, Kimi, CodeBuddy, JoyCode, Copilot</strong></summary>

Clone Cavaleiro Agent Harness once, then choose the target that matches your harness:

```bash
git clone https://github.com/cavaleiro-ai/cavaleiro-agent-harness.git
cd cavaleiro-agent-harness
```

| Harness | Install or setup | Notes |
|---|---|---|
| Cursor | `./install.sh --profile minimal --target cursor` | Project-local `.cursor/` adapter |
| OpenCode | `npm install && npm run build:opencode && ./install.sh --profile full --target opencode --enable-hooks` | Builds the plugin payload before the full install |
| Gemini CLI | `./install.sh --profile minimal --target gemini` | Project-local `.gemini/` config |
| Zed | `./install.sh --profile minimal --target zed` | Project-local `.zed/` adapter |
| Antigravity | `./install.sh --profile minimal --target antigravity` | See the [Antigravity guide](docs/ANTIGRAVITY-GUIDE.md) |
| Qwen CLI | `./install.sh --profile minimal --target qwen` | See the [Qwen guide](docs/QWEN-GUIDE.md) |
| Hermes | `./install.sh --profile minimal --target hermes` | See the [Hermes setup guide](docs/HERMES-SETUP.md) |
| OpenClaw | `./install.sh --profile minimal --target openclaw` | Managed home-directory install |
| Kimi Code CLI | `./install.sh --profile minimal --target kimi` | Project-local `.kimi-code/` install · [Get Kimi Code](https://www.kimi.ai/code?aff=ecc) |
| CodeBuddy | `./install.sh --profile minimal --target codebuddy` | Project-local `.codebuddy/` install |
| JoyCode | `./install.sh --profile minimal --target joycode` | Project-local `.joycode/` install |
| GitHub Copilot | `./install.sh --profile full --target copilot` | Installs skills to `.github/skills/` and agents to `.github/agents/` for Copilot CLI |

GitHub Copilot support is already included in this repository. `.github/copilot-instructions.md` provides the instruction layer, `.github/prompts/` contains the reusable `/plan`, `/tdd`, `/security-review`, `/build-fix`, and `/refactor` prompts, and `.vscode/settings.json` enables `chat.promptFiles`. GitHub Copilot CLI additionally discovers the `.agents/skills/` subset from a plain clone with no setup; see [Platform Support](#platform-support) for the full catalog and agents.

For a harness without a native Cavaleiro Agent Harness target, use the [manual adaptation guide](docs/MANUAL-ADAPTATION-GUIDE.md). It explains how to carry a small set of Cavaleiro Agent Harness skills and workflow instructions into chat-style tools without pretending hooks or native skill discovery are available.

Cursor installs agent definitions under `.cursor/agents/ecc-*.md`. Cursor-native loading behavior can vary by Cursor build. Cavaleiro Agent Harness does not install root `AGENTS.md` into `.cursor/`. The adapter keeps Cursor's context scoped to its native rules and agent surfaces.

Deep per-harness notes (feature parity, hook adapters, limitations) live in [Platform Support](#platform-support) below.
</details>

## Advanced Install Options

<details>
<summary><strong>Low-context install with no hook runtime</strong></summary>

### Low-context / no-hooks path

Use this when you want Cavaleiro Agent Harness's rules, agents, commands, platform config, and core workflows without runtime hooks:

```bash
npx ecc-universal@2.2.3 install --profile minimal --target claude
```

From a source checkout, the equivalent command is:

```bash
./install.sh --profile minimal --target claude
```

Windows:

```powershell
.\install.ps1 --profile minimal --target claude
```

This profile intentionally excludes `hooks-runtime`.

Claude manual installs place each skill directly under `~/.claude/skills/<skill-name>/` (or `.claude/skills/<skill-name>/` for `claude-project`) so Claude Code can discover it. When upgrading an older Cavaleiro Agent Harness manual install, the installer migrates only nested `skills/ecc/` files recorded in Cavaleiro Agent Harness install-state. If a flat skill directory is user-owned, Cavaleiro Agent Harness preserves it, prints a conflict warning, and keeps any older managed copy tracked for a safe uninstall instead of overwriting user files.

For the normal core profile with hooks disabled:

```bash
./install.sh --profile core --without baseline:hooks --target claude
./install.sh --profile core --no-hooks --target claude
```

Add the hook runtime later only if you want it:

```bash
./install.sh --target claude --modules hooks-runtime --enable-hooks
```

Any install whose profile or modules would materialize the hook runtime requires
an explicit decision. Without `--enable-hooks` or `--no-hooks`, the installer
prints what the hooks can do and stops before writing anything. The guided
installer (`ecc install --guided`) asks for this choice interactively.
</details>

<details>
<summary><strong>Choose only the components you need</strong></summary>

### Find the right components first

Ask the packaged advisor which components match your work:

```bash
node scripts/ecc.js consult "security reviews" --target claude
```

It returns matching components, related profiles, and preview/install commands. Use the preview command before installing if you want to inspect the exact file plan.

You can also install explicit skills or capabilities:

```bash
./install.sh --target claude --skills tdd-workflow,security-review
node scripts/ecc.js install --profile minimal --target claude --with capability:machine-learning
```

Manual component-by-component copying also works. Each component is fully independent:

```bash
# Just agents
mkdir -p ~/.claude/agents
cp agents/*.md ~/.claude/agents/

# Rules directories (common + language-specific)
mkdir -p ~/.claude/rules/ecc
cp -r rules/common ~/.claude/rules/ecc/
cp -r rules/typescript ~/.claude/rules/ecc/   # pick your stack

# Core/general skills only (Claude Code loads skills from direct children
# of ~/.claude/skills; do not nest manual installs under ~/.claude/skills/ecc/)
mkdir -p ~/.claude/skills
cp -r .agents/skills/* ~/.claude/skills/
cp -r skills/search-first ~/.claude/skills/

# Optional: maintained slash-command compatibility during migration
mkdir -p ~/.claude/commands
cp commands/*.md ~/.claude/commands/
```

Retired shims live in `legacy-command-shims/`. Copy individual files from there only if you still need old names such as `/tdd`.
</details>

<details>
<summary><strong>Project-local rules instead of global rules</strong></summary>

Use project-local rules when Cavaleiro Agent Harness's standards should apply to one repository rather than every Claude Code session:

```bash
cd your-project
mkdir -p .claude/rules/ecc
cp -R /path/to/ECC/rules/common .claude/rules/ecc/
cp -R /path/to/ECC/rules/typescript .claude/rules/ecc/
```

Rules are always-loaded context, so begin with `common` and one pack for the stack you actually use. When copying rules manually, copy the whole language directory (for example `rules/common` or `rules/golang`), not the files inside it, so relative references keep working and filenames do not collide.
</details>

<details>
<summary><strong>Fully manual Claude install</strong></summary>

Use this only when you are intentionally skipping the plugin path:

```bash
git clone https://github.com/cavaleiro-ai/cavaleiro-agent-harness.git
cd cavaleiro-agent-harness
./install.sh --profile full --enable-hooks
```

Windows:

```powershell
git clone https://github.com/cavaleiro-ai/cavaleiro-agent-harness.git
cd cavaleiro-agent-harness
.\install.ps1 --profile full --enable-hooks
```

These examples enable the automatic hook runtime. To install without hooks, replace `--enable-hooks` with `--no-hooks`.

If you choose this path, stop there. Do not also run `/plugin install`.

For hand-picked manual installs, Claude discovers skills as direct children of `~/.claude/skills/`; do not nest them under `~/.claude/skills/ecc/`.

#### Install hooks

Do not copy the raw repo `hooks/hooks.json` into `~/.claude/settings.json` or `~/.claude/hooks/hooks.json`. That file is plugin/repo-oriented; use the installer so hook command paths are rewritten correctly:

```bash
bash ./install.sh --target claude --modules hooks-runtime --enable-hooks
```

That installs the hook scripts under `~/.claude/` and registers the resolved
hook entries in `~/.claude/settings.json`. Existing user settings and hooks are
preserved; harness-owned entries are tracked by stable ID for idempotent updates
and safe uninstall.

If you installed Cavaleiro Agent Harness via `/plugin install`, do not copy those hooks into `settings.json`. Claude Code v2.1+ already auto-loads plugin `hooks/hooks.json`, and duplicating them in `settings.json` causes duplicate execution and cross-platform hook conflicts.

On Windows, Claude's config root is `%USERPROFILE%\.claude`; install the hook runtime with:

```powershell
pwsh -File .\install.ps1 --target claude --modules hooks-runtime --enable-hooks
```

#### Configure MCPs

Claude plugin installs intentionally do not auto-enable Cavaleiro Agent Harness's bundled MCP server definitions. This avoids overlong plugin MCP tool names on strict third-party gateways while keeping manual MCP setup available.

Use Claude Code's `/mcp` command or CLI-managed MCP setup for live Claude Code server changes; Claude Code persists those choices in `~/.claude.json`. For repo-local MCP access, copy desired MCP server definitions from `mcp-configs/mcp-servers.json` into a project-scoped `.mcp.json`.

Cavaleiro Agent Harness ships exactly one default connector (`chrome-devtools`); everything else is a skill wrapping a CLI/REST API or an opt-in catalog entry. The rule and the June 2026 audit that retired the previous six defaults live in [docs/MCP-CONNECTOR-POLICY.md](docs/MCP-CONNECTOR-POLICY.md).

If you already run your own copies of the bundled MCPs, set:

```bash
export ECC_DISABLED_MCPS="chrome-devtools"
```

Harness-managed install and Codex sync flows will skip or remove those bundled servers instead of re-adding duplicates. `ECC_DISABLED_MCPS` is an ECC install/sync filter, not a live Claude Code toggle.

**Important:** Replace `YOUR_*_HERE` placeholders with your actual API keys.
</details>

<details>
<summary><strong>Multi-model commands require additional setup</strong></summary>

`multi-*` commands are **not** covered by the base plugin/rules install.

To use `/multi-plan`, `/multi-execute`, `/multi-backend`, `/multi-frontend`, and `/multi-workflow`, you must also install the `ccg-workflow` runtime. Choose and review an exact release using the [upstream CCG installation guide](https://github.com/fengshao1227/ccg-workflow#readme), then initialize that installed runtime. Cavaleiro Agent Harness does not bundle CCG or attest to a compatible, audited CCG release; this guide does not bootstrap an unspecified registry version.

That runtime provides the external dependencies these commands expect, including:

- `~/.claude/bin/codeagent-wrapper`
- `~/.claude/.ccg/prompts/*`

Without `ccg-workflow`, these `multi-*` commands will not run correctly.
</details>

<details>
<summary><strong>Astra review requires the Codex CLI</strong></summary>

`/astra-review` sends Claude-written code to GPT-6-Astra for an independent cross-provider review. It runs the locally installed [Codex CLI](https://github.com/openai/codex) with your ChatGPT login (`codex login`); no OpenAI API key is needed, and API keys in your environment are not forwarded. Invoking the command is your consent to send that diff to OpenAI. Setup, scopes, push gating, and troubleshooting are in the [Astra Review Guide](docs/ASTRA-REVIEW-GUIDE.md).
</details>

<details>
<summary><strong>Reset, repair, or uninstall</strong></summary>

### Reset / Uninstall ECC

If you installed from the universal package, run these commands from the same
project directory used for installation:

```bash
npx ecc-universal@2.2.3 list-installed
npx ecc-universal@2.2.3 doctor
npx ecc-universal@2.2.3 repair
npx ecc-universal@2.2.3 uninstall --dry-run
npx ecc-universal@2.2.3 uninstall
```

From a source checkout, inspect the managed state before reinstalling:

```bash
node scripts/ecc.js list-installed
node scripts/ecc.js doctor
node scripts/ecc.js repair
node scripts/ecc.js uninstall --dry-run
```

For a direct source-checkout uninstall:

```bash
node scripts/uninstall.js --dry-run
node scripts/uninstall.js
```

If you are leaving, the uninstall command prints an optional [20-second feedback form](https://github.com/cavaleiro-ai/cavaleiro-agent-harness/issues/new?template=quick-feedback.yml). It is a public GitHub issue, never blocks uninstall, and Cavaleiro Agent Harness does not upload diagnostics. You can also run `ecc feedback` at any time to see the problem, feedback, and feature routes.

Plugin users should remove the plugin from Claude Code, then delete only the rule folders they manually copied and no longer want. ECC only removes files recorded in its install-state. It does not claim unrelated files in your harness directories.

If you stacked methods, clean up in this order:

1. Remove the Claude Code plugin install.
2. Run the Cavaleiro Agent Harness uninstall command from the project directory that contains the managed install-state.
3. Delete any extra rule folders you copied manually and no longer want.
4. Reinstall once, using a single path.
</details>

## Start Using Cavaleiro Agent Harness

Start with the workflow you need, not the full catalog.

| What you are doing | Start here |
|---|---|
| Building a feature | `/ecc:plan "describe the feature"`, then `tdd-workflow` |
| Fixing a bug | Reproduce it with a failing test, then use `tdd-workflow` |
| Reviewing new code | `/code-review` for a fresh-context review |
| Repairing a build | `/build-fix` |
| Cleaning a codebase | `/refactor-clean` |
| Checking context pressure | `/context-budget` |
| Ending a long session | `/save-session` or `/learn-eval` |
| Resuming later | `/resume-session` |
| Auditing agent config | `/security-scan` with a reviewed scanner, or installed `agentshield scan --path .` |

<details>
<summary><strong>Plugin commands and manual commands</strong></summary>

Claude Code plugin commands use the namespaced form:

```text
/ecc:plan "Add authentication"
```

Manual installs may expose the shorter compatibility form:

```text
/plan "Add authentication"
```

Skills are the primary workflow surface. Commands remain convenient entry points and compatibility shims. Check what is installed with:

```bash
/plugin list ecc@ecc
```
</details>

<details>
<summary><strong>Which agent should I use?</strong></summary>

Skills are the canonical workflow surface; maintained slash entries stay available for command-first workflows.

| I want to... | Use this surface | Agent used |
|--------------|-----------------|------------|
| Plan a new feature | `/ecc:plan "Add auth"` | planner |
| Design system architecture | `/ecc:plan` + architect agent | architect |
| Write code with tests first | `tdd-workflow` skill | tdd-guide |
| Review code I just wrote | `/code-review` | code-reviewer |
| Fix a failing build | `/build-fix` | build-error-resolver |
| Run end-to-end tests | `e2e-testing` skill | e2e-runner |
| Find security vulnerabilities | `/security-scan` | security-reviewer |
| Remove dead code | `/refactor-clean` | refactor-cleaner |
| Update documentation | `/update-docs` | doc-updater |
| Review Go code | `/go-review` | go-reviewer |
| Review Python code | `/python-review` | python-reviewer |
| Review F# code | *(invoke `fsharp-reviewer` directly)* | fsharp-reviewer |
| Review TypeScript/JavaScript code | *(invoke `typescript-reviewer` directly)* | typescript-reviewer |
| Develop HarmonyOS apps | *(invoke `harmonyos-app-resolver` directly)* | harmonyos-app-resolver |
| Audit database queries | *(auto-delegated)* | database-reviewer |
| Review production ML changes | `mle-workflow` skill + `mle-reviewer` agent | mle-reviewer |

</details>

<details>
<summary><strong>Common workflows</strong></summary>

Slash forms below are shown where they remain part of the maintained command surface. Retired short-name shims such as `/tdd` and `/eval` live in `legacy-command-shims/` for explicit opt-in only.

**Starting a new feature:**
```
/ecc:plan "Add user authentication with OAuth"
                                              -> planner creates implementation blueprint
tdd-workflow skill                            -> tdd-guide enforces write-tests-first
/code-review                                  -> code-reviewer checks your work
```

**Fixing a bug:**
```
tdd-workflow skill                            -> tdd-guide: write a failing test that reproduces it
                                              -> implement the fix, verify test passes
/code-review                                  -> code-reviewer: catch regressions
```

**Preparing for production:**
```
/security-scan                                -> security-reviewer: OWASP Top 10 audit
e2e-testing skill                             -> e2e-runner: critical user flow tests
/test-coverage                                -> verify 80%+ coverage
```
</details>

## Self-Hosted Models and Custom Endpoints

Cavaleiro Agent Harness works through each harness's normal configuration, so you can use an official provider, a compatible custom API endpoint or model gateway, or a self-hosted model without changing Cavaleiro Agent Harness's workflows.

For Claude Code, Cavaleiro Agent Harness does not hardcode Anthropic-hosted transport settings. Minimal gateway example:

```bash
export ANTHROPIC_BASE_URL=https://your-gateway.example.com
export ANTHROPIC_AUTH_TOKEN=your-token
claude
```

If your gateway remaps model names, configure that in Claude Code rather than in Cavaleiro Agent Harness. Cavaleiro Agent Harness's hooks, skills, commands, and rules are model-provider agnostic once the `claude` CLI is already working. See Anthropic's [LLM gateway documentation](https://docs.anthropic.com/en/docs/claude-code/llm-gateway) and [model configuration documentation](https://docs.anthropic.com/en/docs/claude-code/model-config).

Run or self-host any open-source model behind that gateway using separate compute and serving setup. If you need GPU capacity, [Itô](https://compute.itomarkets.com) is the preferred compute sponsor named by the bundled CLI; any GPU provider works. The sponsorship link is passive: it does not invoke an RFQ, reserve capacity, provision compute, or configure serving. Separately, `ecc ito find` invokes the explicitly configured canonical Itô CLI and submits a live authenticated RFQ; it does not reserve capacity. Managed inference through Itô is not live yet.

### Self-host Kimi with Cavaleiro Agent Harness + Itô compute

The Kimi Code harness and the model-serving layer are separate. Cavaleiro Agent Harness configures the agent harness; you bring an API endpoint ([get a Kimi API key](https://platform.kimi.ai)) or self-host an open-weight Kimi model on your own GPU capacity. This adapter is verified against Kimi Code 0.31.x (`@moonshot-ai/kimi-code`):

<table aria-label="Local Kimi model path" width="100%">
<tr>
<td width="33%" align="center">
  <a href="https://compute.itomarkets.com">
    <picture><source media="(prefers-color-scheme: light)" srcset="assets/images/sponsors/ito-transparent-light.png" /><img src="assets/images/sponsors/ito-transparent.png" width="92" alt="Itô Markets" /></picture><br />
    <strong>1. Get GPU capacity</strong>
  </a><br />
  <sub>Use Itô or any GPU provider.</sub>
</td>
<td width="33%" align="center">
  <a href="https://www.moonshot.ai">
    <picture><source media="(prefers-color-scheme: dark)" srcset="assets/images/sponsors/moonshot-dark.png" /><img src="assets/images/sponsors/moonshot.png" width="126" alt="Moonshot AI - Kimi" /></picture><br />
    <strong>2. Serve Kimi</strong>
  </a><br />
  <sub>Expose the chosen checkpoint through a compatible endpoint.</sub>
</td>
<td width="33%" align="center">
  <a href=".kimi/README.md">
    <img src="assets/images/community/ecc-tools-mark.svg" height="52" alt="" /><br />
    <strong>3. Run Kimi Code with Cavaleiro Agent Harness</strong>
  </a><br />
  <sub>Install project instructions and skills, then start Kimi Code.</sub>
</td>
</tr>
</table>

Configure the endpoint with Kimi Code's <a href="https://moonshotai.github.io/kimi-cli/en/configuration/providers.html">official provider guide</a>, then install Cavaleiro Agent Harness:

```bash
bash ./install.sh --target kimi --profile minimal
node scripts/ecc.js doctor --target kimi
kimi
```

Kimi Code discovers the installed `.kimi-code/AGENTS.md` instructions and `.kimi-code/skills/` workflows natively; project-level `.agents/skills/` is also an official discovery location. Cavaleiro Agent Harness safely merges project MCP entries into `.kimi-code/mcp.json` and does not change the user-level `~/.kimi-code/config.toml`. Kimi Code supports native hooks, but Cavaleiro Agent Harness's current managed-project adapter does not configure them, so this installer does not offer Kimi hook profiles. The installer dry-run and regression suite verify that every managed Kimi write stays inside the project-local `.kimi-code/` root.

### Itô compute CLI bridge

`ecc ito` delegates to the separately installed canonical Itô client; Cavaleiro Agent Harness does not maintain a second API client. `ecc ito login [--no-browser]` performs device authorization, opens the Itô verification page by default, and persists a device token in macOS Keychain; `--no-browser` suppresses the page handoff. Cavaleiro Agent Harness itself does no browser automation. `ecc ito auth` is validation-only and rejects `--no-browser`. The available operations are `ecc ito login`, `ecc ito auth`, `ecc ito find`, `ecc ito status`, and the separately gated `ecc ito evals`. The matching MCP tools remain `ito_auth`, `ito_find`, and `ito_status`; `ito_auth` validates existing credentials and node qualification is CLI-only.

The `ito-compute-cli` package is currently unpublished. Build it locally from the Itô runtime repo (private while the desk hardens; design partners get access) under `cli/ito-compute-cli`, run `npm ci` and `npm run check`, then set `ECC_ITO_CLI_EXECUTABLE` to that build's absolute `dist/bin/ito.js` path. Login never inherits `ITO_API_KEY`; auth, find, and status forward `ITO_API_KEY` directly when configured, and `ITO_AUTH_MODE=legacy` is not required. `ecc ito logout` revokes the current device credential and retains its local copy if remote revocation cannot be confirmed. Device tokens use macOS Keychain by default; explicit file fallback must retain owner-only directory/file permissions. Cavaleiro Agent Harness does not discover this credential-bearing client through `PATH`. See the [`ito-compute` skill](skills/ito-compute/SKILL.md) for the full RFQ authority and MCP setup contract.

`find` submits a live authenticated RFQ. It does not reserve capacity. `evals` requires both `ITO_ENABLE_SIXTYTWO_LIVE=1` and `--live-sixtytwo`, a separately installed `sixtytwo-cli==0.3.33`, an explicit node list, and an existing absolute configuration directory. It cannot rent, launch, recover, repair, or purchase. Cavaleiro Agent Harness exposes no quote lock, purchase, workload, or inference path, and it never replaces a missing client or failed live call with a local result.

## What's New

Current release: **2.2.3** (2026-10-01). Highlights of the 2.2 line:

- Guided, manifest-driven setup across Claude Code, Codex, and Kimi Code, with install-state ownership, doctor, repair, and uninstall.
- Native Antigravity install, a thin Pi adapter, and the packed-artifact release gate tested on Linux, macOS, and Windows.
- Plan Canvas browser review, the unified memory vault (`ecc memory`), and the Itô compute skill family.

Full history: [CHANGELOG.md](CHANGELOG.md). Per-release notes and evidence live under [docs/releases/](docs/releases/).

### v2.0.0: The Agent Harness Operating System (Jun 2026)

Stable graduation of the 2.0 line: control-pane substrate, worktree lifecycle service, and the `orch-*` orchestrator family. Notes: [docs/releases/2.0.0/release-notes.md](docs/releases/2.0.0/release-notes.md).

## What's Inside

```text
ECC/
|-- agents/           # 71 specialized subagents for delegation
|-- skills/           # 311 reusable workflows loaded on demand
|-- commands/         # 97 maintained slash-command shims
|-- rules/            # opt-in common and language standards
|-- hooks/            # runtime automation and enforcement
|-- scripts/          # install, repair, sync, orchestration, and checks
|-- .claude-plugin/   # Claude Code marketplace manifest
|-- .codex/           # Codex reference configuration and agent roles
|-- .opencode/        # OpenCode plugin, commands, and instructions
|-- .cursor/          # Cursor rules and hook adapter
|-- docs/             # public setup, architecture, and operating guides
```

The root is the source of truth. Platform adapters package or map these same workflows instead of maintaining separate copies.

<details>
<summary><strong>Annotated component catalog</strong></summary>

```
ECC/
|-- .claude-plugin/   # Plugin and marketplace manifests
|   |-- plugin.json         # Plugin metadata and component paths
|   |-- marketplace.json    # Marketplace catalog for /plugin marketplace add
|
|-- agents/           # 71 specialized subagents for delegation
|   |-- planner.md           # Feature implementation planning
|   |-- architect.md         # System design decisions
|   |-- tdd-guide.md         # Test-driven development
|   |-- code-reviewer.md     # Quality and security review
|   |-- security-reviewer.md # Vulnerability analysis
|   |-- build-error-resolver.md
|   |-- e2e-runner.md        # Playwright E2E testing
|   |-- refactor-cleaner.md  # Dead code cleanup
|   |-- doc-updater.md       # Documentation sync
|   |-- docs-lookup.md       # Documentation/API lookup
|   |-- chief-of-staff.md    # Communication triage and drafts
|   |-- loop-operator.md     # Autonomous loop execution
|   |-- harness-optimizer.md # Harness config tuning
|   |-- cpp-reviewer.md      # C++ code review
|   |-- cpp-build-resolver.md # C++ build error resolution
|   |-- fsharp-reviewer.md   # F# functional code review
|   |-- go-reviewer.md       # Go code review
|   |-- go-build-resolver.md # Go build error resolution
|   |-- python-reviewer.md   # Python code review
|   |-- database-reviewer.md # Database/Supabase review
|   |-- typescript-reviewer.md # TypeScript/JavaScript code review
|   |-- java-reviewer.md     # Java/Spring Boot code review
|   |-- java-build-resolver.md # Java/Maven/Gradle build errors
|   |-- kotlin-reviewer.md   # Kotlin/Android/KMP code review
|   |-- kotlin-build-resolver.md # Kotlin/Gradle build errors
|   |-- harmonyos-app-resolver.md # HarmonyOS/ArkTS app development
|   |-- ruby-reviewer.md     # Ruby/Rails code review
|   |-- rust-reviewer.md     # Rust code review
|   |-- rust-build-resolver.md # Rust build error resolution
|   |-- pytorch-build-resolver.md # PyTorch/CUDA training errors
|   |-- mle-reviewer.md      # Production ML pipeline, eval, serving, and monitoring review
|
|-- skills/           # Workflow definitions and domain knowledge
|   |-- coding-standards/           # Language best practices
|   |-- clickhouse-io/              # ClickHouse analytics, queries, data engineering
|   |-- backend-patterns/           # API, database, caching patterns
|   |-- frontend-patterns/          # React, Next.js patterns
|   |-- frontend-slides/            # HTML slide decks and PPTX-to-web presentation workflows
|   |-- article-writing/            # Long-form writing in a supplied voice without generic AI tone
|   |-- content-engine/             # Multi-platform social content and repurposing workflows
|   |-- market-research/            # Source-attributed market, competitor, and investor research
|   |-- osint-investigation/        # OSINT methodology: competing hypotheses, falsification, visual and evidence verification
|   |-- investor-materials/         # Pitch decks, one-pagers, memos, and financial models
|   |-- investor-outreach/          # Personalized fundraising outreach and follow-up
|   |-- continuous-learning/        # Legacy v1 Stop-hook pattern extraction
|   |-- continuous-learning-v2/     # Instinct-based learning with confidence scoring
|   |-- iterative-retrieval/        # Progressive context refinement for subagents
|   |-- strategic-compact/          # Manual compaction suggestions (Longform Guide)
|   |-- tdd-workflow/               # TDD methodology
|   |-- security-review/            # Security checklist
|   |-- eval-harness/               # Verification loop evaluation (Longform Guide)
|   |-- verification-loop/          # Continuous verification (Longform Guide)
|   |-- videodb/                    # Video and audio: ingest, search, edit, generate, stream
|   |-- golang-patterns/            # Go idioms and best practices
|   |-- golang-testing/             # Go testing patterns, TDD, benchmarks
|   |-- cpp-coding-standards/       # C++ coding standards from C++ Core Guidelines
|   |-- cpp-testing/                # C++ testing with GoogleTest, CMake/CTest
|   |-- django-patterns/            # Django patterns, models, views
|   |-- django-security/            # Django security best practices
|   |-- django-tdd/                 # Django TDD workflow
|   |-- django-verification/        # Django verification loops
|   |-- laravel-patterns/           # Laravel architecture patterns
|   |-- laravel-security/           # Laravel security best practices
|   |-- laravel-tdd/                # Laravel TDD workflow
|   |-- laravel-verification/       # Laravel verification loops
|   |-- python-patterns/            # Python idioms and best practices
|   |-- python-testing/             # Python testing with pytest
|   |-- quarkus-patterns/           # Java Quarkus patterns
|   |-- quarkus-security/           # Quarkus security
|   |-- quarkus-tdd/                # Quarkus TDD
|   |-- quarkus-verification/       # Quarkus verification
|   |-- rails-patterns/             # Rails architecture patterns
|   |-- springboot-patterns/        # Java Spring Boot patterns
|   |-- springboot-security/        # Spring Boot security
|   |-- springboot-tdd/             # Spring Boot TDD
|   |-- springboot-verification/    # Spring Boot verification
|   |-- configure-ecc/              # Interactive installation wizard
|   |-- security-scan/              # AgentShield security auditor integration
|   |-- java-coding-standards/      # Java coding standards
|   |-- jpa-patterns/               # JPA/Hibernate patterns
|   |-- postgres-patterns/          # PostgreSQL optimization patterns
|   |-- nutrient-document-processing/ # Document processing with Nutrient API
|   |-- database-migrations/        # Migration patterns (Prisma, Drizzle, Django, Go)
|   |-- api-design/                 # REST API design, pagination, error responses
|   |-- deployment-patterns/        # CI/CD, Docker, health checks, rollbacks
|   |-- docker-patterns/            # Docker Compose, networking, volumes, container security
|   |-- e2e-testing/                # Playwright E2E patterns and Page Object Model
|   |-- content-hash-cache-pattern/ # SHA-256 content hash caching for file processing
|   |-- cost-aware-llm-pipeline/    # LLM cost optimization, model routing, budget tracking
|   |-- regex-vs-llm-structured-text/ # Decision framework: regex vs LLM for text parsing
|   |-- swift-actor-persistence/    # Thread-safe Swift data persistence with actors
|   |-- swift-protocol-di-testing/  # Protocol-based DI for testable Swift code
|   |-- search-first/               # Research-before-coding workflow
|   |-- skill-stocktake/            # Audit skills and commands for quality
|   |-- liquid-glass-design/        # iOS 26 Liquid Glass design system
|   |-- foundation-models-on-device/ # Apple on-device LLM with FoundationModels
|   |-- swift-concurrency-6-2/      # Swift 6.2 Approachable Concurrency
|   |-- mle-workflow/               # Production ML data contracts, evals, deployment, monitoring
|   |-- perl-patterns/              # Modern Perl 5.36+ idioms and best practices
|   |-- perl-security/              # Perl security patterns, taint mode, safe I/O
|   |-- perl-testing/               # Perl TDD with Test2::V0, prove, Devel::Cover
|   |-- autonomous-loops/           # Autonomous loop patterns: sequential pipelines, PR loops, DAG orchestration
|   |-- plankton-code-quality/      # Write-time code quality enforcement with Plankton hooks
|   |-- codehealth-mcp/             # Optional CodeScene Code Health MCP skill (opt-in)
|   |-- docs/examples/project-guidelines-template.md  # Template for project-specific skills
|
|-- commands/         # Maintained slash-entry compatibility; prefer skills/
|   |-- plan.md             # /plan - Implementation planning
|   |-- code-review.md      # /code-review - Quality review
|   |-- build-fix.md        # /build-fix - Fix build errors
|   |-- refactor-clean.md   # /refactor-clean - Dead code removal
|   |-- quality-gate.md     # /quality-gate - Verification gate
|   |-- learn.md            # /learn - Extract patterns mid-session (Longform Guide)
|   |-- learn-eval.md       # /learn-eval - Extract, evaluate, and save patterns
|   |-- checkpoint.md       # /checkpoint - Save verification state (Longform Guide)
|   |-- setup-pm.md         # /setup-pm - Configure package manager
|   |-- go-review.md        # /go-review - Go code review
|   |-- go-test.md          # /go-test - Go TDD workflow
|   |-- go-build.md         # /go-build - Fix Go build errors
|   |-- skill-create.md     # /skill-create - Generate skills from git history
|   |-- instinct-status.md  # /instinct-status - View learned instincts
|   |-- instinct-import.md  # /instinct-import - Import instincts
|   |-- instinct-export.md  # /instinct-export - Export instincts
|   |-- evolve.md           # /evolve - Cluster instincts into skills
|   |-- prune.md            # /prune - Delete expired pending instincts
|   |-- pm2.md              # /pm2 - PM2 service lifecycle management
|   |-- multi-plan.md       # /multi-plan - Multi-agent task decomposition
|   |-- multi-execute.md    # /multi-execute - Orchestrated multi-agent workflows
|   |-- multi-backend.md    # /multi-backend - Backend multi-service orchestration
|   |-- multi-frontend.md   # /multi-frontend - Frontend multi-service orchestration
|   |-- multi-workflow.md   # /multi-workflow - General multi-service workflows
|   |-- sessions.md         # /sessions - Session history management
|   |-- test-coverage.md    # /test-coverage - Test coverage analysis
|   |-- update-docs.md      # /update-docs - Update documentation
|   |-- update-codemaps.md  # /update-codemaps - Update codemaps
|   |-- python-review.md    # /python-review - Python code review
|-- legacy-command-shims/   # Opt-in archive for retired shims such as /tdd and /eval
|   |-- tdd.md              # /tdd - Prefer the tdd-workflow skill
|   |-- e2e.md              # /e2e - Prefer the e2e-testing skill
|   |-- eval.md             # /eval - Prefer the eval-harness skill
|   |-- verify.md           # /verify - Prefer the verification-loop skill
|   |-- orchestrate.md      # /orchestrate - Prefer dmux-workflows or multi-workflow
|
|-- rules/            # Always-follow guidelines (copy to ~/.claude/rules/ecc/)
|   |-- README.md            # Structure overview and installation guide
|   |-- common/              # Language-agnostic principles
|   |   |-- coding-style.md    # Immutability, file organization
|   |   |-- git-workflow.md    # Commit format, PR process
|   |   |-- testing.md         # TDD, 80% coverage requirement
|   |   |-- performance.md     # Model selection, context management
|   |   |-- patterns.md        # Design patterns, skeleton projects
|   |   |-- hooks.md           # Hook architecture, TodoWrite
|   |   |-- agents.md          # When to delegate to subagents
|   |   |-- security.md        # Mandatory security checks
|   |-- typescript/          # TypeScript/JavaScript specific
|   |-- python/              # Python specific
|   |-- golang/              # Go specific
|   |-- swift/               # Swift specific
|   |-- php/                 # PHP specific
|   |-- arkts/               # HarmonyOS / ArkTS specific
|
|-- hooks/            # Trigger-based automations
|   |-- README.md                 # Hook documentation, recipes, and customization guide
|   |-- hooks.json                # All hooks config (PreToolUse, PostToolUse, Stop, etc.)
|   |-- memory-persistence/       # Session lifecycle hooks (Longform Guide)
|   |-- strategic-compact/        # Compaction suggestions (Longform Guide)
|
|-- scripts/          # Cross-platform Node.js scripts
|   |-- lib/                     # Shared utilities
|   |   |-- utils.js             # Cross-platform file/path/system utilities
|   |   |-- package-manager.js   # Package manager detection and selection
|   |-- hooks/                   # Hook implementations
|   |   |-- session-start.js     # Load context on session start
|   |   |-- session-end.js       # Save state on session end
|   |   |-- pre-compact.js       # Pre-compaction state saving
|   |   |-- suggest-compact.js   # Strategic compaction suggestions
|   |   |-- evaluate-session.js  # Extract patterns from sessions
|   |-- setup-package-manager.js # Interactive PM setup
|
|-- tests/            # Test suite
|   |-- lib/                     # Library tests
|   |-- hooks/                   # Hook tests
|   |-- run-all.js               # Run all tests
|
|-- contexts/         # Dynamic system prompt injection contexts (Longform Guide)
|   |-- dev.md              # Development mode context
|   |-- review.md           # Code review mode context
|   |-- research.md         # Research/exploration mode context
|
|-- examples/         # Example configurations and sessions
|   |-- CLAUDE.md             # Example project-level config
|   |-- user-CLAUDE.md        # Example user-level config
|   |-- saas-nextjs-CLAUDE.md   # Real-world SaaS (Next.js + Supabase + Stripe)
|   |-- go-microservice-CLAUDE.md # Real-world Go microservice (gRPC + PostgreSQL)
|   |-- django-api-CLAUDE.md      # Real-world Django REST API (DRF + Celery)
|   |-- laravel-api-CLAUDE.md     # Real-world Laravel API (PostgreSQL + Redis)
|   |-- rust-api-CLAUDE.md        # Real-world Rust API (Axum + SQLx + PostgreSQL)
|
|-- mcp-configs/      # MCP server configurations
|   |-- mcp-servers.json    # GitHub, Supabase, Vercel, Railway, etc.
|
|-- ecc_dashboard.py  # Desktop GUI dashboard (Tkinter)
|
|-- marketplace.json  # Self-hosted marketplace config (for /plugin marketplace add)
```
</details>

<details>
<summary><strong>Dashboard GUI</strong></summary>

Launch the desktop dashboard to visually explore Cavaleiro Agent Harness components:

```bash
npm run dashboard
# or
python3 ./ecc_dashboard.py
```

**Features:**
- Tabbed interface: Agents, Skills, Commands, Rules, Settings
- Dark/Light theme toggle
- Font customization (family and size)
- Project logo in header and taskbar
- Search and filter across all components
</details>

## Key Concepts

<details>
<summary><strong>Agents, skills, hooks, and rules explained</strong></summary>

### Agents

Subagents handle delegated tasks with limited scope. Example:

```markdown
---
name: code-reviewer
description: Reviews code for quality, security, and maintainability
tools: Read, Grep, Glob, Bash
model: opus
---

You are a senior code reviewer...
```

### Skills

Skills are the primary workflow surface. They can be invoked directly, suggested automatically, and reused by agents. Cavaleiro Agent Harness still ships maintained `commands/` during migration, while retired short-name shims live under `legacy-command-shims/` for explicit opt-in only. New workflow development should land in `skills/` first.

```markdown
# TDD Workflow

1. Define interfaces first
2. Write failing tests (RED)
3. Implement minimal code (GREEN)
4. Refactor (IMPROVE)
5. Verify 80%+ coverage
```

### Hooks

Hooks fire on tool events. Example: warn about console.log:

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] Remove console.log' >&2"
  }]
}
```

### Rules

Rules are always-follow guidelines, organized into `common/` (language-agnostic) + language-specific directories:

```
rules/
  common/          # Universal principles (always install)
  typescript/      # TS/JS specific patterns and tools
  python/          # Python specific patterns and tools
  golang/          # Go specific patterns and tools
  swift/           # Swift specific patterns and tools
  php/             # PHP specific patterns and tools
  arkts/           # HarmonyOS / ArkTS patterns and constraints
```

See [`rules/README.md`](rules/README.md) for installation and structure details.
</details>

## Guides

This repo is the raw code. The guides explain everything.

<table aria-label="ECC guides" width="100%">
<tr>
<td width="33%" align="center">
<a href="./the-shortform-guide.md">
<img src="assets/images/guides/shorthand-guide.png" width="213" height="120" alt="The Shorthand Guide to ECC" /><br />
<strong>The Shorthand Guide</strong>
</a>
<br /><sub>Setup, foundations, and day-one use. <b>Read this first.</b></sub>
</td>
<td width="33%" align="center">
<a href="./the-longform-guide.md">
<img src="assets/images/guides/longform-guide.png" width="213" height="120" alt="The Longform Guide to ECC" /><br />
<strong>The Longform Guide</strong>
</a>
<br /><sub>Context economics, memory, evals, and parallel agents.</sub>
</td>
<td width="33%" align="center">
<a href="./the-security-guide.md">
<img src="assets/images/guides/security-guide.png" width="213" height="120" alt="The Security Guide to ECC" /><br />
<strong>The Security Guide</strong>
</a>
<br /><sub>Prompt injection, hooks, MCP, and AgentShield.</sub>
</td>
</tr>
</table>

| Topic | What You'll Learn |
|-------|-------------------|
| Token Optimization | Model selection, system prompt slimming, background processes |
| Memory Persistence | Hooks that save/load context across sessions automatically |
| Continuous Learning | Auto-extract patterns from sessions into reusable skills |
| Verification Loops | Checkpoint vs continuous evals, grader types, pass@k metrics |
| Parallelization | Git worktrees, cascade method, when to scale instances |
| Subagent Orchestration | The context problem, iterative retrieval pattern |

[Commands Quick Reference](./COMMANDS-QUICK-REF.md) | [Manual Adaptation Guide](docs/MANUAL-ADAPTATION-GUIDE.md) | [Astra Review Guide](docs/ASTRA-REVIEW-GUIDE.md) | [Troubleshooting FAQ](./TROUBLESHOOTING.md) | [Roadmap](docs/ROADMAP.md)

## Why Choose Cavaleiro Agent Harness?

| Without a system                                        | With Cavaleiro Agent Harness                                                              |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| Plans disappear into chat history                       | Plans become editable artifacts before implementation starts          |
| "Please use TDD" is an instruction the model may forget | TDD becomes a gated RED -> GREEN -> REFACTOR workflow with evidence   |
| The same context writes and reviews the code            | A fresh-context reviewer looks for regressions and blind spots        |
| Memory means saving an enormous transcript              | Sessions are distilled into summaries, instincts, and reusable skills |
| Quality checks depend on reminders                      | Hooks can enforce deterministic checks outside the prompt             |
| Agent configuration is trusted by default               | AgentShield scans the harness itself as an attack surface             |

### TDD: Test-Driven Development

```text
/ecc:plan "Add usage-based billing alerts"
  -> confirm or edit the plan
  -> activate tdd-workflow
  -> capture RED evidence before implementation
  -> implement until GREEN
  -> review from fresh context
  -> fix findings with regression tests
  -> verify build, lint, types, and tests
```

A result is not just code. It's a trail of evidence: the plan, the failing test, the passing test, the review findings, and the final verification.

### Skills keep the context focused

Rules, skills, agents, and hooks solve different problems. Keeping those jobs separate is how Cavaleiro Agent Harness adds capability without dumping the entire repository into every session.

| Concept | What it does | Context behavior |
|---|---|---|
| Skills | Reusable workflows such as TDD, security review, or deep research | Loaded when the task needs them |
| Agents | Scoped workers with their own context and tool permissions | Isolate planning, implementation, and review |
| Rules | Durable project or language standards | Always loaded, so install them selectively |
| Hooks | Scripts triggered by harness events | Run outside the model context |
| Instincts | Patterns learned from real sessions with confidence scores | Recalled when relevant |

### Share context between harnesses

Cavaleiro Agent Harness's Memory Vault gives Claude, Codex, Hermes, OpenClaw, Kimi, and other harnesses one local, inspectable Markdown format for durable context and handoffs. Project and team memories live under `.ecc/memory/`; user memories live under `~/.ecc/memory/`.

Skill-only, minimal, manual, and Claude plugin installs do not put the Memory Vault runtime on `PATH`. Install the npm runtime separately before using the CLI or optional MCP server:

```bash
npm install -g ecc-universal@2.2.3
ecc memory init --scope project
ecc memory search "authentication migration" --target-harness codex
ecc memory doctor
```

Memory is unreviewed context, not executable policy. Verify important claims against authoritative sources and promote accepted knowledge into governed project documentation. The optional `ecc-memory-mcp` server exposes the same bounded save, search, read, and doctor surface without enabling itself by default.

[Open the Unified Memory workflow →](skills/unified-memory/SKILL.md)

<details>
<summary><strong>Memory Vault in depth: scopes, handoffs, and trust boundaries</strong></summary>

The Memory Vault stores portable `ecc.memory.v1` Markdown documents instead of copying vendor transcripts or emailing context between agents. Project memories are protected by a fail-closed `.gitignore`; use the team scope only for human-inspected, version-controlled sharing. Team memories remain unreviewed context even after they are committed.

After installing the runtime above, check that the CLI and optional MCP entry point are available:

```bash
ecc memory --help
command -v ecc-memory-mcp
```

```bash
# Initialize the project vault.
ecc memory init --scope project

# Write a handoff body to a regular file, then target the next harness.
ecc memory handoff \
  --from hermes \
  --target codex \
  --title "Continue authentication migration" \
  --body-file ./handoff.md

# Recall it from another harness.
ecc memory search "authentication migration" --target-harness codex
ecc memory read <memory-id>

# Validate the vault before sharing team memories.
ecc memory doctor
```

Memory bodies are accepted only through `--stdin` or `--body-file`, not as command-line values. The first release keeps every vault entry unreviewed and create-only; human review promotes accepted knowledge into governed project documentation rather than changing memory trust. Normal search recall returns active project and team memories. A direct ID read may inspect a non-active entry. User-scope recall must be requested explicitly. Agents must verify important claims against authoritative sources and must never treat recalled bodies as executable instructions or policy.

For opt-in MCP access, add the `ecc-memory-vault` entry from [`mcp-configs/mcp-servers.json`](mcp-configs/mcp-servers.json) to each harness that needs it, then run `ecc-memory-mcp`. The server exposes only `memory_save`, `memory_search`, `memory_read`, and `memory_doctor`. Each server must launch with a lowercase `ECC_MEMORY_HARNESS` identity; the identity is server-bound and cannot be supplied by a tool caller. User scope additionally requires the operator-controlled `ECC_MEMORY_ALLOW_USER_SCOPE=1` opt-in. See [`skills/unified-memory/SKILL.md`](skills/unified-memory/SKILL.md) for the workflow and trust boundaries, and [`docs/design/ecc-memory-vault.md`](docs/design/ecc-memory-vault.md) for the capability contract.
</details>

## Platform Support

Cavaleiro Agent Harness's core Node.js CLI and managed installers run on **Windows, macOS, and Linux**, but optional capabilities are not at full parity. Some continuous-learning, GAN, and orchestration paths still require Bash or Python; harnesses also expose different hook, agent, and skill APIs.

| Platform | Status | Current limitation |
|---|---|---|
| Linux | Supported core | Optional features may require Bash, Python, or provider-specific tools. |
| macOS | Supported core | The standalone GAN shell path is not compatible with the system Bash 3.2 and currently has a score-parsing defect (original issue #2674). |
| Windows + WSL | Supported core | WSL follows the Linux paths; Windows host integrations still vary by harness. |
| Windows native | Supported with limitations | Continuous-learning v2's observer daemon and memory-vault writes have open native-Windows defects (original issues #2489 and #2626). Shell-backed optional features require Git Bash/WSL or are unavailable. |

Treat `stable`, `beta`, `experimental`, and `instruction-only` below as capability statements, not marketing tiers.

| Harness | Status | Recommended distribution | Important limitation |
|---|---|---|---|
| Claude Code | Stable primary | Plugin or selective installer | The plugin advertises the installed catalog to the model; use a selective/manual profile when context footprint matters. Optional shell-backed skills are not portable to every OS. |
| Codex | Supported native plugin | Codex marketplace plugin or repo config | Native hooks require an explicit trust decision and do not use Claude's hook profiles. The legacy sync is compatibility-only. |
| Qoder | Supported native plugin | Local plugin directory in Qoder CLI or ZIP upload in Qoder IDE | Loads the canonical skills, agents, commands, and MCP config; only the reviewed SessionStart hook is enabled, and Node.js 18+ must be on the non-interactive PATH. |
| Cursor | Beta project adapter | Selective installer into `.cursor/` | Agent discovery varies by Cursor build; hook events use profile-gated dispatchers, but full Claude feature parity is not claimed. |
| OpenCode | Beta built plugin | Build plugin, then selective installer | Cavaleiro Agent Harness ships a subset of the catalog; connect a provider and select a model in OpenCode (original issue #2617). |
| GitHub Copilot Chat | Instruction-only | Checked-in instructions and prompt files | Cavaleiro Agent Harness hooks are not adapted. |
| GitHub Copilot CLI | Beta project adapter | `--target copilot` places skills and adapted agents in `.github/` | Cavaleiro Agent Harness hooks, rules, and command shims are not installed by this target. |
| Gemini, Zed, Antigravity, Qwen, Hermes, OpenClaw, Kimi, CodeBuddy, JoyCode | Experimental/minimal adapters | Harness-specific selective target | File placement and instruction portability are tested; full Claude feature parity is not claimed. |

<details>
<summary><strong>Package manager detection</strong></summary>

The plugin automatically detects your preferred package manager (npm, pnpm, yarn, or bun) with the following priority:

1. **Environment variable**: `CLAUDE_PACKAGE_MANAGER`
2. **Project config**: `.claude/package-manager.json`
3. **package.json**: `packageManager` field
4. **Lock file**: Detection from package-lock.json, yarn.lock, pnpm-lock.yaml, or bun.lockb
5. **Global config**: `~/.claude/package-manager.json`
6. **Fallback**: First available package manager

To set your preferred package manager:

```bash
# Via environment variable
export CLAUDE_PACKAGE_MANAGER=pnpm

# Via global config
node scripts/setup-package-manager.js --global pnpm

# Via project config
node scripts/setup-package-manager.js --project bun

# Detect current setting
node scripts/setup-package-manager.js --detect
```

Or use the `/setup-pm` command.
</details>

<details>
<summary><strong>Hook runtime controls (env vars)</strong></summary>

Use runtime flags to tune strictness or disable specific hooks temporarily:

```bash
# Hook strictness profile (default: standard)
export ECC_HOOK_PROFILE=standard

# Comma-separated hook IDs to disable
export ECC_DISABLED_HOOKS="pre:bash:tmux-reminder,post:edit:typecheck"

# Cap SessionStart additional context (default: 8000 chars)
export ECC_SESSION_START_MAX_CHARS=4000

# Disable SessionStart additional context entirely for low-context/local-model setups
export ECC_SESSION_START_CONTEXT=off

# Session-tmp retention window in days (default: 30).
# Set to 0, off, false, disabled, never, or none to keep all sessions (disable pruning).
export ECC_SESSION_RETENTION_DAYS=14

# Cap how many learned instincts SessionStart injects into context (default: 6)
export ECC_MAX_INJECTED_INSTINCTS=6

# Minimum confidence an instinct needs to be injected, 0-1 (default: 0.7)
export ECC_INSTINCT_CONFIDENCE_THRESHOLD=0.7

# SessionStart ranks injected instincts by confidence + project/stack relevance
# (default: on). Project-scoped instincts, and instincts whose domain/trigger
# matches the detected stack (languages, frameworks, plus terraform/dbt markers),
# get a small ranking boost so they surface above unrelated higher-confidence
# ones. Set to off/false/0/no to rank by confidence alone.
export ECC_INSTINCT_RELEVANCE_RANKING=on

# Keep context/scope/loop warnings but suppress API-rate cost estimates
export ECC_CONTEXT_MONITOR_COST_WARNINGS=off
```

Windows PowerShell:

```powershell
[Environment]::SetEnvironmentVariable('ECC_CONTEXT_MONITOR_COST_WARNINGS', 'off', 'User')
[Environment]::SetEnvironmentVariable('ECC_SESSION_RETENTION_DAYS', '14', 'User')
```
</details>

<details>
<summary><strong>Agent data home (multi-harness isolation)</strong></summary>

Memory persistence hooks (session summaries, learned skills, session aliases, metrics) store data under a single agent data root. By default that root is `~/.claude`. When you use Cavaleiro Agent Harness in both Claude Code and Cursor on the same machine, set a separate root for Cursor so the two environments do not overwrite each other's session files:

```bash
# Cursor-only boundary (Claude Code keeps the default ~/.claude)
export ECC_AGENT_DATA_HOME="$HOME/.cursor/ecc"
```

Paths resolved under that root include:

- `$ECC_AGENT_DATA_HOME/session-data/`: session summaries
- `$ECC_AGENT_DATA_HOME/skills/learned/`: learned skills from evaluate-session
- `$ECC_AGENT_DATA_HOME/session-aliases.json`: session aliases
- `$ECC_AGENT_DATA_HOME/metrics/`: cost and activity metrics

Background: original issue #2065.
</details>

<details>
<summary><strong>Cross-tool capability map and per-harness notes</strong></summary>

### Cross-tool capability map

| Capability | Claude Code | Codex | Cursor | OpenCode | GitHub Copilot |
|---|---|---|---|---|---|
| Instructions | Native | Native `AGENTS.md` | Project rules | Plugin instructions | Native instruction file |
| Skills | Native installed set | Native plugin set | Build-dependent/project set | Built subset | Native discovery (Copilot CLI) from `.github/skills/`, `.agents/skills/`, `.claude/skills/` |
| Agents/delegation | Native agents | Codex multi-agent roles; Claude agent files are not installed as roles | Build-dependent project agents | Plugin agents | Copilot CLI custom agents via `.github/agents/` and `--agent` |
| ECC hooks | Native plugin hooks | Native reviewed subset with explicit trust | Cursor hook adapter; install-path differences remain | Plugin events | Not ported; Copilot CLI has its own plugin hook system |
| MCP configuration | Available, explicit activation | Native plugin manifest; legacy sync can merge TOML | Explicit project/user config | Provider/plugin config | Not supplied by Cavaleiro Agent Harness |
| Parity with Claude Code | Primary reference | Partial | Partial | Partial | Partial |

**Key architectural decisions:**
- **AGENTS.md** at root is the universal cross-tool file (read by Claude Code, Cursor, Codex, and OpenCode; GitHub Copilot uses `.github/copilot-instructions.md` instead)
- **DRY adapter pattern** lets Cursor reuse Claude Code's hook scripts without duplication
- **Skills format** (SKILL.md with YAML frontmatter) works across Claude Code, Codex, OpenCode, and GitHub Copilot CLI
- Codex's narrower native hook set is supplemented by `AGENTS.md`, optional `model_instructions_file` overrides, and sandbox permissions

<details>
<summary><strong>Cursor IDE support in depth</strong></summary>

Cavaleiro Agent Harness provides Cursor IDE support with hooks, rules, agents, skills, commands, and MCP configs adapted for Cursor's project layout.

```bash
# macOS/Linux
./install.sh --target cursor typescript
./install.sh --target cursor python golang swift php
```

```powershell
# Windows PowerShell
.\install.ps1 --target cursor typescript
.\install.ps1 --target cursor python golang swift php
```

#### What's included for Cursor

| Component | Count | Details |
|-----------|-------|---------|
| Hook Events | 15 | sessionStart, beforeShellExecution, afterFileEdit, beforeMCPExecution, beforeSubmitPrompt, and 10 more |
| Hook Entrypoints | 15 | Thin Node.js event dispatchers delegating to `scripts/hooks/` via shared adapter |
| Rules | 34 | 9 common (alwaysApply) + 25 language-specific (TypeScript, Python, Go, Swift, PHP) |
| Agents | 48 | `.cursor/agents/ecc-*.md` when installed; prefixed to avoid collisions with user or marketplace agents |
| Skills | Shared + Bundled | `.cursor/skills/` for translated additions |
| Commands | Shared | `.cursor/commands/` if installed |
| MCP Config | Shared | `.cursor/mcp.json` if installed |

#### Cursor loading notes

ECC does not install root `AGENTS.md` into `.cursor/`. Cursor treats nested `AGENTS.md` files as directory context, so copying Cavaleiro Agent Harness's repo identity into a host project would pollute that project.

Cursor-native loading behavior can vary by Cursor build. Cavaleiro Agent Harness installs agents as `.cursor/agents/ecc-*.md`; if your Cursor build does not expose project agents, those files still work as explicit reference definitions instead of hidden global prompt context.

#### Memory and data isolation (Cursor + Claude Code)

Cavaleiro Agent Harness memory hooks reuse the same `scripts/hooks/*.js` as Claude Code. For Cursor, Cavaleiro Agent Harness tries to keep memory **out of `~/.claude` automatically**:

1. **Cursor `sessionStart` hook** (installed to `.cursor/hooks.json` on `--target cursor`) injects `ECC_AGENT_DATA_HOME` for the whole composer session.
2. **Hook runtime default**: when `CURSOR_VERSION` or `CURSOR_PROJECT_DIR` is present, hooks default to `~/.cursor/ecc` if the env var is unset.
3. **Project config**: `.cursor/ecc-agent-data.json` documents and overrides the path (`agentDataHome`).
4. **Always-on rule**: `.cursor/rules/ecc-agent-data-home.mdc` reminds the agent where memory lives.

You can still override explicitly:

```bash
export ECC_AGENT_DATA_HOME="$HOME/.cursor/ecc"
```

To **share** memory with Claude Code on purpose, set `ECC_AGENT_DATA_HOME=~/.claude` in the shell or in `.cursor/ecc-agent-data.json`.

Continuous learning v2 instincts remain separate under `CLV2_HOMUNCULUS_DIR` (default `~/.local/share/ecc-homunculus`).

#### Hook architecture (DRY adapter pattern)

Cursor has **more hook events than Claude Code** (20 vs 8). The `.cursor/hooks/adapter.js` module transforms Cursor's stdin JSON to Claude Code's format, allowing existing `scripts/hooks/*.js` to be reused without duplication. Each Cursor event is registered with one event-level dispatcher so enabled checks run in a deterministic order and remain compatible with Cursor versions that execute only the first matching entry. The adapter resolves the shared runtime from both the Cavaleiro Agent Harness checkout and an installed project's `.cursor/scripts/` tree.

```
Cursor stdin JSON -> adapter.js -> transforms -> scripts/hooks/*.js
                                                (shared with Claude Code)
```

Key hooks:
- **beforeShellExecution**: Blocks git hook bypasses and dev servers outside tmux (exit 2), then adds profile-gated shell reminders
- **afterFileEdit / stop**: Accumulates edited JS/TS files and runs one profile-gated format/typecheck batch at Stop, alongside the console.log audit
- **beforeSubmitPrompt**: Detects secrets (sk-, ghp_, AKIA patterns) in prompts
- **beforeTabFileRead**: Blocks Tab from reading .env, .key, .pem files (exit 2)
- **beforeMCPExecution / afterMCPExecution**: MCP audit logging

#### Rules format

Cursor rules use YAML frontmatter with `description`, `globs`, and `alwaysApply`:

```yaml
---
description: "TypeScript coding style extending common rules"
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
alwaysApply: false
---
```
</details>

<details>
<summary><strong>Codex macOS app + CLI support in depth</strong></summary>

Cavaleiro Agent Harness provides a supported native Codex marketplace plugin and repo-local configuration for the macOS app and CLI. The native plugin carries shared skills, MCP configuration, and a reviewed hook subset; Codex keeps hook trust under explicit user control. The older sync path remains compatibility-only. For repo navigation, surface ownership, and PR diff packet guidance, start with [`docs/CODEX-NAVIGATION-GUIDE.md`](docs/CODEX-NAVIGATION-GUIDE.md).

```bash
# Recommended current install: add ECC's native plugin from the repo marketplace
codex plugin marketplace add cavaleiro-ai/cavaleiro-agent-harness
codex plugin add ecc@ecc
codex plugin list --json

# Or run Codex CLI in the repo: AGENTS.md and .codex/ are auto-detected
codex
```

Legacy copied-configuration compatibility is still available when you intentionally need it:

```bash
# Compatibility-only managed sync into ~/.codex
npm install && bash scripts/sync-ecc-to-codex.sh

# Or copy only the reference config manually
cp .codex/config.toml ~/.codex/config.toml
```

Normal MCP sync preserves existing server settings and warns when they differ from Cavaleiro Agent Harness's recommendation. An existing `chrome-devtools-mcp@latest` entry therefore stays unchanged; updating the repository alone does not adopt the recommended `chrome-devtools-mcp@1.10.1` pin. Existing legacy-sync users can preview and explicitly apply the refresh from the updated Cavaleiro Agent Harness checkout:

```bash
bash scripts/sync-ecc-to-codex.sh --dry-run --update-mcp
bash scripts/sync-ecc-to-codex.sh --update-mcp
```

Review the preview before applying: `--update-mcp` replaces the entire recommended `chrome-devtools` server section, including custom command arguments and nested settings. Unrelated user-managed servers remain in place. Retired defaults such as Context7 are not refreshed or migrated by this flag.

Codex macOS app:
- Open this repository as your workspace.
- The root `AGENTS.md` is auto-detected.
- `.codex/config.toml` and `.codex/agents/*.toml` work best when kept project-local.
- The reference `.codex/config.toml` intentionally does not pin `model` or `model_provider`, so Codex uses its own current default unless you override it.
- Optional: copy `.codex/config.toml` to `~/.codex/config.toml` for global defaults; keep the multi-agent role files project-local unless you also copy `.codex/agents/`.

#### What's included in the repo and legacy configuration layer

| Component | Count | Details |
|-----------|-------|---------|
| Config | 1 | `.codex/config.toml`: top-level approvals/sandbox/web_search, MCP servers, notifications, profiles |
| AGENTS.md | 2 | Root (universal) + `.codex/AGENTS.md` (Codex-specific supplement) |
| Skills | 32 | `.agents/skills/`: SKILL.md + agents/openai.yaml per skill |
| MCP Servers | 6 legacy reference entries | GitHub, Context7, Exa, Memory, Playwright, Sequential Thinking. Current managed sync recommends `chrome-devtools`; see the explicit refresh instructions above. |
| Profiles | 2 | `strict` (read-only sandbox) and `yolo` (full auto-approve) |
| Agent Roles | 3 | `.codex/agents/`: explorer, reviewer, docs-researcher |

Skills at `.agents/skills/` are auto-loaded by Codex. Canonical Anthropic skills such as `claude-api`, `frontend-design`, and `skill-creator` are intentionally not re-bundled here. Install those from [`anthropics/skills`](https://github.com/anthropics/skills) when you want the official versions.

#### Key limitation

Codex does **not provide Claude-style hook execution parity**. The native Cavaleiro Agent Harness plugin includes a reviewed hook subset that requires explicit trust in `/hooks`; `AGENTS.md`, optional `model_instructions_file` overrides, and sandbox/approval settings provide the remaining instruction and policy layers.

#### Multi-agent support

Current Codex builds support stable multi-agent workflows.

- Enable `features.multi_agent = true` in `.codex/config.toml`
- Define roles under `[agents.<name>]`
- Point each role at a file under `.codex/agents/`
- Use `/agent` in the CLI to inspect or steer child agents

Cavaleiro Agent Harness ships three sample role configs:

| Role | Purpose |
|------|---------|
| `explorer` | Read-only codebase evidence gathering before edits |
| `reviewer` | Correctness, security, and missing-test review |
| `docs_researcher` | Documentation and API verification before release/docs changes |

</details>

<details>
<summary><strong>Zed support</strong></summary>

Cavaleiro Agent Harness provides Zed project support through a conservative `.zed` adapter for project-local settings, flattened rules, agents, commands, and skills.

```bash
./install.sh --profile minimal --target zed
```

```powershell
.\install.ps1 --profile minimal --target zed
```

The adapter writes harness-managed files under `.zed/` and keeps BYOK/OpenRouter credentials out of the repo. Configure Zed account or API keys through Zed's own settings UI or your local user settings.
</details>

<details>
<summary><strong>OpenCode support in depth</strong></summary>

Cavaleiro Agent Harness provides a beta OpenCode plugin integration with instructions, a catalog subset, commands, custom tools, and hook events. It does not provide feature parity with Claude Code. The reference config inherits the user's OpenCode model selection instead of pinning a provider-specific model.

```bash
# Run your reviewed OpenCode installation in the repository root
opencode
```

For installation, use the [official OpenCode instructions](https://opencode.ai/docs/), select an exact release, and verify it before execution. The upstream npm package is `opencode-ai`, not `opencode`. Cavaleiro Agent Harness does not attest to an audited OpenCode runtime version.

The configuration is automatically detected from `.opencode/opencode.json`.

#### Hook support via plugins

OpenCode's plugin system has 20+ event types:

| Claude Code Hook | OpenCode Plugin Event |
|-----------------|----------------------|
| PreToolUse | `tool.execute.before` |
| PostToolUse | `tool.execute.after` |
| Stop | `session.idle` |
| SessionStart | `session.created` |
| SessionEnd | `session.deleted` |

**Additional OpenCode events**: `file.edited`, `file.watcher.updated`, `message.updated`, `lsp.client.diagnostics`, `tui.toast.show`, and more.

#### Plugin installation

**Option 1: Use directly**
```bash
cd cavaleiro-agent-harness
opencode
```

**Option 2: Install as npm package**
```bash
npm install ecc-universal@2.2.3
```

Then add to your `opencode.json`:
```json
{
  "plugin": ["ecc-universal"]
}
```

That npm plugin entry enables the published `ecc-universal` OpenCode plugin module (hooks/events and plugin tools). It does **not** automatically add Cavaleiro Agent Harness's full command/agent/instruction catalog to your project config.

For the full Cavaleiro Agent Harness OpenCode setup, either:
- run OpenCode inside this repository, or
- copy the bundled `.opencode/` config assets into your project and wire the `instructions`, `agent`, and `command` entries in `opencode.json`

#### Documentation

- **Migration Guide**: `.opencode/MIGRATION.md`
- **OpenCode Plugin README**: `.opencode/README.md`
- **Consolidated Rules**: `.opencode/instructions/INSTRUCTIONS.md`
- **LLM Documentation**: `llms.txt` (complete OpenCode docs for LLMs)
</details>

<details>
<summary><strong>GitHub Copilot support in depth</strong></summary>

Cavaleiro Agent Harness supports **GitHub Copilot** on two surfaces: Copilot Chat in VS Code, via its native instruction and prompt file system, and **GitHub Copilot CLI**, which discovers the shared skills already present in this repository. The optional `copilot` install target places canonical skills and adapted agents in the CLI's native project directories.

#### What's included for GitHub Copilot

| Component | File | Purpose |
|-----------|------|---------|
| Core instructions | `.github/copilot-instructions.md` | Always-loaded rules: coding style, security, testing, git workflow |
| VS Code settings | `.vscode/settings.json` | Per-task instruction files for code gen, test gen, and commit messages |
| Plan prompt | `.github/prompts/plan.prompt.md` | Phased implementation planning |
| TDD prompt | `.github/prompts/tdd.prompt.md` | Red-Green-Improve cycle |
| Security review prompt | `.github/prompts/security-review.prompt.md` | Deep OWASP-aligned security analysis |
| Build fix prompt | `.github/prompts/build-fix.prompt.md` | Systematic build and CI error resolution |
| Refactor prompt | `.github/prompts/refactor.prompt.md` | Dead code cleanup and simplification |

The files are already in place: open any repo that contains this project and GitHub Copilot Chat will automatically pick up `.github/copilot-instructions.md`. The committed `.vscode/settings.json` enables `chat.promptFiles` so VS Code can load the reusable prompts from `.github/prompts/`.

To use the workflow prompts in Copilot Chat:
1. Open the Copilot Chat panel in VS Code.
2. Click the **paperclip / attach** icon and select **Prompt...**, or type `/` and choose a prompt.
3. Select the prompt (e.g. `plan`, `tdd`, `security-review`).

#### Copilot CLI: skills and agents

GitHub Copilot CLI discovers `SKILL.md` skills from `.github/skills/`,
`.agents/skills/`, `.claude/skills/`, `~/.copilot/skills/`, and
`~/.agents/skills/`, and custom agents from `.github/agents/`. Cavaleiro Agent Harness's skill and
skill frontmatter is compatible. The managed `copilot` target adapts agent
frontmatter to `name` and `description`, removing Claude-specific model and
tool keys. Raw manual agent copies can retain unsupported metadata.

Because Cavaleiro Agent Harness ships a skill subset in `.agents/skills/`, a plain clone of this
repository is picked up by Copilot CLI with no configuration at all:

```bash
git clone https://github.com/cavaleiro-ai/cavaleiro-agent-harness.git && cd cavaleiro-agent-harness
copilot skill list
# The inventory depends on the checkout and CLI version.
```

In the contributor's September 2026 checkout, Copilot CLI 1.0.83 reported all 42 under `Project skills` with `source:
"project"` and `enabled: true`. The three from `.claude/commands/` are Claude
command files that Copilot surfaces as skills; they are reported with `path`
set to the `.claude/commands` directory rather than to a per-skill subdirectory.

To check this with a temporary npm-distributed CLI, run the pinned build
against a throwaway clone:

```bash
git clone --depth 1 https://github.com/cavaleiro-ai/cavaleiro-agent-harness.git && cd cavaleiro-agent-harness
npx -y @github/copilot@1.0.82 skill list --json | jq '[.[] | select(.source=="project")] | length'
# Count the current inventory rather than assuming a fixed total.
```

That checkout's 39 + 3 split was reported by 1.0.82 from npm and by 1.0.83 installed
locally, so the behaviour is not specific to one build or install method.

To expose the full catalog, place `skills/` where Copilot CLI looks:

```bash
mkdir -p .github/skills
cp -r skills/. .github/skills/
copilot skill list --json > copilot-skills.json
jq '[.[] | select(.path | contains(".github/skills"))] | length' copilot-skills.json
# Compare with the current canonical skill catalog.
```

Filter on the path rather than on `source`: the CLI can also discover skills
from other project locations and de-duplicates entries with the same skill
name. Counts depend on the checkout and CLI version. The file redirection also
avoids truncated large JSON output observed with Copilot CLI 1.0.82 on macOS.

Copilot registers a skill under the `name` in its `SKILL.md` frontmatter, not
its directory name, so catalog folders whose names differ from their frontmatter
(for example `scientific-db-pubmed-database`, which declares
`name: pubmed-database`) still load — they are just listed under the frontmatter
name.

Agents work the same way:

```bash
./install.sh --profile full --target copilot
copilot --agent architect -p "Review this module's boundaries"
```

The contributor verified native discovery with Copilot CLI 1.0.83. Manually
copied agent files that declare a Claude model
name (`model: opus`, `model: sonnet`) emit a warning and fall back to the
session's default model, so remove or remap `model:` if you want to pin one.

#### Installing with the `copilot` target

The steps above copy files by hand. The `copilot` install target does the same
placement and additionally rewrites agent frontmatter so no warning is emitted:

```bash
./install.sh --profile full --target copilot
# Windows: ./install.ps1 --profile full --target copilot
```

That writes skills to `.github/skills/`, agents to `.github/agents/`, and an
install-state file to `.github/ecc-install-state.json`. Nothing is written
outside `.github/`.

The `full` profile selects the modules declared for Copilot. It can place fewer
skills than a manual copy of the entire canonical catalog because modules
that require another host's runtime are excluded. List the resulting native
inventory to see what this checkout installs; a count is not a capability grant.

Claude-only agent frontmatter (`model`, `tools`, `color`) is dropped during the
copy: Copilot resolves the model from your own configuration, and it governs
tool access per session through `--allow-tool`/`--deny-tool` rather than through
agent frontmatter. Cavaleiro Agent Harness's rules, commands, and hooks are not installed by this
target.

#### Feature coverage

| Cavaleiro Agent Harness Feature | Copilot equivalent |
|-------------|-------------------|
| Coding standards | Always-on via `copilot-instructions.md` |
| Security checklist | Always-on + `security-review` prompt |
| Testing / TDD | Always-on + `tdd` prompt |
| Implementation planning | `plan` prompt |
| Code review | External PR review via CodeRabbit + Greptile |
| Build error resolution | `build-fix` prompt |
| Refactoring | `refactor` prompt |
| Commit message format | Per-task instruction in `settings.json` |
| Skills | Native discovery in Copilot CLI (`.github/skills/`, `.agents/skills/`) |
| Agents / delegation | Copilot CLI custom agents (`.github/agents/`, `--agent`) |
| Hooks / automation | Cavaleiro Agent Harness's hooks are not ported (Copilot CLI has its own plugin hook system) |

#### Limitations

Cavaleiro Agent Harness's hook automations (auto-format, TypeScript check, session persistence,
dev-server guard) are written against Claude Code's hook event model and are
not ported to Copilot. Copilot CLI does expose a hook system through its plugin
format, but Cavaleiro Agent Harness does not currently ship a Copilot plugin, so none of Cavaleiro Agent Harness's hooks
run there.

Cavaleiro Agent Harness also does not install rules, commands, or hooks for Copilot. The `copilot`
target installs skills and agents only. Skills that shell out to bundled
scripts assume the same interpreters as on Claude Code. Copilot Chat in VS Code
does not read `.github/skills/` or `.github/agents/`; those paths are Copilot
CLI surfaces. The instruction and prompt layer is what carries Cavaleiro Agent Harness's coding
philosophy into Copilot Chat sessions.
</details>

<details>
<summary><strong>What changed in v2.0.0</strong></summary>

Cavaleiro Agent Harness v2.0.0 stabilizes the 2.0 line with the public Hermes operator story, 281 skills, 67 agents, 94 command shims, session adapters, MCP inventory, worktree lifecycle services, and orchestrator workflows.

- [v2.0.0 release notes](docs/releases/2.0.0/release-notes.md)
- [Cavaleiro Agent Harness 2.0 reference architecture](docs/ECC-2.0-REFERENCE-ARCHITECTURE.md)
- [Hermes setup guide](docs/HERMES-SETUP.md)
- [Migration guide from 1.x](docs/MIGRATION-1X-TO-2.0.md)
</details>
</details>

## Token Optimization

Agent usage can be expensive if you don't manage token consumption. These settings significantly reduce costs without sacrificing quality. Full guide: [docs/token-optimization.md](docs/token-optimization.md).

<details>
<summary><strong>Recommended settings</strong></summary>

Add to `~/.claude/settings.json`:

```json
{
  "model": "sonnet",
  "env": {
    "CLAUDE_CODE_EFFORT_LEVEL": "medium",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50",
    "CLAUDE_CODE_SUBAGENT_MODEL": "haiku"
  }
}
```

The effort setting requires a model that supports effort controls. On Amazon Bedrock,
Google Cloud's Agent Platform, and Microsoft Foundry, the `sonnet` alias currently
resolves to Sonnet 4.5, which does not support effort controls. Select an effort-capable
model available from your provider, or omit `CLAUDE_CODE_EFFORT_LEVEL`.

| Setting | Default | Recommended | Impact |
|---------|---------|-------------|--------|
| `model` | opus | **sonnet** | ~60% cost reduction; handles 80%+ of coding tasks |
| `CLAUDE_CODE_EFFORT_LEVEL` | Model-dependent | **medium**, if supported | Controls adaptive reasoning depth on models that support effort controls; lower effort trades reasoning depth for latency and cost |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 95 | **50** | Compacts earlier, better quality in long sessions |
| `ECC_CONTEXT_MONITOR_COST_WARNINGS` | on | **off for subscription users** | Suppresses agent-facing API-rate estimate warnings while keeping context/scope/loop warnings |

For fixed-budget models, `MAX_THINKING_TOKENS` controls the thinking budget. On Opus 4.6 or Sonnet 4.6, also set `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1` to use that mode. A positive token value does not cap adaptive reasoning; see the [performance rule](rules/common/performance.md#extended-thinking--plan-mode).

Switch to Opus only when you need deep architectural reasoning:
```
/model opus
```
</details>

<details>
<summary><strong>Daily workflow commands</strong></summary>

| Command | When to Use |
|---------|-------------|
| `/model sonnet` | Default for most tasks |
| `/model opus` | Complex architecture, debugging, deep reasoning |
| `/clear` | Between unrelated tasks (free, instant reset) |
| `/compact` | At logical task breakpoints (research done, milestone complete) |
| `/cost` | Monitor token spending during session |

If you use a subscription and the context monitor's API-rate estimates are not useful, set `ECC_CONTEXT_MONITOR_COST_WARNINGS=off`. This only suppresses the agent-facing cost warnings; it does not disable context exhaustion, scope, or loop warnings.
</details>

<details>
<summary><strong>Strategic compaction</strong></summary>

The `strategic-compact` skill suggests `/compact` at logical breakpoints instead of relying on auto-compaction at 95% context. See `skills/strategic-compact/SKILL.md` for the full decision guide.

**When to compact:**
- After research/exploration, before implementation
- After completing a milestone, before starting the next
- After debugging, before continuing feature work
- After a failed approach, before trying a new one

**When NOT to compact:**
- Mid-implementation (you'll lose variable names, file paths, partial state)
</details>

<details>
<summary><strong>Context window management</strong></summary>

**Critical:** Don't enable all MCPs at once. Each MCP tool description consumes tokens from your 200k window, potentially reducing it to ~70k.

- Keep under 10 MCPs enabled per project
- Keep under 80 tools active
- Use `/mcp` to disable unused Claude Code MCP servers; those runtime choices persist in `~/.claude.json`
- Use `ECC_DISABLED_MCPS` only to filter harness-generated MCP configs during install/sync flows
- If context is getting heavy, run `/context-budget` and remove rules you do not need

**Agent teams cost warning:** Agent Teams spawns multiple context windows. Each teammate consumes tokens independently. Only use for tasks where parallelism provides clear value (multi-module work, parallel reviews). For simple sequential tasks, subagents are more token-efficient.
</details>

## Requirements

<details>
<summary><strong>Claude Code CLI version + hooks auto-loading behavior</strong></summary>

### Claude Code CLI version

**Minimum version: v2.1.0 or later.** The plugin requires Claude Code CLI v2.1.0+ due to changes in how the plugin system handles hooks.

Check your version:
```bash
claude --version
```

### Important: hooks auto-loading behavior

> WARNING: **For Contributors:** Do NOT add a `"hooks"` field to `.claude-plugin/plugin.json`. This is enforced by a regression test.

Claude Code v2.1+ **automatically loads** `hooks/hooks.json` from any installed plugin by convention. Explicitly declaring it in `plugin.json` causes a duplicate detection error:

```
Duplicate hooks file detected: ./hooks/hooks.json resolves to already-loaded file
```

**History:** This caused repeated fix/revert cycles in the original project (original issues #29, #52, and #103). The behavior changed between Claude Code versions, leading to confusion. There is now a regression test to prevent this from being reintroduced.
</details>

## Security

Cavaleiro Agent Harness is distributed only as source from <https://github.com/cavaleiro-ai/cavaleiro-agent-harness>; it publishes no npm packages, apps, or images. The npm packages [`ecc-universal`](https://www.npmjs.com/package/ecc-universal) and [`ecc-agentshield`](https://www.npmjs.com/package/ecc-agentshield) are published by the original project (see [Compatibility](#compatibility)). Treat any other package or mirror claiming the Cavaleiro Agent Harness name as unofficial until verified.

Scan a project with an already installed, reviewed AgentShield binary (see [runner provenance](#agentshield-runner-provenance)):

```bash
agentshield scan --path .
```

- **Report a vulnerability.** Use the private process in [SECURITY.md](SECURITY.md) (GitHub private vulnerability reporting). Please do not open public issues for security reports.
- **Built-in guardrails.** GateGuard gates destructive shell commands (including `rm`, force/path `git checkout`, and destructive `find -exec`) before they run; the supply-chain IOC scanner runs in CI; and AgentShield audits your own agent, hook, MCP, permission, and secret surfaces (`/security-scan`).

<details>
<summary><strong>Hooks, MCP servers, and context controls</strong></summary>

Hooks can run shell commands, MCP servers can hold credentials, and project instructions can enter an agent's context. Treat all three as executable configuration.

Do not copy raw `hooks/hooks.json` into `~/.claude/settings.json` after a plugin install. Modern Claude Code versions load plugin hooks automatically, and a second copy can make them fire twice.

Use `/mcp` for Claude Code runtime disables; Claude Code persists those choices in `~/.claude.json`.

`ECC_DISABLED_MCPS` is an ECC install/sync filter, not a live Claude Code toggle.

If context is getting heavy, run `/context-budget`, remove rules you do not need, and disable unused MCP servers. See the [token optimization guide](docs/token-optimization.md).
</details>

Security references:

- [Security policy](SECURITY.md)
- [Security guide](./the-security-guide.md)
- [MCP connector policy](docs/MCP-CONNECTOR-POLICY.md)
- [Supply-chain incident response](docs/security/supply-chain-incident-response.md)

## Ecosystem Tools

<details>
<summary><strong>Skill Creator: generate skills from your git history</strong></summary>

Use the `/skill-create` command to generate skills from your repository with local analysis, without external services:

```bash
/skill-create                    # Analyze current repo
/skill-create --instincts        # Also generate instincts for continuous-learning-v2
```

This analyzes your git history locally and creates:
- **SKILL.md files**: Ready-to-use skills for the active harness
- **Instinct collections**: For continuous-learning-v2
- **Pattern extraction**: Learns from your commit history
</details>

<details>
<summary><strong>AgentShield: security auditor for agent configs</strong></summary>

Scan your agent configuration for vulnerabilities, misconfigurations, and injection risks.

<a id="agentshield-runner-provenance"></a>
**Runner provenance:** these commands require an already installed, reviewed AgentShield binary from `ecc-agentshield`. The [official package](https://www.npmjs.com/package/ecc-agentshield) documents the `agentshield` CLI. Record the selected release, reviewed source and verified package integrity in your installation record. Registry publication alone does not establish an audit; Cavaleiro Agent Harness does not supply an audited AgentShield pin here. Do not substitute an unversioned one-shot download. `/security-scan` is workflow guidance and has the same runner prerequisite.

```bash
# Scan only the intended project directory
agentshield scan --path .

# Auto-fix safe issues
agentshield scan --path . --fix

# Deep analysis with three Opus 4.6 agents
agentshield scan --path . --opus --stream

# Generate secure config from scratch
agentshield init
```

**What it scans:** CLAUDE.md, settings.json, MCP configs, hooks, agent definitions, and skills across 5 categories: secrets detection (14 patterns), permission auditing, hook injection analysis, MCP server risk profiling, and agent config review.

**The `--opus` flag** runs three Claude Opus 4.6 agents in a red-team/blue-team/auditor pipeline. The attacker finds exploit chains, the defender evaluates protections, and the auditor synthesizes both into a prioritized risk assessment. Adversarial reasoning, not just pattern matching.

**Output formats:** Terminal (color-graded A-F), JSON (CI pipelines), Markdown, HTML. Exit code 2 on critical findings for build gates.

Use `/security-scan` in Claude Code to run it, or add to CI with the [GitHub Action](https://github.com/affaan-m/agentshield).

[npm](https://www.npmjs.com/package/ecc-agentshield)
</details>

<details>
<summary><strong>Continuous Learning v2: instincts</strong></summary>

The instinct-based learning system automatically learns your patterns:

```bash
/instinct-status        # Show learned instincts with confidence
/instinct-import <file> # Import instincts from others
/instinct-export        # Export your instincts for sharing
/evolve                 # Cluster related instincts into skills
```

See `skills/continuous-learning-v2/` for full documentation. Keep `continuous-learning/` only when you explicitly want the legacy v1 Stop-hook learned-skill flow.
</details>

## Troubleshooting

<details>
<summary><strong>Cavaleiro Agent Harness appears twice or hooks fire twice</strong></summary>

The usual cause is installing the Claude plugin and then running `./install.sh --profile full` on top of it.

1. Remove the Claude Code plugin install.
2. Run `node scripts/ecc.js uninstall --dry-run` from the Cavaleiro Agent Harness checkout.
3. Remove extra rule folders you manually copied and no longer want.
4. Reinstall once, using one path.

For hook-specific checks, see the [hooks README](hooks/README.md).
</details>

<details>
<summary><strong>My hooks aren't working / "Duplicate hooks file" errors</strong></summary>

**Do NOT add a `"hooks"` field to `.claude-plugin/plugin.json`.** Claude Code v2.1+ automatically loads `hooks/hooks.json` from installed plugins. Explicitly declaring it causes duplicate detection errors (original issues #29, #52, and #103).
</details>

<details>
<summary><strong>Codex marketplace installs but skills do not load</strong></summary>

Run the cache check from a Cavaleiro Agent Harness checkout:

```bash
node scripts/codex/check-plugin-cache.js
```

If it reports unresolved parent references, refresh the native cache with `codex plugin marketplace upgrade ecc`, run `codex plugin add ecc@ecc` again, and restart Codex. Registration in `codex plugin list` confirms the marketplace entry, while the cache check verifies that the installed manifest can resolve its skills, MCP configuration, and assets. Use `bash scripts/sync-ecc-to-codex.sh` only when you intentionally need the legacy copied-configuration compatibility path.
</details>

More answers: [TROUBLESHOOTING.md](TROUBLESHOOTING.md) covers memory, hooks, installation, performance, and common error messages. [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) tracks workarounds for open Claude Code bugs.

## Running Tests

The plugin includes a comprehensive test suite:

```bash
# Run all tests
node tests/run-all.js

# Run individual test files
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

## Community and Project

- **Questions and bugs:** [GitHub issues](https://github.com/cavaleiro-ai/cavaleiro-agent-harness/issues)
- **Discussions:** [GitHub Discussions](https://github.com/cavaleiro-ai/cavaleiro-agent-harness/discussions)
- **Security reports:** [private vulnerability reporting](https://github.com/cavaleiro-ai/cavaleiro-agent-harness/security/advisories/new)
- **Cavaleiro AI:** <https://github.com/cavaleiro-ai>

<details>
<summary><strong>Contributing</strong></summary>

Contributions are welcome across skills, agents, rules, hooks, docs, tests, adapters, and security improvements.

- [Contributing guide](CONTRIBUTING.md)
- [Skill development guide](docs/SKILL-DEVELOPMENT-GUIDE.md)
- [Skill placement policy](docs/SKILL-PLACEMENT-POLICY.md)
- [Command quick reference](COMMANDS-QUICK-REF.md)

The short version:
1. Fork the repo
2. Create your skill in `skills/your-skill-name/SKILL.md` (with YAML frontmatter)
3. Or create an agent in `agents/your-agent.md`
4. Submit a PR with a clear description of what it does and when to use it

**Ideas for contributions:**

- Language-specific skills (Rust, C#, Kotlin, Java): Go, Python, Perl, Swift, TypeScript, and HarmonyOS/ArkTS already included
- Framework-specific configs (Rails, FastAPI): Django, NestJS, Spring Boot, and Laravel already included
- DevOps agents (Kubernetes, Terraform, AWS, Docker)
- Testing strategies (different frameworks, visual regression)
- Domain-specific knowledge (ML, data engineering, mobile)
</details>

## License

Based on ECC · MIT License · see [LICENSE](LICENSE). Not affiliated with the original project.
