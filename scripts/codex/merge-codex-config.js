#!/usr/bin/env node
'use strict';

/**
 * Merge the non-MCP Codex baseline from `.codex/user-config.example.toml` into a target
 * `config.toml` without overwriting existing user choices.
 *
 * Strategy: add-only.
 * - Missing root keys are inserted before the first TOML table.
 * - Missing table keys are appended to existing tables.
 * - Missing tables are appended to the end of the file.
 */

const fs = require('fs');
const path = require('path');
const { isDeepStrictEqual } = require('util');
const { isTableDefinedByDottedKeys, samePath, scanTomlStructure } = require('../lib/toml-text');

let TOML;
try {
  TOML = require('@iarna/toml');
} catch {
  console.error('[ecc-codex] Missing dependency: @iarna/toml');
  console.error('[ecc-codex] Run: npm install   (from the ECC repo root)');
  process.exit(1);
}

const ROOT_KEYS = ['approval_policy', 'sandbox_mode', 'web_search', 'notify', 'persistent_instructions'];
const TABLE_PATHS = [
  'features',
  'agents',
  'agents.explorer',
  'agents.reviewer',
  'agents.docs_researcher',
];
const UTF8_BOM = '\uFEFF';

function log(message) {
  console.log(`[ecc-codex] ${message}`);
}

function warn(message) {
  console.warn(`[ecc-codex] WARNING: ${message}`);
}

function getNested(obj, pathParts) {
  let current = obj;
  for (const part of pathParts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

function setNested(obj, pathParts, value) {
  let current = obj;
  for (let i = 0; i < pathParts.length - 1; i += 1) {
    const part = pathParts[i];
    if (!current[part] || typeof current[part] !== 'object' || Array.isArray(current[part])) {
      current[part] = {};
    }
    current = current[part];
  }
  current[pathParts[pathParts.length - 1]] = value;
}

// Headers come from a string-aware scan, so a `[Section]` line inside a
// multi-line string or array is never mistaken for a table.
function findFirstTableIndex(raw) {
  const { headers } = scanTomlStructure(raw);
  return headers.length > 0 ? headers[0].start : -1;
}

function findTableRange(raw, tablePath) {
  const { headers } = scanTomlStructure(raw);
  const pathParts = tablePath.split('.');
  const index = headers.findIndex(header => !header.isArray && samePath(header.path, pathParts));
  if (index === -1) {
    return null;
  }

  const bodyStart = headers[index].end;
  const bodyEnd = index + 1 < headers.length ? headers[index + 1].start : raw.length;
  return { bodyStart, bodyEnd };
}

/** Name of the first value from `before` that is missing or different in `after`. */
function findChangedValue(before, after, trail = []) {
  for (const [key, value] of Object.entries(before)) {
    const next = after && typeof after === 'object' ? after[key] : undefined;
    const keyPath = [...trail, key];
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      const nested = findChangedValue(value, next, keyPath);
      if (nested) return nested;
    } else if (!isDeepStrictEqual(value, next)) {
      return keyPath.join('.');
    }
  }
  return null;
}

function ensureTrailingNewline(text) {
  return text.endsWith('\n') ? text : `${text}\n`;
}

function insertBeforeFirstTable(raw, block) {
  const normalizedBlock = ensureTrailingNewline(block.trimEnd());
  const firstTableIndex = findFirstTableIndex(raw);
  if (firstTableIndex === -1) {
    const prefix = raw.trimEnd();
    return prefix ? `${prefix}\n${normalizedBlock}` : normalizedBlock;
  }

  const before = raw.slice(0, firstTableIndex).trimEnd();
  const after = raw.slice(firstTableIndex).replace(/^\n+/, '');
  return `${before}\n\n${normalizedBlock}\n${after}`;
}

function appendBlock(raw, block) {
  const prefix = raw.trimEnd();
  const normalizedBlock = block.trimEnd();
  return prefix ? `${prefix}\n\n${normalizedBlock}\n` : `${normalizedBlock}\n`;
}

function stringifyValue(value) {
  return TOML.stringify({ value }).trim().replace(/^value = /, '');
}

function updateInlineTableKeys(raw, tablePath, missingKeys) {
  const pathParts = tablePath.split('.');
  if (pathParts.length < 2) {
    return null;
  }

  const parentPath = pathParts.slice(0, -1).join('.');
  const parentRange = findTableRange(raw, parentPath);
  if (!parentRange) {
    return null;
  }

  const tableKey = pathParts[pathParts.length - 1];
  const escapedKey = tableKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const body = raw.slice(parentRange.bodyStart, parentRange.bodyEnd);
  const lines = body.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const inlinePattern = new RegExp(`^(\\s*${escapedKey}\\s*=\\s*\\{)(.*?)(\\}\\s*(?:#.*)?)$`);
    const match = inlinePattern.exec(lines[index]);
    if (!match) {
      continue;
    }

    const additions = Object.entries(missingKeys)
      .map(([key, value]) => `${key} = ${stringifyValue(value)}`)
      .join(', ');
    const existingEntries = match[2].trim();
    const nextEntries = existingEntries ? `${existingEntries}, ${additions}` : additions;
    lines[index] = `${match[1]}${nextEntries}${match[3]}`;
    return `${raw.slice(0, parentRange.bodyStart)}${lines.join('\n')}${raw.slice(parentRange.bodyEnd)}`;
  }
  return null;
}

