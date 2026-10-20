# Changelog

All notable changes are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
