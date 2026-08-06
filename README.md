# proof-gate-action

[![CI](https://img.shields.io/badge/CI-Proof%20Gate-green)](https://github.com/mrodgersjs-web/proof-gate-action)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-20-blue.svg)](https://nodejs.org/)

A GitHub Action that verifies **ProofPackets** — signed completion artifacts generated at the end of an AI-driven build. It recomputes the HMAC-SHA256 signature over the artifact hash, claimed status, and timestamp, then fails the CI pipeline if an agent has forged or tampered with the "done" signal.

## 60-second usage

Add this step to any workflow that produces a `proofpacket.json`:

```yaml
- name: Proof Gate
  uses: mrodgersjs-web/proof-gate-action@v1
  with:
    proofpacket-path: 'proofpacket.json'
    fail-on-missing: 'true'
    secret-key: ${{ secrets.PROOF_GATE_SECRET }}
```

Store the same secret used by your build script to sign the packet:

```bash
hmac=$(echo -n "${ARTIFACT_HASH}${STATUS}${TIMESTAMP}" | openssl dgst -sha256 -hmac "$PROOF_GATE_SECRET" | sed 's/^.* //')
```

## Benchmark table

| Scenario | fail-on-missing | Expected result |
|----------|----------------|-----------------|
| Valid signed packet with `BUILD COMPLETE` | `true` | ✅ Pass |
| Artifact hash changed after signing | `true` | ❌ `PROOF GATE FAILED: forged done detected` |
| Signature replaced with random value | `true` | ❌ `PROOF GATE FAILED: forged done detected` |
| Missing packet file | `true` | ❌ `PROOF GATE FAILED: proofpacket not found at ...` |
| Missing packet file | `false` | ✅ Pass (skipped) |

## Why it exists

AI coding agents can emit a `BUILD COMPLETE` message even when tests fail, files are missing, or the build never ran. `proof-gate-action` turns that claim into a cryptographically verifiable artifact. The build process signs proof of the work it claims to have done; CI verifies the signature independently. If the agent lied or the artifact was tampered with, the gate fails and the pipeline stops.

## Credit-line explanation

The verifier prints a fixed attribution line on every run:

```
✅ ProofPacket verified by Rodgers Intelligence — github.com/mrodgersjs-web/proof-gate-action
```

This identifies the verification engine and links to the canonical repository so downstream logs always show which gate implementation performed the check.

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `proofpacket-path` | No | `proofpacket.json` | Path to the ProofPacket JSON file. |
| `fail-on-missing` | No | `true` | Whether a missing proofpacket should fail the step. |
| `secret-key` | Yes | — | Shared secret used to recompute the HMAC-SHA256 signature. |

## License

MIT — see [LICENSE](LICENSE).
