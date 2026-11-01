import { prisma } from '@/lib/prisma';
import { ContentPage } from '@/components/content-page';
import { MediaDisplay } from '@/components/media-display';
import { DramaDescriptionModal } from '@/components/drama-description-modal';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Drama and cultural productions',
};

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
      items.map((item) => item.posterMediaId).filter(Boolean) as string[]
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

  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));

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
        <div className="content-grid drama-grid">
          {items.map((item) => {
            const poster = item.posterMediaId
              ? assetsById.get(item.posterMediaId) ?? null
              : null;

            return (
              <article className="card drama-card" key={item.id}>
                <div className="drama-meta">
                  <p className="eyebrow mono">
                    {item.organization}
                    {item.productionDate
                      ? ` · ${item.productionDate.toLocaleDateString('en-GB')}`
                      : ''}
                  </p>
                </div>

                <div className="drama-title-area">
                  <h2 className="drama-title">{item.title}</h2>
                </div>

                <div className="drama-role-area">
                  <p className="muted drama-role">Role: {item.role}</p>
                </div>

                <div className="drama-description-area">
                  <p className="drama-description">
                    {item.description}
                  </p>

                  {item.description?.trim() && (
                    <DramaDescriptionModal
                      title={item.title}
                      description={item.description}
                    />
                  )}
                </div>

                <div className="drama-media-frame">
                  {item.videoUrl ? (
                    <MediaDisplay
                      externalUrl={item.videoUrl}
                      cover={poster}
                      title={item.title}
                    />
                  ) : poster ? (
                    <MediaDisplay
                      asset={poster}
                      title={item.title}
                    />
                  ) : (
                    <div className="drama-media-placeholder">
                      Media coming soon
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </ContentPage>
  );
}