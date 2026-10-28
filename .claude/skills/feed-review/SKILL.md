---
name: feed-review
description: Review Paceboard authentication, authorization, PostgreSQL persistence, Kudos concurrency, tests, build health, and documentation
disable-model-invocation: true
---
Review Paceboard without editing files.
1. Read `CLAUDE.md`, `README.md`, `prisma/schema.prisma`, the data layer, Server Actions, feed components, and integration tests.
2. Run `npm test` and record the PostgreSQL integration evidence.
3. Run `npm run build` and record the production-build evidence.
4. Confirm salted password hashes, hashed session verifiers, protected cookies, ownership predicates, derived pace, the Kudos unique constraint, concurrent tests, and repeatable removal.
5. Confirm the README contains setup, teardown, a Mermaid diagram, evidence, limitations, and the Project 3 boundary.
Return PASS or FAIL for tests, build, authentication, authorization, persistence, concurrency, and documentation. Include evidence and required fixes. Do not edit files.