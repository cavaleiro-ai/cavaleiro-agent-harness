# Security Policy

Cavaleiro Agent Harness ships installers, hooks that run on every agent tool call, sync scripts that rewrite agent configuration in your home directory, and skills and rules that agents follow with terminal access. A flaw here can run code or weaken guardrails on many machines, so security reports are taken seriously.

## Supported Versions

| Version | Supported |
| --- | --- |
| Cavaleiro Agent Harness 1.0.x | :white_check_mark: |
| `main` | :white_check_mark: |
| Older snapshots | :x: |

Security fixes land on `main` first.

## Reporting a Vulnerability

**Please do not open a public issue.** Report privately through GitHub private vulnerability reporting:

- <https://github.com/cavaleiro-ai/cavaleiro-agent-harness/security/advisories/new>

Include:

- affected file and line, harness (Claude Code, Codex, Cursor, ...), OS, Node.js version, and commit or release
- steps to reproduce from a clean checkout, ideally with a temporary `HOME`/`USERPROFILE`/`CODEX_HOME`
- expected impact and the trust boundary that is crossed
- whether exploitation requires local shell access, a malicious repository, a malicious package, a remote unauthenticated actor, or maintainer credentials
- any proof-of-concept logs with tokens, keys, local paths, and private data redacted

This is a community-maintained project, so timelines are best effort:

- **Acknowledgment:** within 7 days
- **Initial assessment:** within 14 days
- **Fix:** in `main`, with a published advisory crediting you (unless you prefer to stay anonymous) once the issue is resolved

If a report is declined, we will explain whether it is not reproducible, out of scope, already fixed, or needs a stronger attack path.

### Packages this project does not publish

The `ecc-universal` and `ecc-agentshield` npm packages, the ECC Tools GitHub App, and AgentShield are maintained by the original project, not by Cavaleiro AI. If a vulnerability also affects them, report it to their maintainers as well, through their own security policy.

## Scope

In scope:

- the `cavaleiro-ai/cavaleiro-agent-harness` repository
- installer, uninstall, repair, doctor, and sync scripts (`install.sh`, `install.ps1`, `scripts/install-*.js`, `scripts/sync-ecc-to-codex.sh`, `scripts/codex/`)
- hooks (`hooks/`, `scripts/hooks/`), including a guard that can be bypassed (for example `block-no-verify` or `config-protection`) or an advisory hook that can block or run unintended commands
- skills, rules, agents, and commands that could lead an agent to leak secrets, run destructive commands, or publish without authorization
- GitHub Actions workflows in `.github/workflows/`

Out of scope:

- vulnerabilities in third-party tools and MCP servers that the harness references; report those to their maintainers
- local command execution where the user already controls the local shell and no higher-privilege trust boundary is crossed
- reports that do not reproduce on current `main`
- packages, plugins, or mirrors not published from this repository

Local developer tools can still be valid security issues when untrusted repository content, package installation, generated hooks, or CI automation can trigger execution without clear user intent. Show that trust boundary in the report.

## Distribution

Cavaleiro Agent Harness is distributed **as source from this repository**. It does not publish npm packages, plugins to a hosted marketplace, or Docker images. The package name in `package.json` is still `ecc-universal` for compatibility, but `npx ecc-universal`, `npm install ecc-universal`, and the ECC Tools GitHub App install **the original project**, not this repository. See the [Compatibility](README.md#compatibility) section of the README.

## Supply-Chain Rules

- GitHub Actions use pinned commit SHAs for third-party actions.
- Workflows avoid shelling untrusted GitHub context directly into `run:` blocks (`node scripts/ci/validate-workflow-security.js`).
- Workflows that publish, sign, or need non-`GITHUB_TOKEN` secrets are disabled; see [.github/workflows-disabled/README.md](.github/workflows-disabled/README.md).
- Dependencies install with `--ignore-scripts` in CI and in `install.sh`/`install.ps1`.
- Private vulnerability reports are triaged privately before public disclosure.

## Operational Guidance

### Secrets Handling

`mcp-configs/mcp-servers.json` is a **template**. All `YOUR_*_HERE` values must be replaced at install time from environment variables or a secrets manager. Never commit real credentials. If a secret is accidentally committed, rotate it immediately and rewrite history. Do not rely on a plain revert.

The same rule applies to user-scope Claude Code config (`~/.claude/settings.json` or `%USERPROFILE%\.claude\settings.json`). That file is outside this repository, but it is commonly shared through `claude doctor` output, screenshots, and bug reports. Do not hardcode PATs, API keys, or OAuth tokens into `mcpServers[*].env` blocks. Resolve them at spawn time from the OS keychain or environment variables your MCP server already supports.

Quick audit:

```bash
# macOS / Linux
grep -EnH '(TOKEN|SECRET|KEY|PASSWORD)\s*"\s*:\s*"[A-Za-z0-9_-]{16,}"' ~/.claude/settings.json

# Windows PowerShell
Select-String -Path "$env:USERPROFILE\.claude\settings.json" -Pattern '(TOKEN|SECRET|KEY|PASSWORD)"\s*:\s*"[A-Za-z0-9_-]{16,}"'
```

If the audit matches, rotate the secret at the issuing provider, then move it out of the file.

### Local MCP Ports

Some bundled MCP servers connect over plain HTTP to a localhost port. Before first use, verify the listening process:

```bash
# Windows
netstat -ano | findstr :18801

# macOS / Linux
lsof -iTCP:18801 -sTCP:LISTEN
```

Compare the PID against the expected binary. Any other process on that port can intercept MCP traffic.

## Triage: suspicious `<system-reminder>` blocks

The harness runs inside agent clients that may inject ephemeral client-side system reminders into the model input on every turn. These blocks are not automatically repository-carried payloads.

Before treating one as an attack, verify:

1. Is the block actually in a file under this repo?

   ```bash
   grep -rEn "system-reminder|NEVER mention|DO NOT mention" .
   ```

2. Is the block stored in the session transcript as part of a tool result?
3. Is it consistent with known client reminders such as TodoWrite nudges, date notices, or file-modified notices?

Escalate only when the block is present inside a tool result or repository file and is not attributable to the file, URL, or command that was actually read.

## Security Resources

- **Security Guide:** [The Shorthand Guide to Everything Agentic Security](./the-security-guide.md)
- **Supply-chain incident response:** [npm/GitHub Actions package-registry playbook](./docs/security/supply-chain-incident-response.md)
- **OWASP MCP Top 10:** <https://owasp.org/www-project-mcp-top-10/>
- **OWASP Agentic Applications Top 10:** <https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/>
