'use strict';

/**
 * String-aware structure scanner for TOML text that has already been parsed
 * successfully. The Codex merge scripts edit config.toml as text (to keep user
 * comments and layout), so they need to know where real table headers and
 * key/value lines are without mistaking the inside of a multi-line string or a
 * multi-line array for structure.
 *
 * Returns:
 *   headers: [{ start, end, path, isArray }]  start = line start, end = after the line break
 *   keys:    [{ start, end, scope, path }]     scope = enclosing header path
 */

const BARE_KEY_RE = /[A-Za-z0-9_-]/;

function skipInlineSpace(raw, i) {
  while (i < raw.length && (raw[i] === ' ' || raw[i] === '\t')) i += 1;
  return i;
}

function lineEnd(raw, i) {
  const newline = raw.indexOf('\n', i);
  return newline === -1 ? raw.length : newline + 1;
}

function readQuoted(raw, i) {
  const quote = raw[i];
  let j = i + 1;
  while (j < raw.length && raw[j] !== quote && raw[j] !== '\n') {
    if (quote === '"' && raw[j] === '\\') j += 1;
    j += 1;
  }
  const text = raw.slice(i, j + 1);
  let value;
  try {
    value = quote === '"' ? JSON.parse(text) : text.slice(1, -1);
  } catch {
    value = text.slice(1, -1);
  }
  return { value, end: j + 1 };
}

function readKeyPath(raw, i) {
  const path = [];
  for (;;) {
    i = skipInlineSpace(raw, i);
    if (raw[i] === '"' || raw[i] === '\'') {
      const quoted = readQuoted(raw, i);
      path.push(quoted.value);
      i = quoted.end;
    } else {
      const start = i;
      while (i < raw.length && BARE_KEY_RE.test(raw[i])) i += 1;
      if (i === start) return { path, end: i };
      path.push(raw.slice(start, i));
    }
    i = skipInlineSpace(raw, i);
    if (raw[i] !== '.') return { path, end: i };
    i += 1;
  }
}

function skipString(raw, i) {
  const quote = raw[i];
  if (raw.startsWith(quote.repeat(3), i)) {
    let j = i + 3;
    for (;;) {
      const close = raw.indexOf(quote.repeat(3), j);
      if (close === -1) return raw.length;
      if (quote === '"') {
        let backslashes = 0;
        for (let k = close - 1; k >= i + 3 && raw[k] === '\\'; k -= 1) backslashes += 1;
        if (backslashes % 2 === 1) {
          j = close + 1;
          continue;
        }
      }
      // A closing delimiter may be followed by up to two more quotes that
      // belong to the string content ("""a"""" is valid TOML).
      let end = close + 3;
      while (end < raw.length && raw[end] === quote && end - close < 5) end += 1;
      return end;
    }
  }
  return readQuoted(raw, i).end;
}

/** Skip a value (strings, nested arrays, inline tables, comments) to the end of its line. */
function skipValue(raw, i) {
  let depth = 0;
  while (i < raw.length) {
    const ch = raw[i];
    if (ch === '"' || ch === '\'') {
      i = skipString(raw, i);
      continue;
    }
    if (ch === '#') {
      i = raw.indexOf('\n', i);
      if (i === -1) return raw.length;
      continue;
    }
    if (ch === '[' || ch === '{') depth += 1;
    else if (ch === ']' || ch === '}') depth = Math.max(0, depth - 1);
    else if (ch === '\n' && depth === 0) return i + 1;
    i += 1;
  }
  return raw.length;
}

function scanTomlStructure(raw) {
  const headers = [];
  const keys = [];
  let scope = [];
  let i = 0;
  while (i < raw.length) {
    const start = i;
    i = skipInlineSpace(raw, i);
    const ch = raw[i];
    if (ch === '[') {
      const isArray = raw[i + 1] === '[';
      const parsed = readKeyPath(raw, i + (isArray ? 2 : 1));
      const end = lineEnd(raw, parsed.end);
      headers.push({ start, end, path: parsed.path, isArray });
      scope = parsed.path;
      i = end;
    } else if (ch === '"' || ch === '\'' || (ch !== undefined && BARE_KEY_RE.test(ch))) {
      const parsed = readKeyPath(raw, i);
      let valueStart = skipInlineSpace(raw, parsed.end);
      if (raw[valueStart] === '=') valueStart += 1;
      const end = skipValue(raw, valueStart);
      keys.push({ start, end, scope, path: parsed.path });
      i = end;
    } else {
      i = lineEnd(raw, i);
    }
  }
  return { headers, keys };
}

function samePath(a, b) {
  return a.length === b.length && a.every((part, index) => part === b[index]);
}

function startsWithPath(full, prefix) {
  return full.length >= prefix.length && prefix.every((part, index) => part === full[index]);
}

/**
 * True when some dotted key (for example `features.x = 1` at the root, or
 * `explorer.x = 1` inside `[agents]`) implicitly defines `tablePath`. TOML 1.0
 * forbids opening `[tablePath]` afterwards, even though TOML 0.5 parsers such
 * as @iarna/toml still accept it.
 */
function isTableDefinedByDottedKeys(raw, tablePath) {
  const target = Array.isArray(tablePath) ? tablePath : tablePath.split('.');
  return scanTomlStructure(raw).keys.some(key =>
    key.scope.length < target.length
    && key.path.length > 1
    && startsWithPath([...key.scope, ...key.path], target)
    && key.scope.length + key.path.length > target.length);
}

module.exports = {
  isTableDefinedByDottedKeys,
  samePath,
  scanTomlStructure,
  startsWithPath,
};
