
import { prisma } from '@/lib/prisma';
import { ContentPage } from '@/components/content-page';
import { MediaDisplay } from '@/components/media-display';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Drama and cultural productions' };

export default async function DramaPage() {
  const items = await prisma.dramaProduction.findMany({
    where: { publicationStatus: 'PUBLISHED' },
    orderBy: [
      { productionDate: 'desc' },
      { sortOrder: 'asc' },
    ],
  });

  const ids = [
    ...new Set(
      items.map((i) => i.posterMediaId).filter(Boolean) as string[]
    ),
  ];

  const assets = await prisma.mediaAsset.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      publicUrl: true,
      contentType: true,
      originalName: true,
      altText: true,
    },
  });

  const byId = new Map(assets.map((a) => [a.id, a]));

  return (
    <ContentPage
      index="BEYOND CODE / 04"
      title="Stories beyond the screen."
      intro="College cultural productions and directing work, documented with genuine details."
    >
      {items.length === 0 ? (
        <div className="card">
          <h2>Production details will be added here.</h2>
          <p className="muted">
            Production titles, dates, and supporting media will appear when published.
          </p>
        </div>
      ) : (
        <div className="content-grid">
          {items.map((i) => {
            const poster = i.posterMediaId
              ? byId.get(i.posterMediaId) ?? null
              : null;

            return (
              <article className="card" key={i.id}>
                <p className="eyebrow mono">
                  {i.organization}
                  {i.productionDate
                    ? ` · ${i.productionDate.toLocaleDateString('en-GB')}`
                    : ''}
                </p>

                <h2>{i.title}</h2>

                <p className="muted">Role: {i.role}</p>

                <p style={{ lineHeight: 1.8 }}>{i.description}</p>

                {i.videoUrl ? (
                  <MediaDisplay
                    externalUrl={i.videoUrl}
                    cover={poster}
                    title={i.title}
                  />
                ) : poster ? (
                  <MediaDisplay
                    asset={poster}
                    title={i.title}
                  />
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </ContentPage>
  );
}
