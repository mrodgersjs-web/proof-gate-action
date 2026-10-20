# Changelog

All notable changes are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-10-19

### Added

- `test/repo-hygiene.test.js`: 4 checks read from the files on disk that
  `.github/CODEOWNERS` assigns `*` to `@mrodgersjs-web`, that
  `.github/copilot-instructions.md` is non-empty, at most 8000 bytes and names a
  test command, that the README carries a `github/actions/workflow/status` badge,
  the "Built by Mike Rodgers - rodgersintelligence.com" footer, a test command and
  only clones `mrodgersjs-web/proof-gate-action`, and that every job in every
  workflow under `.github/workflows/` sets `timeout-minutes` and never sets
  `continue-on-error: true`.
- `package-lock.json` so `npm ci` installs cleanly on a fresh checkout.

### Changed

- `.github/copilot-instructions.md` rewritten to 2262 bytes: what the repository
  is, the layout, the exact commands (`npm ci`, `npm test`, `npm run lint`),
  conventions (conventional commits, a test for every change, no secrets, no
  machine paths) and the truth rule that every number in docs comes from a
  command run in this repository.
- `.github/workflows/ci.yml` and `.github/workflows/smoke.yml`: `timeout-minutes: 15`
  on every job, and both run `test/repo-hygiene.test.js` with the rest of the suite.
  Neither workflow uses `continue-on-error`, and both still run the tests on push to
  `main`.
- `package.json`: the `test` and `lint` scripts now cover `test/repo-hygiene.test.js`.
- `README.md`: the inputs table heading is "Inputs" instead of a second
  "Documentation" heading, and the footer is the plain literal
  "Built by Mike Rodgers - rodgersintelligence.com".
- Em dashes in `verify.js`, `assets/architecture.svg`, `assets/demo.html` and
  `.gitignore` replaced with hyphens, so the credit line `verify.js` prints matches
  the line the README documents.

### Verified

- `npm ci` clean install, 0 vulnerabilities; `npm run lint` clean; `npm test` 19 pass,
  0 fail. No tags created or moved.

## [1.1.0] - 2026-10-19

### Added

- `test/verify-native.test.js`: native `node:test` suite with 14 distinct
  cases covering happy path, forward compatibility, tampering,
  every-missing-required-field, invalid JSON, empty secret, and rotated
  secret.
- `package.json` with `engines.node >=20`, `npm test`, `npm run lint`,
  `npm run test:smoke`, and `npm run all` scripts.
- `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`.
- `.github/ISSUE_TEMPLATE/{bug_report,feature_request,config}.yml`.
- `.github/PULL_REQUEST_TEMPLATE.md`.
- `.github/dependabot.yml` for npm and github-actions ecosystems.
- `.github/workflows/self-test.yml` runs the Action against the in-repo
  fixture via `uses: ./` on Node 20 and 22.
- `docs/architecture.md` with the verifier contract, packet shape, and
  HMAC input string.
- Top-of-README usage block, mermaid flow, project layout, and
  development section.

### Changed

- `README.md` rewritten for the public action style: H1, one-line value,
  badges, usage-first, mermaid diagram, project layout, development.
  Em dashes replaced with hyphens.

### Notes

- The previous `test/verify.test.js` (custom-runner variant) is kept
  alongside the new file. Both are run by `npm test`.
- The verifier contract (`verify(packetPath, secret, failOnMissing,
  asError)`) is unchanged. Existing consumers and the live Action are
  unaffected.

## [1.0.0] - 2026-08-05

### Added

- Initial release: composite GitHub Action that recomputes the
  HMAC-SHA256 over `artifact_hash + claimed_status + timestamp` and
  fails the workflow on mismatch.
