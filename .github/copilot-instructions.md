# Copilot instructions

## Repository purpose

`proof-gate-action` is a dependency-free Node GitHub Action that independently recomputes a ProofPacket HMAC-SHA256 signature and fails closed when evidence is missing, malformed, or tampered with.

## Work map

- `verify.js`: verifier runtime.
- `action.yml`: action interface and inputs.
- `test/`: Node contract tests and fixtures.
- `examples/`: example inputs.
- `.github/workflows/`: CI workflows.
- `graft/`: generated context; read when needed and leave unchanged.

## Commands

No dependency bootstrap is required. Use Node 20 with the checked-in files.

Test and smoke:

```bash
node --test test/verify.test.js
```

Run the verifier:

```bash
INPUT_PROOFPACKET_PATH=test/fixtures/valid.json INPUT_SECRET_KEY=demo-secret-key node verify.js
```

## Editing rules

- Keep verification independent from the packet producer.
- Preserve fail-closed behavior, the HMAC input contract, and action inputs.
- Keep fixtures free of real secrets and private data.
- Retain the dependency-free runtime unless the public contract is deliberately changed.
- Always run the smoke command before claiming done.
