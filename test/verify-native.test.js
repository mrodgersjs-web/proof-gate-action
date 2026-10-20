'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const { verify } = require('../verify.js');

const FIXTURES = path.join(__dirname, 'fixtures');
const SECRET = 'demo-secret-key';

function packet(overrides = {}) {
  const base = {
    artifact_hash: 'abc123def456',
    claimed_status: 'BUILD COMPLETE',
    timestamp: '2026-08-05T00:00:00Z',
  };
  const merged = { ...base, ...overrides };
  const payload = `${merged.artifact_hash}${merged.claimed_status}${merged.timestamp}`;
  if (!merged.signature) {
    merged.signature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  }
  return merged;
}

test('valid packet returns exit code 0', () => {
  const code = verify(path.join(FIXTURES, 'valid.json'), SECRET, true, true);
  assert.equal(code, 0);
});

test('valid packet with extra fields passes', () => {
  const tmp = path.join(FIXTURES, '.tmp-extra.json');
  const p = packet();
  p.extra_field = 'forward-compat';
  fs.writeFileSync(tmp, JSON.stringify(p));
  try {
    assert.equal(verify(tmp, SECRET, true, true), 0);
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) {}
  }
});

test('tampered hash fails with forged-done message', () => {
  assert.throws(
    () => verify(path.join(FIXTURES, 'tampered-hash.json'), SECRET, true, true),
    /PROOF GATE FAILED: forged done detected/,
  );
});

test('forged signature fails with forged-done message', () => {
  assert.throws(
    () => verify(path.join(FIXTURES, 'forged-signature.json'), SECRET, true, true),
    /PROOF GATE FAILED: forged done detected/,
  );
});

test('wrong claimed_status fails with valid signature', () => {
  assert.throws(
    () => verify(path.join(FIXTURES, 'wrong-status-valid-sig.json'), SECRET, true, true),
    /PROOF GATE FAILED: claimed_status is/,
  );
});

test('missing file fails when fail-on-missing=true', () => {
  assert.throws(
    () => verify(path.join(FIXTURES, 'does-not-exist.json'), SECRET, true, true),
    /PROOF GATE FAILED: proofpacket not found/,
  );
});

test('missing file passes when fail-on-missing=false', () => {
  assert.equal(verify(path.join(FIXTURES, 'does-not-exist.json'), SECRET, false, true), 0);
});

test('invalid JSON fails with parse error', () => {
  const tmp = path.join(FIXTURES, '.tmp-invalid.json');
  fs.writeFileSync(tmp, '{ not valid json');
  try {
    assert.throws(() => verify(tmp, SECRET, true, true), /PROOF GATE FAILED: invalid JSON/);
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) {}
  }
});

test('packet missing required field artifact_hash fails', () => {
  const tmp = path.join(FIXTURES, '.tmp-missing-hash.json');
  fs.writeFileSync(tmp, JSON.stringify({
    claimed_status: 'BUILD COMPLETE',
    signature: '00'.repeat(32),
    timestamp: '2026-08-05T00:00:00Z',
  }));
  try {
    assert.throws(() => verify(tmp, SECRET, true, true), /missing required fields/);
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) {}
  }
});

test('packet missing required field claimed_status fails', () => {
  const tmp = path.join(FIXTURES, '.tmp-missing-status.json');
  fs.writeFileSync(tmp, JSON.stringify({
    artifact_hash: 'abc',
    signature: '00'.repeat(32),
    timestamp: '2026-08-05T00:00:00Z',
  }));
  try {
    assert.throws(() => verify(tmp, SECRET, true, true), /missing required fields/);
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) {}
  }
});

test('packet missing required field signature fails', () => {
  const tmp = path.join(FIXTURES, '.tmp-missing-sig.json');
  fs.writeFileSync(tmp, JSON.stringify({
    artifact_hash: 'abc',
    claimed_status: 'BUILD COMPLETE',
    timestamp: '2026-08-05T00:00:00Z',
  }));
  try {
    assert.throws(() => verify(tmp, SECRET, true, true), /missing required fields/);
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) {}
  }
});

test('packet missing required field timestamp fails', () => {
  const tmp = path.join(FIXTURES, '.tmp-missing-ts.json');
  fs.writeFileSync(tmp, JSON.stringify({
    artifact_hash: 'abc',
    claimed_status: 'BUILD COMPLETE',
    signature: '00'.repeat(32),
  }));
  try {
    assert.throws(() => verify(tmp, SECRET, true, true), /missing required fields/);
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) {}
  }
});

test('empty secret key fails', () => {
  const tmp = path.join(FIXTURES, '.tmp-empty.json');
  fs.writeFileSync(tmp, JSON.stringify(packet()));
  try {
    assert.throws(() => verify(tmp, '', true, true), /secret-key is required/);
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) {}
  }
});

test('signed packet with rotated secret fails', () => {
  const tmp = path.join(FIXTURES, '.tmp-rotated.json');
  fs.writeFileSync(tmp, JSON.stringify(packet()));
  try {
    assert.throws(() => verify(tmp, 'wrong-secret', true, true), /forged done detected/);
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) {}
  }
});
