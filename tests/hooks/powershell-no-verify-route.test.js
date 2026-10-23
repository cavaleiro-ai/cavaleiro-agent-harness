/**
 * The PowerShell tool must not be a way around block-no-verify.
 *
 * On Windows, Claude Code runs git through its PowerShell tool. The Bash
 * dispatcher blocks `git commit --no-verify` and core.hooksPath overrides, so
 * the configured PowerShell route has to block them too, while ordinary
 * PowerShell commands keep working.
 *
 * Run with: node tests/hooks/powershell-no-verify-route.test.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..', '..');

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

function powerShellRouteCommands() {
  const hooks = JSON.parse(fs.readFileSync(path.join(root, 'hooks', 'hooks.json'), 'utf8'));
  return hooks.hooks.PreToolUse
    .filter(entry => typeof entry.matcher === 'string' && entry.matcher.split('|').includes('PowerShell'))
    .flatMap(entry => entry.hooks.map(hook => hook.command));
}

function runRoute(commands, command, stateDir) {
  const env = {
    ...process.env,
    HOME: stateDir,
    USERPROFILE: stateDir,
    CLAUDE_PLUGIN_ROOT: root,
    ECC_HOOK_PROFILE: 'standard',
    GATEGUARD_STATE_DIR: stateDir,
    CLAUDE_SESSION_ID: 'powershell-no-verify-route-test'
  };
  for (const key of ['ECC_DISABLED_HOOKS', 'ECC_GOVERNANCE_CAPTURE']) {
    delete env[key];
  }
  const payload = JSON.stringify({
    hook_event_name: 'PreToolUse',
    tool_name: 'PowerShell',
    tool_input: { command }
  });
  return commands.map(hookCommand => spawnSync(hookCommand, {
    cwd: root,
    env,
    input: payload,
    encoding: 'utf8',
    shell: true,
    timeout: 30000
  }));
}

let passed = 0;
let failed = 0;

console.log('\n=== Testing PowerShell route against git hook bypass ===\n');

const commands = powerShellRouteCommands();
const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-ps-no-verify-'));

try {
  for (const bypass of [
    'git commit --no-verify -m "wip"',
    'git push --no-verify',
    'git commit -n -m "wip"; git push origin main',
    'git -c core.hooksPath=NUL commit -m "wip"'
  ]) {
    if (test(`blocks ${bypass}`, () => {
      const results = runRoute(commands, bypass, stateDir);
      const blocked = results.find(result => result.status === 2);
      assert.ok(blocked, `expected a configured PowerShell hook to exit 2; got ${results.map(r => r.status).join(',')}`);
      assert.match(blocked.stderr, /BLOCKED: .*(--no-verify|core\.hooksPath)/);
    })) passed++; else failed++;
  }

  for (const benign of [
    'git commit -m "feat: add parser"',
    "git commit -m @'\nfeat: multi line\n\nbody\n'@",
    'Get-ChildItem -Recurse | Where-Object { $_.Length -gt 1MB }',
    "$env:NODE_ENV = 'test'; npm test"
  ]) {
    if (test(`allows ${JSON.stringify(benign)}`, () => {
      const results = runRoute(commands, benign, stateDir);
      assert.ok(results.every(result => result.status !== 2),
        `no configured hook may block it: ${results.map(r => `${r.status}:${r.stderr.trim()}`).join(' | ')}`);
    })) passed++; else failed++;
  }
} finally {
  fs.rmSync(stateDir, { recursive: true, force: true });
}

console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
