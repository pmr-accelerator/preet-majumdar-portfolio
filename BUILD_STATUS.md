# Build status — Preet / Digital Field Notes

Last updated: 2026-10-29

## Implemented in source

- Next.js App Router, React, TypeScript, Tailwind CSS base, editorial dark design system, responsive page components.
- Public homepage with database-backed profile, skills, published projects, published achievement, and optional published résumé link.
- About page backed by profile data.
- Projects listing and individual published project detail pages.
- Achievements listing and individual published achievement detail pages.
- Experience/leadership page backed by published database entries.
- Singing, guitar, tabla, and drama pages backed by published database entries.
- Public gallery page backed by published gallery items and media asset URLs.
- Private administrator session using signed HTTP-only cookies and a CLI-only first-admin setup script.
- Dashboard with live database counts.
- Admin CRUD interfaces and server-side validation for profile, skills, experience, projects, achievements, creative entries, drama productions, gallery entries, professional links, résumé publishing, and contact messages.
- S3-compatible media upload route/action with size and allowed MIME-type restrictions; persistent metadata stored in PostgreSQL.
- Contact form server action: server validation, honeypot, best-effort per-process throttling, database persistence, optional Resend email attempt, and email delivery status tracking.
- Portfolio assistant UI and API grounded in published portfolio records; no external AI provider required.
- Seed script for factual initial profile, skills, leadership, and the IIEST Shibpur poster-presentation achievement.
- README and environment-variable template.

## Not verified / still required before production

- npm dependency installation timed out in this environment; `node_modules` and a successful production build are unavailable here.
- Prisma client generation, schema validation, migration application, database seed execution, and database queries have not been run against a real PostgreSQL instance.
- Full TypeScript typecheck, ESLint, unit tests, integration tests, and browser end-to-end tests have not been run. TypeScript transpile-only syntax check reported zero syntax diagnostics, but this is not a typecheck.
- S3-compatible upload has not been tested against a real provider/bucket.
- Resend email delivery has not been tested with valid credentials and a verified sender.
- Contact rate limiting is in-memory and is not sufficient across serverless instances; configure shared Redis/KV rate limiting before high-risk production use.
- Upload MIME type is based on browser-provided metadata; validate file signatures and configure storage/CDN access policy before accepting arbitrary public uploads at scale.
- Admin login rate limiting, full accessibility audit, security-header review, mobile browser testing, and performance measurements remain to be completed.
- Owner-specific LinkedIn/GitHub URLs, résumé PDF, portrait, event photographs, production titles/dates, and exact Coding Club start date must be supplied by the owner. The app must not invent these details.
- Hosting, PostgreSQL, S3-compatible storage, email credentials, and production URL are not configured.

## Local next steps

1. Configure `.env` from `.env.example`.
2. Run `npm install`.
3. Run `npm run db:generate` and `npm run db:validate`.
4. Run `npm run db:migrate:dev` and `npm run db:seed`.
5. Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`; fix any reported issues.
6. Run `npm run admin:create` to create the first administrator.
7. Configure S3 and Resend, then test uploads and contact delivery end to end.
8. Deploy and run `npm run db:migrate:deploy`; test public pages and protected CMS routes in production.
