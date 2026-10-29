# Architecture — Preet / Digital Field Notes

## Goals
- Accurate public portfolio with no fabricated projects, credentials, metrics, or links.
- Private owner-only CMS; all privileged authorization enforced server-side.
- PostgreSQL as the source of truth; durable object storage for media.
- Routine content updates must not require a deployment.
- Mobile-first public site and administration UI; accessible controls and reduced-motion support.
- Low initial operating cost, with providers and free-tier limits rechecked at deployment time.

## Proposed stack
- Next.js App Router + React + TypeScript (strict) + Tailwind CSS.
- PostgreSQL + Prisma ORM; migrations committed to the repository.
- Auth.js-compatible credentials/session design, with an explicit first-admin bootstrap process. No public default password.
- Zod for validation.
- S3-compatible object storage (Cloudflare R2 or another compatible provider) for persistent uploads; never use ephemeral application disk for production media.
- Resend-compatible transactional email adapter for contact notifications; database message persistence is independent of email delivery.
- Vitest for unit/integration tests and Playwright for end-to-end tests.

## Initial deployment shape
- Next.js application on a provider that supports App Router and server-side functions.
- Managed PostgreSQL with connection pooling if needed.
- S3-compatible durable media storage.
- Transactional email provider.
- HTTPS and environment variables managed by the hosting provider.

Provider choice is intentionally deferred until current free-tier limits, region availability, database connection limits, upload constraints, and billing requirements are verified. The application must not depend on a provider-specific ephemeral filesystem.

## Data model
- AdminUser: administrator identity and password hash; no public registration.
- Profile, Education, Skill, Experience: owner profile content.
- Project, Achievement, GalleryItem, CreativeEntry, DramaProduction: publishable content with draft/published/archived states.
- SocialLink and ResumeAsset: owner-managed public links and current résumé.
- ContactMessage: private message, processing status, notification delivery status.
- MediaAsset: durable object key, content type, size, metadata, and storage provider.
- SiteSettings: configurable site metadata and assistant settings.

## Security boundaries
- Public read queries must explicitly filter to published content.
- Every mutation and private read checks an authenticated administrator on the server.
- Never trust client-only route guards.
- Validate and normalize all user input on the server.
- Uploads require size/type allowlists and durable storage; do not trust filename or client MIME alone.
- Contact form requires rate limiting and spam mitigation; message storage success is distinct from email delivery success.
- Secrets stay in server-only environment variables. `.env.example` contains placeholders only.

## Publishing and caching
- Content records have explicit publication status and timestamps.
- On publishing/editing/unpublishing, invalidate relevant Next.js paths/tags.
- Public pages never query drafts or private messages.
- Admin previews are authenticated and do not expose unpublished content publicly.

## Portfolio assistant
- First version is deterministic and grounded only in published portfolio content.
- No external AI provider is required. When a question cannot be answered, the assistant directs visitors to the contact page.
- Clearly disclose that it is automated and does not represent live owner presence.

## Known owner information still needed
- Exact Coding Club start month/year and whether teaching/presidency began together.
- LinkedIn URL, GitHub URL, preferred contact email.
- Genuine résumé PDF and optional portrait.
- Genuine supporting document/photo for the IIEST Shibpur presentation.
- Actual titles/dates/details for the two drama productions.
- Genuine project details as they become ready to publish.

Missing information must not block the build. It remains configurable and is omitted publicly until supplied.