function appendImplicitTable(raw, tablePath, missingKeys) {
  // @iarna/toml implements TOML 0.5 and accepts re-opening a table that dotted
  // keys created; Codex parses TOML 1.0 and rejects the whole file.
  if (isTableDefinedByDottedKeys(raw, tablePath)) {
    return null;
  }
  const candidate = appendBlock(raw, stringifyTable(tablePath, missingKeys));
  try {
    TOML.parse(candidate);
    return candidate;
  } catch {
    return null;
  }
}

function appendToTable(raw, tablePath, block, missingKeys = null) {
  const range = findTableRange(raw, tablePath);
  if (!range) {
    if (missingKeys) {
      const inlineUpdated = updateInlineTableKeys(raw, tablePath, missingKeys);
      if (inlineUpdated) {
        return inlineUpdated;
      }

      const appendedTable = appendImplicitTable(raw, tablePath, missingKeys);
      if (appendedTable) {
        return appendedTable;
      }
    }
    warn(`Skipping missing keys for [${tablePath}] because it has no standalone header and could not be safely updated`);
    return raw;
  }

  const before = raw.slice(0, range.bodyEnd).trimEnd();
  const after = raw.slice(range.bodyEnd).replace(/^\n*/, '\n');
  return `${before}\n${block.trimEnd()}\n${after}`;
}

function stringifyRootKeys(keys) {
  return TOML.stringify(keys).trim();
}

function stringifyTable(tablePath, value) {
  const scalarOnly = {};
  for (const [key, entryValue] of Object.entries(value)) {
    if (entryValue && typeof entryValue === 'object' && !Array.isArray(entryValue)) {
      continue;
    }
    scalarOnly[key] = entryValue;
  }

  const snippet = {};
  setNested(snippet, tablePath.split('.'), scalarOnly);
  return TOML.stringify(snippet).trim();
}

