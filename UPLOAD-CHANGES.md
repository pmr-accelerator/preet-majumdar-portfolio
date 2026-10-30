# Section-based upload changes

This update adds direct upload controls inside Gallery, Creative, Drama, Achievements, Projects, Résumé, and Profile forms. Uploads no longer require visiting the Media Library first.

## Storage and limits

Files are stored in the existing PostgreSQL `MediaAsset` table using a nullable `BYTEA` column (`fileData`). Existing S3-compatible media records remain supported. The new section uploader accepts JPG, PNG, WebP, PDF (10 MB/file) and MP3, M4A, WAV (20 MB/file). Direct video upload is intentionally disabled; use a hosted video URL for drama/video content. Database storage is quota-limited and is not an unlimited video-storage solution.

## Deployment

1. Back up the Neon database.
2. Install dependencies in the project directory with `npm install`.
3. Generate the Prisma client: `npx prisma generate`.
4. Apply the additive migration to the production database: `npx prisma migrate deploy`.
5. Run `npm run build` locally. Then commit and push the changed files so Render deploys them.
6. Log out and log back into the admin after deployment so the refreshed session cookie is available to the upload API.

No existing media records or admin accounts are deleted. Existing public media URLs continue to work. Dashboard content edits and uploads after deployment do not require another redeployment.
