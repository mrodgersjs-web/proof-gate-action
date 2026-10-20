# Contributing

Thanks for considering a contribution. This Action is small on purpose:
dependency-free, one file, fail-closed by default.

## Local setup

```bash
git clone https://github.com/mrodgersjs-web/proof-gate-action
cd proof-gate-action
node --test test/verify-native.test.js test/verify.test.js
```

The test suite runs on Node 20+ and has no `npm install` step. The
fixtures under `test/fixtures/` use a fixed `demo-secret-key`; never
commit a real secret.

## Making a change

1. Open an issue describing the problem and the proposed solution.
2. Add or update tests in `test/` first. The verifier is the spec.
3. Keep `verify.js` dependency-free.
4. Run `npm run all` (lint + test) before opening a PR.
5. Use a Conventional Commits subject (`feat:`, `fix:`, `test:`, `docs:`,
   `build:`, `chore:`).

## Code of conduct

See `CODE_OF_CONDUCT.md`. By participating you agree to it.
