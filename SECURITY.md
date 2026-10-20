# Security Policy

## Supported versions

| Version | Supported |
| :-- | :-: |
| `main` branch | yes |
| latest tagged release | yes |
| older releases | best effort |

The Action is dependency-free and ships as a single `verify.js` file. There
are no transitive package risks.

## Reporting a vulnerability

Please email **security@rodgersintelligence.com** with:

- a description of the issue and impact
- the commit SHA or tag you reproduced against
- a minimal reproduction

We aim to acknowledge within 3 business days. Please do not file a public
issue for a security report.

## Secret handling

The verifier expects the HMAC secret as an environment variable or Action
input. It never logs the secret. Production workflows must store the
secret in `secrets.PROOF_GATE_SECRET` (or equivalent) and pass it through
the action's `secret-key` input.
