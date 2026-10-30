
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ContentPage } from '@/components/content-page';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Achievements',
  description:
    'Academic and technical milestones documented by Preet Majumdar.',
};

export default async function AchievementsPage() {
  const items = await prisma.achievement.findMany({
    where: { publicationStatus: 'PUBLISHED' },
    orderBy: [
      { featured: 'desc' },
      { issueDate: 'desc' },
      { sortOrder: 'asc' },
    ],
  });

  const mediaIds = items
    .map((item) => item.certificateMediaId)
    .filter((id): id is string => Boolean(id));

  const assets = mediaIds.length
    ? await prisma.mediaAsset.findMany({
        where: { id: { in: mediaIds } },
      })
    : [];

  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));

  return (
    <ContentPage
      index="04"
      title="Milestones worth documenting."
      intro="A concise archive of genuine academic and technical milestones, with supporting evidence added when available."
    >
      {items.length === 0 ? (
        <div className="card">
          <h2>No achievements published yet.</h2>
          <p className="muted">
            Verified details and supporting evidence will be added as they are
            available.
          </p>
        </div>
      ) : (
        <div className="content-grid">
          {items.map((a) => {
            const certificate = a.certificateMediaId
              ? assetMap.get(a.certificateMediaId)
              : null;

            const certificateUrl = certificate
              ? `/api/media/${certificate.id}`
              : null;

            return (
              <article className="card" key={a.id}>
                {certificate && certificateUrl && (
                  <>
                    {certificate.contentType.startsWith('image/') ? (
                      <Link
                        href={`/achievements/${a.slug}`}
                        className="media-visual"
                      >
                        <img
                          src={certificateUrl}
                          alt={
                            certificate.altText || `${a.title} certificate`
                          }
                          loading="lazy"
                        />
                      </Link>
                    ) : certificate.contentType === 'application/pdf' ? (
                      <a
                        className="media-document"
                        href={certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="media-icon">PDF</span>
                        <span>
                          <strong>Certificate document</strong>
                          <small>{certificate.originalName}</small>
                        </span>
                        <b>↗</b>
                      </a>
                    ) : null}
                  </>
                )}

                <p className="eyebrow mono">
                  {a.category.toUpperCase()}
                  {a.issueDate
                    ? ` / ${a.issueDate.toLocaleDateString('en-GB', {
                        month: 'short',
                        year: 'numeric',
                      })}`
                    : ''}
                </p>

                <h2>
                  <Link href={`/achievements/${a.slug}`}>{a.title}</Link>
                </h2>

                <p className="muted">{a.organization}</p>

                <p style={{ lineHeight: 1.8 }}>{a.description}</p>

                <Link href={`/achievements/${a.slug}`}>
                  View details →
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </ContentPage>
  );
}
