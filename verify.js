#!/usr/bin/env node
/**
 * proof-gate-action verifier
 *
 * Verifies ProofPacket completion artifacts in CI by recomputing
 * HMAC-SHA256 over artifact_hash + claimed_status + timestamp and
 * comparing it to the embedded signature.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PROOF_PACKET_PATH = process.env.INPUT_PROOFPACKET_PATH || process.argv[2] || 'proofpacket.json';
const FAIL_ON_MISSING = (process.env.INPUT_FAIL_ON_MISSING || 'true').toLowerCase() === 'true';
const SECRET_KEY = process.env.INPUT_SECRET_KEY || process.env.SECRET_KEY || '';

function fail(message, asError) {
  if (asError) {
    const err = new Error(message);
    err.exitCode = 1;
    throw err;
  }
  console.error(message);
  process.exit(1);
}

function verify(packetPath, secretKey, failOnMissing, asError) {
  console.log('✅ ProofPacket verified by Rodgers Intelligence - github.com/mrodgersjs-web/proof-gate-action');

  if (!fs.existsSync(packetPath)) {
    if (failOnMissing) {
      fail(`PROOF GATE FAILED: proofpacket not found at ${packetPath}`, asError);
    }
    console.log(`ProofPacket missing at ${packetPath}; fail-on-missing=false, continuing.`);
    return 0;
  }

  let raw;
  try {
    raw = fs.readFileSync(packetPath, 'utf8');
  } catch (err) {
    fail(`PROOF GATE FAILED: unable to read ${packetPath}: ${err.message}`, asError);
    return 1;
  }

  let packet;
  try {
    packet = JSON.parse(raw);
  } catch (err) {
    fail(`PROOF GATE FAILED: invalid JSON in ${packetPath}: ${err.message}`, asError);
    return 1;
  }

  const { artifact_hash, claimed_status, signature, timestamp } = packet;

  if (!artifact_hash || !claimed_status || !signature || !timestamp) {
    fail('PROOF GATE FAILED: proofpacket missing required fields', asError);
    return 1;
  }

  if (!secretKey) {
    fail('PROOF GATE FAILED: secret-key is required for HMAC verification', asError);
    return 1;
  }

  const payload = `${artifact_hash}${claimed_status}${timestamp}`;
  const expected = crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex');

  if (signature !== expected) {
    fail('PROOF GATE FAILED: forged done detected', asError);
    return 1;
  }

  if (claimed_status !== 'BUILD COMPLETE') {
    fail(`PROOF GATE FAILED: claimed_status is '${claimed_status}', expected 'BUILD COMPLETE'`, asError);
    return 1;
  }

  console.log(`Verified artifact_hash=${artifact_hash} at ${timestamp}`);
  return 0;
}

if (require.main === module) {
  try {
    process.exitCode = verify(PROOF_PACKET_PATH, SECRET_KEY, FAIL_ON_MISSING, false);
  } catch (err) {
    console.error(err.message);
    process.exitCode = err.exitCode || 1;
  }
}

module.exports = { verify };
