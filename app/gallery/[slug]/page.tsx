
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ContentPage } from '@/components/content-page';
import { GalleryPhotoGrid } from '@/components/gallery-photo-grid';

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

  const photos = event.galleryItems.flatMap((item) => {
    const asset = assetMap.get(item.imageMediaId);

    if (!asset || !asset.contentType.startsWith('image/')) {
      return [];
    }

    return [
      {
        id: item.id,
        src: `/api/media/${asset.id}`,
        title: item.title,
        category: item.category,
        date: item.date
          ? item.date.toLocaleDateString('en-GB')
          : null,
        description: item.description,
      },
    ];
  });

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
        {photos.length}{' '}
        {photos.length === 1
          ? 'PHOTOGRAPH'
          : 'PHOTOGRAPHS'}
      </p>

      <p style={{ marginBottom: 28 }}>
        <Link href="/gallery">← Back to all events</Link>
      </p>

      <GalleryPhotoGrid photos={photos} />
    </ContentPage>
  );
}
