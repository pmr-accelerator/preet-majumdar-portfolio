import { prisma } from '@/lib/prisma';
import { ContentPage } from '@/components/content-page';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Gallery',
};

export default async function GalleryPage() {
  const items = await prisma.galleryItem.findMany({
    where: {
      publicationStatus: 'PUBLISHED',
    },
    orderBy: [
      { date: 'desc' },
      { sortOrder: 'asc' },
    ],
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      date: true,
      eventName: true,
      imageMediaId: true,
      altText: true,
      externalUrl: true,
    },
  });

  // Fetch only the media metadata needed by the gallery.
  const mediaIds = [
    ...new Set(items.map((item) => item.imageMediaId)),
  ];

  const assets = mediaIds.length
    ? await prisma.mediaAsset.findMany({
        where: {
          id: {
            in: mediaIds,
          },
        },
        select: {
          id: true,
          contentType: true,
        },
      })
    : [];

  const assetMap = new Map(
    assets.map((asset) => [asset.id, asset])
  );

  // Group photographs by event name.
  const eventGroups = new Map<string, typeof items>();

  for (const item of items) {
    const eventName = item.eventName?.trim() || 'Other Moments';

    if (!eventGroups.has(eventName)) {
      eventGroups.set(eventName, []);
    }

    eventGroups.get(eventName)!.push(item);
  }

  return (
    <ContentPage
      index="07 / GALLERY"
      title="A record of real moments."
      intro="Photographs from academic events, technical activities, and cultural productions."
    >
      {items.length === 0 ? (
        <div className="card">
          <h2>No gallery items published yet.</h2>
          <p className="muted">
            Only genuine photographs added by the owner will appear here.
          </p>
        </div>
      ) : (
        <div className="gallery-events">
          {Array.from(eventGroups.entries()).map(
            ([eventName, eventItems]) => (
              <section
                key={eventName}
                className="gallery-event"
              >
                <h2>{eventName}</h2>

                <div className="content-grid">
                  {eventItems.map((item) => {
                    const asset = assetMap.get(item.imageMediaId);

                    return (
                      <article className="card" key={item.id}>
                        {asset?.contentType.startsWith('image/') && (
                          <a
                            className="media-visual gallery-media-visual"
                            href={`/api/media/${asset.id}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open photograph: ${item.title}`}
                          >
                            <img
                              src={`/api/media/${asset.id}`}
                              alt={item.altText || item.title}
                              loading="lazy"
                              decoding="async"
                            />
                          </a>
                        )}

                        <p className="eyebrow mono">
                          {item.category}
                          {item.date
                            ? ` · ${item.date.toLocaleDateString('en-GB')}`
                            : ''}
                        </p>

                        <h3>{item.title}</h3>

                        {item.description && (
                          <p className="muted">
                            {item.description}
                          </p>
                        )}

                        {item.externalUrl && (
                          <p>
                            <a
                              href={item.externalUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View original source ↗
                            </a>
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            )
          )}
        </div>
      )}
    </ContentPage>
  );
}