function stringifyTableKeys(tableValue) {
  const lines = [];
  for (const [key, value] of Object.entries(tableValue)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      continue;
    }
    lines.push(TOML.stringify({ [key]: value }).trim());
  }
  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const configPath = args.find(arg => !arg.startsWith('-'));
  const dryRun = args.includes('--dry-run');

  if (!configPath) {
    console.error('Usage: merge-codex-config.js <config.toml> [--dry-run]');
    process.exit(1);
  }

  const referencePath = path.join(__dirname, '..', '..', '.codex', 'user-config.example.toml');
  if (!fs.existsSync(referencePath)) {
    console.error(`[ecc-codex] Reference config not found: ${referencePath}`);
    process.exit(1);
  }

  if (!fs.existsSync(configPath)) {
    console.error(`[ecc-codex] Config file not found: ${configPath}`);
    process.exit(1);
  }

  // Windows PowerShell 5.1 writes UTF-8 with a BOM; parse without it and put it back on write.
  const fileRaw = fs.readFileSync(configPath, 'utf8');
  const bom = fileRaw.startsWith(UTF8_BOM) ? UTF8_BOM : '';
  const raw = fileRaw.slice(bom.length);
  const referenceRaw = fs.readFileSync(referencePath, 'utf8');

  let targetConfig;
  let referenceConfig;
  try {
    targetConfig = TOML.parse(raw);
    referenceConfig = TOML.parse(referenceRaw);
  } catch (error) {
    console.error(`[ecc-codex] Failed to parse TOML: ${error.message}`);
    process.exit(1);
  }

  const missingRootKeys = {};
  for (const key of ROOT_KEYS) {
    if (referenceConfig[key] !== undefined && targetConfig[key] === undefined) {
      missingRootKeys[key] = referenceConfig[key];
    }
  }

  const missingTables = [];
  const missingTableKeys = [];
  for (const tablePath of TABLE_PATHS) {
    const pathParts = tablePath.split('.');
    const referenceValue = getNested(referenceConfig, pathParts);
    if (referenceValue === undefined) {
      continue;
    }

    const targetValue = getNested(targetConfig, pathParts);
    if (targetValue === undefined) {
      missingTables.push(tablePath);
      continue;
    }

    const missingKeys = {};
    for (const [key, value] of Object.entries(referenceValue)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        continue;
      }
      if (targetValue[key] === undefined) {
        missingKeys[key] = value;
      }
    }

    if (Object.keys(missingKeys).length > 0) {
      missingTableKeys.push({ tablePath, missingKeys });
    }
  }

  if (
    Object.keys(missingRootKeys).length === 0 &&
    missingTables.length === 0 &&
    missingTableKeys.length === 0
  ) {
    log('All baseline Codex settings already present. Nothing to do.');
    return;
  }

  let nextRaw = raw;
  if (Object.keys(missingRootKeys).length > 0) {
    log(`  [add-root] ${Object.keys(missingRootKeys).join(', ')}`);
    nextRaw = insertBeforeFirstTable(nextRaw, stringifyRootKeys(missingRootKeys));
  }

  for (const { tablePath, missingKeys } of missingTableKeys) {
    log(`  [add-keys] [${tablePath}] -> ${Object.keys(missingKeys).join(', ')}`);
    nextRaw = appendToTable(nextRaw, tablePath, stringifyTableKeys(missingKeys), missingKeys);
  }

  for (const tablePath of missingTables) {
    // A parent written as an inline table (`agents = { ... }`) cannot be
    // extended with a [parent.child] header; skip instead of breaking the file.
    const candidate = appendBlock(nextRaw, stringifyTable(tablePath, getNested(referenceConfig, tablePath.split('.'))));
    try {
      TOML.parse(candidate);
    } catch {
      warn(`Skipping missing table [${tablePath}] because its parent is an inline table that cannot be extended`);
      continue;
    }
    log(`  [add-table] [${tablePath}]`);
    nextRaw = candidate;
  }

  // Add-only contract: the result must parse and keep every existing value.
  let mergedConfig;
  try {
    mergedConfig = TOML.parse(nextRaw);
  } catch (error) {
    console.error(`[ecc-codex] Refusing to write ${configPath}: merged TOML does not parse (${error.message})`);
    process.exit(1);
  }
  const changedValue = findChangedValue(targetConfig, mergedConfig);
  if (changedValue) {
    console.error(`[ecc-codex] Refusing to write ${configPath}: merge would change existing value "${changedValue}"`);
    process.exit(1);
  }

  if (dryRun) {
    log('Dry run — would write the merged Codex baseline.');
    return;
  }

  fs.writeFileSync(configPath, bom + nextRaw, 'utf8');
  log('Done. Baseline Codex settings merged.');
}

main();
