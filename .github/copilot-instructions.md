# Copilot instructions

## What this repo is

`proof-gate-action` is a dependency-free Node 20+ GitHub Action. It recomputes an
HMAC-SHA256 signature over a ProofPacket's artifact hash, claimed status and
timestamp, and fails the CI step when the packet is missing, malformed, or
tampered with. The verifier never imports the code that produced the packet, so
a forged "done" claim cannot borrow the builder's own logic.

## Layout

- `verify.js` - verifier runtime and CLI entry point.
- `action.yml` - GitHub Action interface and its three inputs.
- `test/verify.test.js` - contract tests against the checked-in fixtures.
- `test/verify-native.test.js` - Node-only verification tests.
- `test/repo-hygiene.test.js` - repository hygiene checks (CODEOWNERS, docs, CI).
- `test/fixtures/` - sample packets: valid, forged status, tampered hash. Fake secrets only.
- `examples/basic.yml` - end-to-end workflow example for outside users.
- `docs/architecture.md` - packet shape, HMAC input contract, failure modes.
- `.github/workflows/` - `ci.yml` (test + self-test) and `smoke.yml`.

## Commands

No dependency install is required. The runtime has zero dependencies.

```bash
npm ci          # clean install (lockfile)
npm test        # full test suite, node --test
npm run lint    # node --check over every tracked JS file
npm run all     # lint then test
```

Narrow runs:

```bash
node --test test/verify.test.js
INPUT_PROOFPACKET_PATH=test/fixtures/valid.json INPUT_SECRET_KEY=demo-secret-key node verify.js
```

## Conventions

- Conventional commit messages: `feat:`, `fix:`, `test:`, `docs:`, `ci:`, `chore:`.
- Every behavior change lands with a test that exercises it and passes on a clean checkout.
- No secrets, tokens, or real customer data in code, fixtures, docs, or logs.
- No machine-specific paths such as `/Users/...` or `~/Developer/...` in tracked files.
- Keep verification independent from the packet producer, keep fail-closed behavior, and keep the runtime dependency-free unless the public contract is changed on purpose.

## Truth rule

Any number in docs, comments, or commit messages must come from a command run in this repo, for example a test count taken from `npm test`. Quote the command and its output rather than a memory of it.
