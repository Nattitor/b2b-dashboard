# Local audit — October 30, 2026

This revision is a read-only synthetic business dashboard backed by a persistent local SQLite database. It does not turn the project into an authenticated financial application. Project attribution remains Freddy Guerra (Nattitor). This audit records local checks and operating limits.

## Changes made

- The application data contract is `getDashboardSnapshot()` and `getLedger(filters)` from `lib/data.ts`; both retain their existing DTOs. Local SQLite is the sole source, stored at `.data/nattitor.sqlite` and accessed via Node.js 24's built-in `node:sqlite`.
- A missing database is initialized on first query with synthetic, fixed-date fixtures for October 30, 2026. Existing unrelated databases or incompatible versions are rejected. There is no reset, reseed, or automatic migration, including from a remote database. The web UI remains read-only.
- Added a `db:status` utility to prepare the database if absent and show its path, row counts, and snapshot date without resetting it.
- The expected operating model is Node.js 24 LTS with development or self-hosted persistent writable storage. For the Vercel read-only demo, `VERCEL=1` selects a versioned directory under the system temporary directory instead of `.data/`. Each instance can recreate the same synthetic dataset; this is not persistent or shared application storage. No account, service, quota, or credentials are required; former Supabase variables are unused.
- Dashboard and ledger source labels now identify local SQLite and synthetic data. Existing UI, metrics, and read-only behavior are retained.

## Local verification

Observed on Windows with Node.js 24.18.0 and npm 11.16.0. Browser tests used the production server on loopback, with the obsolete `DASHBOARD_DATA_SOURCE=supabase` selector deliberately set; the application still used local SQLite.

| Check                                  | Observed result                                                                                                                         |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint` / `npm run typecheck`   | Passed                                                                                                                                  |
| `npm test`                             | 29 passed, including 12 SQLite tests                                                                                                    |
| `npm run build`                        | Passed; overview and ledger remain dynamic routes; no tracing warnings in final build                                                   |
| `npm run db:status`                    | 24 synthetic customers, 3 plans, 395 transactions; snapshot `2026-10-30T12:00:00.000Z`                                                  |
| `npm run test:e2e`                     | 14 passed, zero retries, 28.6 seconds                                                                                                   |
| Responsive / accessibility regressions | No horizontal overflow at 320, 390, 768, 1440 px; no serious/critical axe WCAG 2 A/AA findings in tested pages                          |
| `npm run capture:preview`              | Updated overview, desktop/mobile ledger, and portfolio cover images                                                                     |
| `npm audit --audit-level=low`          | Zero reported vulnerabilities                                                                                                           |
| Database persistence                   | Same SHA-256 before/after app queries; temporary-database tests preserved local edits across reopen                                     |
| Build-boundary checks                  | No local database/environment-file paths in server trace manifests; bounded browser-JavaScript scan found no SQLite/server-only markers |

SQLite tests compare SQL results with pure metrics across UTC boundaries, literal/Unicode searches, sorting, pagination, and empty periods. They also cover integer cents, schema constraints, rollback, read-only connections, and byte-for-byte preservation when rejecting unrelated, blank, invalid, or incompatible files. Existing empty databases are not reseeded.

Initial confined invocations hit expected sandbox restrictions for npm cache writes and Node/Chrome child processes. The same commands passed after approved retries. Dynamic filesystem tracing warnings were resolved by excluding runtime storage from build tracing. These checks do not establish security or performance certification.

## Development verification

The resumed check started `npm run dev -- --hostname 127.0.0.1 --port 3100` successfully with Node.js 24.18.0. Next.js reported ready in 2.4 seconds. This was a manual browser smoke check, separate from the automated production-browser run above.

- Overview and ledger returned HTTP 200 and identified local SQLite as their source. Overview retained collected revenue of $12,947.00.
- Searching `Vela` returned 12 transactions; page two showed records 11–12. Applying `Pending` retained the search, returned two matching transactions, and reset pagination to page one.
- The database SHA-256 matched before and after development navigation, and matched the earlier production checks: `24EB29328CB55D52FD28AAFC0E75200B1E420A014CEF471AE3F1D566984AC133`.
- The reviewed data-access module reads SQLite directly, without a remote-source selector or fallback. No remote database operation or environment-file edit was performed.

A later hydration diagnostic checked the reported extra `bis_skin_checked`, `bis_register`, and `__processed_*` attributes. They were absent from the server's HTTP 200 HTML response and from the reviewed application/component sources. The existing `npm run test:e2e -- --grep 'overview content'` check passed against development in a fresh Chrome context (one test), with no console or page errors. Its initial confined run hit `spawn EPERM`; the same command passed after an approved retry. The reported browser still requires extension isolation; no extension setting was changed, and no hydration-warning suppression or application-markup workaround was added.

## Publication preflight

After adding temporary storage for the Vercel demo, the recheck passed: 30 unit tests (13 covering SQLite), lint, typecheck, formatting, and the production build. Node.js is pinned to `24.x` in the package manifest and lockfile.

A local production server ran with `VERCEL=1` on port 3101. `db:status` confirmed a database under the system temporary directory, with 24 customers, 3 plans, 395 transactions, and read-only web access. All 14 browser tests passed against that server with zero retries (32.8 seconds), including responsive layouts, CSV export, browser-error checks, and the tested axe rules. Both application routes returned HTTP 200. The persistent development database retained its original SHA-256.

Confined runs that hit `spawn EPERM` were repeated with approval. Only the comment-only environment example was staged; local environment files and SQLite files were excluded from Git.

## Safety boundaries and remaining work

- Only a missing `.data/nattitor.sqlite` is initialized. Unrelated pre-existing databases and incompatible schema versions are rejected rather than reset, reseeded, or migrated; temporary-file tests verified preservation.
- The dataset is synthetic and fixed-date, not a live payment feed. The interface is read-only; CSV export contains only the current page, not every matching record.
- Persistent writable storage and same-directory hard-link support are required for atomic initialization, verified here on NTFS. The Vercel demo uses temporary SQLite storage only for disposable, read-only synthetic data; persistence across function instances is not claimed. Backups and operational retention of `.data/` are deployment responsibilities.
- The existing environment file was not inspected or edited. Next.js still loads its normal environment configuration; local database access does not consult former remote-service variables. Runtime database and environment files are excluded from server build tracing.
- No remote schema, database, or migration operation is part of this design. Former remote credentials/configuration are unused. Do not add real customer or financial data without implementing authentication, authorization, tenant isolation, audited controls, and an independent security review.
- Automated checks do not replace manual screen-reader testing, cross-browser/device testing, penetration testing, or load testing. No Lighthouse score or measured performance gain is claimed.
- No deployment, commit, push, or credential rotation is asserted by this audit.

## Reproduce

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run db:status
npm run start -- --hostname 127.0.0.1 --port 3100
```

In a second terminal, with the local production server running:

```sh
npm run test:e2e
npm run capture:preview
npm run format:check
npm audit --audit-level=low
```

`db:status` prepares the database if missing and reports location, row counts, and snapshot date; it does not reset it. `capture:preview` overwrites the portfolio preview and captured documentation images, and accepts only a loopback `PLAYWRIGHT_BASE_URL`.

[Overview preview](../public/preview.png) · [Desktop ledger](screenshots/transactions-desktop.png) · [Mobile ledger](screenshots/transactions-mobile.png) · [Logo](../public/brand/nattitor-logo.svg)
