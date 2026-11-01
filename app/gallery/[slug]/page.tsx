
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ContentPage } from '@/components/content-page';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function GalleryEventPage({ params }: Props) {
  const { slug } = await params;

  const event = await prisma.galleryEvent.findFirst({
    where: {
      slug,
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
  });

  if (!event) {
    notFound();
  }

  const mediaIds = event.galleryItems.map(
    (item) => item.imageMediaId,
  );

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
      title={event.title}
      intro={
        event.description ||
        'Photographs from this event and its memorable moments.'
      }
    >
      <p className="eyebrow mono">
        {event.category}
        {event.date
          ? ` · ${event.date.toLocaleDateString('en-GB')}`
          : ''}
        {' · '}
        {event.galleryItems.length}{' '}
        {event.galleryItems.length === 1
          ? 'PHOTOGRAPH'
          : 'PHOTOGRAPHS'}
      </p>

      <p style={{ marginBottom: 28 }}>
        <Link href="/gallery">← Back to all events</Link>
      </p>

      {event.galleryItems.length === 0 ? (
        <div className="card">
          <h2>No published photographs yet.</h2>
          <p className="muted">
            Photographs will appear here once they are published.
          </p>
        </div>
      ) : (
        <div className="content-grid">
          {event.galleryItems.map((item) => {
            const asset = assetMap.get(item.imageMediaId);

            if (!asset || !asset.contentType.startsWith('image/')) {
              return null;
            }

            return (
              <article className="card" key={item.id}>
                <a
                  className="media-visual"
                  href={`/api/media/${asset.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={`/api/media/${asset.id}`}
                    alt={item.altText || item.title}
                    loading="lazy"
                  />
                </a>

                <p className="eyebrow mono">
                  {item.category}
                  {item.date
                    ? ` · ${item.date.toLocaleDateString('en-GB')}`
                    : ''}
                </p>

                <h3>{item.title}</h3>

                {item.description && (
                  <p className="muted">{item.description}</p>
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
      )}
    </ContentPage>
  );
}
