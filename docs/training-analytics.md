# Paceboard Training Analytics Evidence

## Calendar and rounding policy

- Store activity instants in UTC and convert each instant to the selected IANA timezone before deriving its calendar date.
- Weeks run Monday through Sunday and are identified by their local Monday date.
- Sum integer hundredths of miles, integer seconds, and integer feet before formatting.
- Round displayed miles and rolling averages to 2 decimals, pace to the nearest second per mile, and percentage change to 1 decimal.
- Exclude zero-distance runs from weighted pace while retaining their duration and count in total volume.
- Return owner-only aggregate DTOs. Never select or serialize GPS routes for analytics.

## Reproduce

1. Start the existing Docker Compose services.
2. Run `npm test`.
3. Run `npm run build`.
4. Sign in and open `/analytics`.

## Evidence

- Unit tests:
- PostgreSQL integration tests:
- Production build:
- Secret Mission failing checkpoint: The naive UTC helper assigned only `7.00` miles to the expected local week.
- Secret Mission naive buckets: `2026-03-02` = `7.00` miles. `2026-03-09` = `5.00` miles.
- Secret Mission corrected bucket: `America/New_York` assigns `12.00` miles to `2026-03-02`.
- Root cause: `2026-03-09T03:30:00Z` is Sunday at 11:30 PM in `America/New_York`. Its UTC calendar date is Monday.
- DST evidence: `2026-03-08T06:30:00Z` and `2026-03-08T07:30:00Z` straddle the spring transition.
- Assignment evidence: All three fixtures are assigned exactly once.
- Conservation evidence: Weekly distance sums to `12.00` miles.
- Determinism evidence: Repeated aggregation returns deeply equal output.
- Contract evidence: The serialized DTO contains no GPS fields or owner fields.
- Passing boundary regression: `npm test -- tests/training-analytics-boundary.secret.test.ts`.

## Production limitations

This focused project aggregates the selected owner's bounded date range in application code. A future high-volume version should move pre-aggregation into PostgreSQL or maintained summary tables while preserving the DTO, timezone policy, authorization predicates, and boundary regression fixtures.

The current range and timezone are request parameters rather than persisted user preferences. The project intentionally avoids shared caching because analytics responses are personalized.