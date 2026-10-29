# Preet / Digital Field Notes

A professional portfolio application for Preet Majumdar, built with Next.js App Router, React, TypeScript, Tailwind CSS, PostgreSQL, and Prisma. It includes a private administrator CMS, publication workflows, a durable S3-compatible media library, a contact inbox with optional Resend email notifications, résumé publishing, a portfolio assistant grounded in published content, and public portfolio pages.

> **Important:** The source implementation is created, but this environment could not install dependencies or connect to PostgreSQL. A production build, live database migration, end-to-end tests, storage upload, and email delivery have not been verified here. Configure the required services and run the checks below before deploying publicly.

## Requirements

- Node.js 22+
- PostgreSQL 15+
- npm
- An S3-compatible object storage service for persistent uploads
- Optional Resend account for contact email notifications

## Local setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to a PostgreSQL database.
3. Generate a long random `AUTH_SECRET` (at least 32 characters).
4. Install dependencies: `npm install`.
5. Generate Prisma client: `npm run db:generate`.
6. Validate schema: `npm run db:validate`.
7. Apply migrations: `npm run db:migrate:dev`.
8. Seed the initial factual profile, skills, leadership entries, and IIEST Shibpur achievement: `npm run db:seed`.
9. Create the first administrator using the interactive command: `npm run admin:create`. Choose a strong unique password of at least 14 characters. This command refuses to run if an administrator already exists.
10. Start the development server: `npm run dev`.
11. Open `http://localhost:3000`.

## Administrator routes

- `/admin` — database-backed dashboard
- `/admin/profile` — public profile content
- `/admin/skills` — skill entries and visibility
- `/admin/experience` — leadership and experience entries
- `/admin/projects` — project CRUD, status, draft/publish workflow
- `/admin/achievements` — achievement CRUD and publication
- `/admin/creative` — singing, guitar, and tabla entries
- `/admin/drama` — drama production records
- `/admin/gallery` — photo gallery records
- `/admin/media` — durable media uploads
- `/admin/resume` — publish/unpublish current résumé
- `/admin/links` — professional/social links
- `/admin/messages` — private contact inbox

All privileged server actions require an authenticated administrator. Public project, achievement, experience, gallery, and creative queries filter out drafts.

## Environment variables

- `DATABASE_URL` — PostgreSQL connection string.
- `AUTH_SECRET` — long random secret for signing administrator sessions.
- `APP_URL` — public base URL.
- `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL` — S3-compatible media storage. The public base URL must map to the uploaded object key, and bucket access should be configured deliberately.
- `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` — optional email notifications. Use a sender/domain permitted by your email provider.

Without S3 configuration, media uploads are disabled with an explicit error. Without Resend configuration, contact messages are still stored but no email is sent. Never commit `.env` or production secrets.

## Validation commands

Run these locally after installing dependencies and configuring PostgreSQL:

```bash
npm run db:generate
npm run db:validate
npm run typecheck
npm run lint
npm test
npm run build
```

Then manually test admin login/logout, project and achievement draft/publish/unpublish workflows, media upload persistence, résumé publishing, contact form storage and email status, and mobile layouts. The implementation has not yet been verified by a successful production build in the current environment.

## Cost-conscious deployment outline

Choose a Next.js-compatible host, managed PostgreSQL, S3-compatible object storage, and optional transactional email. Verify the current provider free-tier limits, inactivity rules, storage quotas, connection pooling, and billing requirements before creating accounts. Configure all environment variables in the hosting dashboard, apply committed Prisma migrations with `npm run db:migrate:deploy`, seed initial data once, and create the first admin through a secure one-time deployment shell/CLI or local database connection. Do not expose the bootstrap command as a public web route.

## Current limitations to review before launch

- Dependency installation, Prisma client generation, database migration execution, production build, and end-to-end tests have not been verified in this environment.
- Contact rate limiting is best-effort per process. Use a shared Redis/KV limiter for multi-instance/serverless production deployment.
- The owner must configure object storage and email credentials; these integrations cannot be confirmed without valid service accounts.
- Review privacy retention policy, upload access rules, and provider terms before public launch.
