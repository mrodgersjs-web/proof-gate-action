# Architecture

proof-gate-action is a composite GitHub Action that re-derives an
HMAC-SHA256 signature over a `ProofPacket` JSON document and fails the
workflow on any mismatch.

## Packet shape

The verifier expects a JSON object with exactly these fields:

| Field | Type | Required | Notes |
| :-- | :-- | :-: | :-- |
| `artifact_hash` | string | yes | hex digest or commit SHA of the artifact being attested |
| `claimed_status` | string | yes | must be exactly `"BUILD COMPLETE"` |
| `signature` | string | yes | hex HMAC-SHA256 over `artifact_hash + claimed_status + timestamp` |
| `timestamp` | string | yes | ISO-8601 UTC timestamp of the sign moment |

Extra fields are tolerated (forward compatibility). Missing or empty
required fields fail closed.

## HMAC input contract

The verifier recomputes:

```text
expected = HMAC_SHA256(secret_key, artifact_hash + claimed_status + timestamp)
```

and compares to `signature`. The string concatenation has no separators;
the bytes are exactly:

```text
expected = crypto.createHmac("sha256", secretKey)
                 .update(`${artifact_hash}${claimed_status}${timestamp}`)
                 .digest("hex")
```

If `signature !== expected`, the verifier exits 1 with
`PROOF GATE FAILED: forged done detected`.

## Inputs (`action.yml`)

| Input | Required | Default | Behaviour |
| :-- | :-: | :-- | :-- |
| `proofpacket-path` | no | `proofpacket.json` | Path to the packet file |
| `fail-on-missing` | no | `true` | When `false`, a missing packet is reported and the step exits 0 |
| `secret-key` | **yes** | none | HMAC secret. Never logged. |

## Failure modes (all exit 1 with a stable prefix)

| Condition | Output line |
| :-- | :-- |
| Packet file missing + `fail-on-missing=true` | `PROOF GATE FAILED: proofpacket not found at <path>` |
| Packet file unreadable | `PROOF GATE FAILED: unable to read <path>: <err>` |
| Packet is not valid JSON | `PROOF GATE FAILED: invalid JSON in <path>: <err>` |
| Required field missing | `PROOF GATE FAILED: proofpacket missing required fields` |
| `claimed_status` not `BUILD COMPLETE` | `PROOF GATE FAILED: claimed_status is '<x>', expected 'BUILD COMPLETE'` |
| HMAC mismatch | `PROOF GATE FAILED: forged done detected` |
| Empty `secret-key` | `PROOF GATE FAILED: secret-key is required for HMAC verification` |

## Independence

The verifier never imports the build logic. A successful gate means the
CI step independently computed the same signature the builder did. A
forged or tampered packet is caught because the recomputed HMAC will not
match.

## Why a composite Action

Composite Actions keep the verifier in a single Node entrypoint
(`verify.js`). There are no extra `package.json` dependencies to ship,
no `node_modules/` to bloat the repository.
