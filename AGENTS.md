# Agent guide

## Purpose

`proof-gate-action` is a dependency-free Node GitHub Action that independently recomputes a ProofPacket HMAC-SHA256 signature and fails closed when the packet is missing, malformed, or tampered with.

## Repository map

- `verify.js`: verifier runtime.
- `action.yml`: GitHub Action interface and inputs.
- `test/`: Node contract tests and fixtures.
- `examples/`: example ProofPackets.
- `.github/workflows/`: CI workflows.
- `graft/`: generated cross-repository context. Read it when useful and preserve it unchanged.

## Proven commands

No dependency bootstrap is required; use Node 20 with the checked-in files.

Test and smoke:

```bash
node --test test/verify.test.js
```

Run the verifier:

```bash
INPUT_PROOFPACKET_PATH=test/fixtures/valid.json INPUT_SECRET_KEY=demo-secret-key node verify.js
```

## Constraints

- Keep verification independent from the packet producer.
- Preserve fail-closed behavior and the HMAC input contract.
- Keep fixtures free of real secrets and private data.
- Keep the action dependency-free unless the repository contract is deliberately changed.
- Always run the smoke command before claiming done.
