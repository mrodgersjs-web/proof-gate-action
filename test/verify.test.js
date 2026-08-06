const assert = require('assert');
const path = require('path');
const { verify } = require('../verify.js');

const fixtures = path.join(__dirname, 'fixtures');
const secret = 'demo-secret-key';

function run(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (err) {
    console.error(`❌ ${name}`);
    console.error(err.message);
    process.exitCode = 1;
  }
}

run('valid packet passes', () => {
  const code = verify(path.join(fixtures, 'valid.json'), secret, true, true);
  assert.strictEqual(code, 0, 'expected exit code 0');
});

run('tampered hash fails', () => {
  assert.throws(
    () => verify(path.join(fixtures, 'tampered-hash.json'), secret, true, true),
    /PROOF GATE FAILED: forged done detected/
  );
});

run('forged signature fails', () => {
  assert.throws(
    () => verify(path.join(fixtures, 'forged-signature.json'), secret, true, true),
    /PROOF GATE FAILED: forged done detected/
  );
});

run('missing file fails when fail-on-missing=true', () => {
  assert.throws(
    () => verify(path.join(fixtures, 'does-not-exist.json'), secret, true, true),
    /PROOF GATE FAILED: proofpacket not found/
  );
});

run('missing file passes when fail-on-missing=false', () => {
  const code = verify(path.join(fixtures, 'does-not-exist.json'), secret, false, true);
  assert.strictEqual(code, 0, 'expected exit code 0');
});

run('wrong claimed_status fails', () => {
  assert.throws(
    () => verify(path.join(fixtures, 'wrong-status-valid-sig.json'), secret, true, true),
    /PROOF GATE FAILED: claimed_status is/
  );
});
