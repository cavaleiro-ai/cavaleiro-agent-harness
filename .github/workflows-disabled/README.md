# Disabled workflows

GitHub only runs workflows from `.github/workflows/`. The files in this folder are the original project's workflows that publish, sign, announce, or moderate under the original project's identity, or that need secrets other than `GITHUB_TOKEN`. Cavaleiro Agent Harness keeps them for reference, but they do not run in this repository.

| Workflow | Why it is disabled |
|---|---|
| `release.yml` | Publishes the `ecc-universal` npm package (the original project's package name) and creates GitHub releases on tag push. |
| `reusable-release.yml` | The reusable npm publish and release job called by `release.yml`. |
| `generator-generic-ossf-slsa3-publish.yml` | Signs release artifacts and uploads SLSA provenance (`id-token: write`, `contents: write`). |
| `release-announce.yml` | Posts releases to Discord and GitHub Discussions; needs the `DISCORD_ANNOUNCE_WEBHOOK_URL` secret. |
| `discussion-announce.yml` | Cross-posts Discussions to Discord; needs the `DISCORD_ANNOUNCE_WEBHOOK_URL` secret. |
| `pr-burst-guard.yml` | PR moderation; needs the `PR_MODERATION_BLOCK_TOKEN` secret and uses `.github/pr-burst-policy.json`. |
| `monthly-metrics.yml` | Opens monthly issues with npm download and GitHub App install metrics of the original project (`issues: write`). |
| `maintenance.yml` | Weekly stale-issue bot and dependency report (`issues: write`, `pull-requests: write`). |

The build, test, lint, and security workflows that need only a read-only `GITHUB_TOKEN` stay in `.github/workflows/`: `ci.yml`, `reusable-test.yml`, `reusable-validate.yml`, `supply-chain-watch.yml`, and `taste-skills.yml`.

The tests under `tests/ci/` and `tests/scripts/` still read these files from this folder, so the release pipeline keeps its regression coverage while it is switched off.

## Re-enabling a workflow

1. Decide what you will publish and under which name. Do **not** publish under `ecc-universal` or `ecc-agentshield`; those npm packages belong to the original project. Pick your own package name in `package.json` (and update `tests/ci/packed-artifact-lifecycle.js` and the release tests that pin the package name).
2. Create the secrets the workflow needs in **Settings → Secrets and variables → Actions** (for example `NPM_TOKEN`, `DISCORD_ANNOUNCE_WEBHOOK_URL`, or `PR_MODERATION_BLOCK_TOKEN`), and configure npm trusted publishing for your own package if the workflow uses OIDC.
3. For `pr-burst-guard.yml`, replace the `notify` logins and `deniedUserIDs` in `.github/pr-burst-policy.json` with your own maintainers and moderation list, and update `tests/ci/pr-burst-guard-workflow.test.js`, which asserts the notified logins.
4. Move the file back with `git mv .github/workflows-disabled/<name>.yml .github/workflows/`, and change the matching path in the tests that read it.
5. Review every `if:` guard that checks the repository name or owner, and run the workflow once through `workflow_dispatch` (where available) before relying on tag triggers.
