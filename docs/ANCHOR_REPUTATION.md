# Anchor Reputation

Every quote, fill, failure, and settlement latency an anchor produces is recorded
as an **outcome**. Outcomes aggregate into a public, user-verifiable score. The
goal is carrot, not stick: an anchor earns a track record it can point to.

Source of truth: [`lib/reputation/`](../lib/reputation/),
[`types/reputation.ts`](../types/reputation.ts), the
`/api/reputation/*` routes, and the Soroban contract in
[`contracts/reputation/`](../contracts/reputation/) (see
[`docs/ORACLE_SPEC.md`](ORACLE_SPEC.md)).

## Composite score

Defined in [`lib/reputation/composite.ts`](../lib/reputation/composite.ts):

```
score = fillRate × (1 − slippage) ÷ (settleSeconds / NORM_SETTLE_SECONDS)
```

- `fillRate` — fraction of quotes that settled, `[0, 1]`.
- `slippage` — fractional gap between quoted and delivered value, `[0, 1]`.
- `settleSeconds` — median settlement time; floored at `MIN_SETTLE_SECONDS` (1).
- `NORM_SETTLE_SECONDS = 300` — the "baseline fast" reference.

A score of **1.0** = perfect fill, zero slippage, settled at exactly the 300 s
reference. **> 1.0** = faster than reference. Higher is better.

## Score bands

[`lib/reputation/bands.ts`](../lib/reputation/bands.ts) maps a raw score to a band
via `SCORE_THRESHOLDS` (`getScoreBand` / `getBandLabel`) so the UI can render
confidence labels rather than raw floats.

## Storage

The reputation store is pluggable (`lib/reputation/store.ts`):

- **Dev** — SQLite ([`lib/reputation/sqlite.ts`](../lib/reputation/sqlite.ts)).
- **Prod** — Postgres ([`lib/reputation/postgres.ts`](../lib/reputation/postgres.ts)).

Aggregation, bucketing, reconciliation, locking, and PII redaction live alongside
(`aggregate.ts`, `buckets.ts`, `reconcile.ts`, `lock.ts`, `redact.ts`). Migrations
are in `lib/reputation/migrations/`.

## API

| Method & path                                   | Purpose                                   |
| ----------------------------------------------- | ----------------------------------------- |
| `GET /api/reputation/leaderboard?corridor=…`    | Ranked anchors (optionally per-corridor). |
| `GET /api/reputation/[anchor]`                  | Current score + bands for one anchor.     |
| `GET /api/reputation/[anchor]/history?window=…` | Historical score series.                  |
| `POST /api/reputation/append`                   | Append a signed outcome tuple.            |
| `POST /api/reputation/dispute`                  | File a dispute against an outcome.        |
| `POST /api/reputation/reconcile`                | Reconcile aggregates (maintenance).       |
| `POST /api/reputation/refresh`                  | Refresh materialized aggregates.          |

Outcomes are signed and replayable, so a dispute resolves on evidence, not
opinion. Admin-only review is gated by `ADMIN_SECRET_KEY` via
`/api/admin/disputes`.

## On-chain mirror

The same outcomes are written to the Soroban reputation contract for permissionless
reads. The contract interface (`submit_outcome`, anchor registry, admin) is
specified in [`docs/ORACLE_SPEC.md`](ORACLE_SPEC.md). Mainnet deployment is a
roadmap gate (see [`docs/ROADMAP.md`](ROADMAP.md), Wave 2.1).

## Disputes

Terminal-state rows expose a "flag incorrect outcome" path. A dispute records the
contesting party and the disputed outcome id; because every outcome carries the
user's signature and is replayable from the ledger, adjudication is evidence-based.
