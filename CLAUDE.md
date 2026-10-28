# Product
- Paceboard is Project 2 in a progressive Strava-inspired application series.
- Preserve the tested Project 1 feed and evolve it through existing boundaries.
- Project 3 will add GPS ingestion, route processing, privacy controls, and interactive maps.
# Architecture
- `app/page.tsx` is the server composition boundary.
- UI code depends on `Activity`, not Prisma records.
- Server code depends on `ActivityRepository`, not directly on fixtures.
- Authentication derives identity from a database-backed cookie session.
- Authorization belongs in the data layer and must include ownership predicates.
- Average pace is derived from stored distance and elapsed time.
- Kudos uniqueness is enforced by the database and API retries must be idempotent.
# Quality gates
- Keep TypeScript strict and do not introduce `any`.
- Validate all Server Action input with Zod.
- Re-check authentication and authorization inside every mutation.
- Run `npm test` against the real test database.
- Run `npm run build` before reporting completion.
- Keep the Mermaid architecture and documented limitations current.

Existing Project 4 Claude Code guidance extended with Project 5 analytics constraints: aggregate integer source metrics before rounding; use explicit IANA timezone conversion; query only current-owner runs; never select GPS relations for analytics; return explicit analytics DTOs; run tests and npm run build after changes.