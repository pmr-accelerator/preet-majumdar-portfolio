
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ContentPage } from '@/components/content-page';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Gallery',
};

export default async function GalleryPage() {
  const events = await prisma.galleryEvent.findMany({
    where: {
      publicationStatus: 'PUBLISHED',
    },
    include: {
      galleryItems: {
        where: {
          publicationStatus: 'PUBLISHED',
        },
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'asc' },
        ],
      },
    },
    orderBy: [
      { date: 'desc' },
      { sortOrder: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  const mediaIds = [
    ...new Set(
      events.flatMap((event) => [
        ...(event.coverMediaId ? [event.coverMediaId] : []),
        ...event.galleryItems.map((item) => item.imageMediaId),
      ]),
    ),
  ];

  const assets = mediaIds.length
    ? await prisma.mediaAsset.findMany({
        where: {
          id: { in: mediaIds },
        },
      })
    : [];

  const assetMap = new Map(
    assets.map((asset) => [asset.id, asset]),
  );

  return (
    <ContentPage
      index="07 / GALLERY"
      title="A record of real moments."
      intro="Photographs from academic events, technical activities, and cultural productions."
    >
      {events.length === 0 ? (
        <div className="card">
          <h2>No gallery events published yet.</h2>
          <p className="muted">
            Published event albums will appear here.
          </p>
        </div>
      ) : (
        <div className="content-grid gallery-events-grid">
          {events.map((event) => {
            const publishedPhotos = event.galleryItems;

            // Priority 1: Separately uploaded event cover.
            const standaloneCoverAsset = event.coverMediaId
              ? assetMap.get(event.coverMediaId)
              : null;

            const hasStandaloneCover =
              standaloneCoverAsset?.contentType.startsWith('image/') ?? false;

            // Priority 2: Selected photograph from the event album.
            const selectedCover = publishedPhotos.find(
              (item) => item.imageMediaId === event.coverMediaId,
            );

            // Priority 3: First published event photograph.
            const firstPhoto = publishedPhotos[0];
            const fallbackPhoto = selectedCover || firstPhoto;

            const fallbackAsset = fallbackPhoto
              ? assetMap.get(fallbackPhoto.imageMediaId)
              : null;

            const coverAsset = hasStandaloneCover
              ? standaloneCoverAsset
              : fallbackAsset;

            const coverAlt = hasStandaloneCover
              ? event.title
              : fallbackPhoto?.altText || event.title;

            const hasValidCover =
              coverAsset?.contentType.startsWith('image/') ?? false;

            return (
              <article
                className="card gallery-event-card"
                key={event.id}
              >
                {hasValidCover && coverAsset && (
                  <Link
                    className="media-visual gallery-event-cover"
                    href={`/gallery/${event.slug}`}
                    aria-label={`View ${event.title} gallery`}
                  >
                    <img
                      src={`/api/media/${coverAsset.id}`}
                      alt={coverAlt}
                      loading="lazy"
                    />
                  </Link>
                )}

                <p className="eyebrow mono">
                  {event.category}
                  {event.date
                    ? ` · ${event.date.toLocaleDateString('en-GB')}`
                    : ''}
                </p>

                <h2>{event.title}</h2>

                {event.description && (
                  <p className="muted">
                    {event.description}
                  </p>
                )}

                <p className="muted">
                  {publishedPhotos.length}{' '}
                  {publishedPhotos.length === 1
                    ? 'photograph'
                    : 'photographs'}
                </p>

                <p>
                  <Link href={`/gallery/${event.slug}`}>
                    View event photographs →
                  </Link>
                </p>
              </article>
            );
          })}
        </div>
      )}
    </ContentPage>
  );
}
