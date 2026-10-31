import Image from 'next/image';
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

  const mediaIds = [
    ...new Set(
      items.flatMap((item) => [
        ...(item.certificateMediaId ? [item.certificateMediaId] : []),
        ...(item.supportingMediaIds ?? []),
      ])
    ),
  ];

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
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))',
            gap: '16px',
          }}
        >
          {items.map((a) => {
            const certificate = a.certificateMediaId
              ? assetMap.get(a.certificateMediaId)
              : null;

            const certificateIsImage =
              certificate?.contentType.startsWith('image/');

            const certificateIsPdf =
              certificate?.contentType === 'application/pdf';

            return (
              <article
                className="card"
                key={a.id}
                style={{ padding: '16px' }}
              >
                <Link
                  href={`/achievements/${a.slug}`}
                  className="group block"
                  aria-label={`View details of ${a.title}`}
                >
                  <div className="mb-3 overflow-hidden rounded-lg border border-white/10 bg-black/10">
                    <div
                      className="flex items-center justify-center overflow-hidden p-2"
                      style={{ aspectRatio: '16 / 9', maxHeight: '165px' }}
                    >
                      {certificate && certificateIsImage ? (
                        <Image
                          src={`/api/media/${certificate.id}`}
                          alt={
                            certificate.altText ||
                            `${a.title} certificate`
                          }
                          width={900}
                          height={675}
                          unoptimized
                          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      ) : certificate && certificateIsPdf ? (
                        <div className="flex flex-col items-center gap-2 text-center">
                          <span className="text-4xl">📜</span>
                          <span className="text-xs font-semibold">
                            Certificate PDF
                          </span>
                          <span className="muted text-xs">
                            Open to view
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-center">
                          <span className="text-4xl">🏆</span>
                          <span className="text-xs font-semibold">
                            Achievement
                          </span>
                          <span className="muted text-xs">
                            View details
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="eyebrow mono text-xs">
                    {a.category.toUpperCase()}
                    {a.issueDate
                      ? ` / ${a.issueDate.toLocaleDateString('en-GB', {
                          month: 'short',
                          year: 'numeric',
                        })}`
                      : ''}
                  </p>

                  <h2 className="mt-1 text-base group-hover:text-cyan-300 transition-colors">
                    {a.title}
                  </h2>

                  {a.organization && (
                    <p className="muted mt-1 text-sm">{a.organization}</p>
                  )}

                  <p
                    className="mt-2 text-sm"
                    style={{
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {a.description}
                  </p>

                  <span className="inline-block mt-3 text-xs font-medium">
                    View certificate & details →
                  </span>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </ContentPage>
  );
}