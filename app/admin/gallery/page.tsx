
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { DirectMediaUpload } from '@/components/direct-media-upload';
import { ConfirmSubmitButton } from '@/components/confirm-submit-button';
import {
  saveGalleryAction,
  deleteGalleryAction
} from '../actions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Manage Gallery',
  robots: { index: false, follow: false }
};

export default async function AdminGalleryPage({
  searchParams
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;

  const [items, editing] = await Promise.all([
    prisma.galleryItem.findMany({
      orderBy: [
        { date: 'desc' },
        { sortOrder: 'asc' },
        { updatedAt: 'desc' }
      ]
    }),
    params.edit
      ? prisma.galleryItem.findUnique({
          where: { id: params.edit }
        })
      : Promise.resolve(null)
  ]);

  const imageIds = items.map((item) => item.imageMediaId);

  const assets = imageIds.length
    ? await prisma.mediaAsset.findMany({
        where: { id: { in: imageIds } },
        select: {
          id: true,
          contentType: true
        }
      })
    : [];

  const assetMap = new Map(
    assets.map((asset) => [asset.id, asset])
  );

  const g = editing;

  return (
    <section
      className="wrap"
      style={{ paddingBlock: 40, minHeight: '75vh' }}
    >
      <p className="eyebrow mono">PRIVATE CMS / GALLERY</p>

      <h1>Gallery</h1>

      <p className="muted">
        Upload photographs and organize them under separate event names.
        Items marked Published appear on the public Gallery page.
      </p>

      <Link className="button" href="/admin">
        ← Dashboard
      </Link>

      <div className="card" style={{ marginTop: 20 }}>
        <h2>{g ? 'Edit gallery photograph' : 'Add gallery photograph'}</h2>

        <form action={saveGalleryAction} className="admin-form">
          {g && (
            <input type="hidden" name="id" value={g.id} />
          )}

          <label>
            Photograph title
            <input
              name="title"
              required
              defaultValue={g?.title ?? ''}
              placeholder="e.g. Teachers' Day Celebration"
            />
          </label>

          <label>
            Event / Album name
            <input
              name="eventName"
              defaultValue={g?.eventName ?? ''}
              placeholder="e.g. Teachers' Day 2026"
            />
          </label>

          <label>
            Event date
            <input
              type="date"
              name="date"
              defaultValue={g?.date?.toISOString().slice(0, 10) ?? ''}
            />
          </label>

          <label>
            Category
            <input
              name="category"
              required
              defaultValue={g?.category ?? 'College Event'}
              placeholder="e.g. Academic Event"
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              rows={4}
              defaultValue={g?.description ?? ''}
              placeholder="Write a short description..."
            />
          </label>

          <DirectMediaUpload
            name="imageMediaId"
            accept="image/jpeg,image/png,image/webp"
            label="Gallery photograph (required)"
            existingId={g?.imageMediaId ?? null}
          />

          <label>
            Image alt text
            <input
              name="altText"
              required
              defaultValue={g?.altText ?? ''}
              placeholder="Describe what is visible in the photograph"
            />
          </label>

          <label>
            Original source URL (optional)
            <input
              type="url"
              name="externalUrl"
              defaultValue={g?.externalUrl ?? ''}
              placeholder="https://..."
            />
          </label>

          <label>
            Display order
            <input
              type="number"
              name="sortOrder"
              min="0"
              defaultValue={g?.sortOrder ?? 0}
            />
          </label>

          <label>
            Publication
            <select
              name="publicationStatus"
              defaultValue={g?.publicationStatus ?? 'DRAFT'}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>

          <button className="button button-primary" type="submit">
            {g ? 'Save changes' : 'Add photograph'}
          </button>

          {g && (
            <Link href="/admin/gallery" className="button">
              Cancel edit
            </Link>
          )}
        </form>
      </div>

      <h2 style={{ marginTop: 32 }}>
        Existing photographs ({items.length})
      </h2>

      <div className="admin-list">
        {items.map((item) => {
          const asset = assetMap.get(item.imageMediaId);

          return (
            <article className="card" key={item.id}>
              <div className="admin-row">
                <div>
                  {asset?.contentType.startsWith('image/') && (
                    <img
                      src={`/api/media/${asset.id}`}
                      alt={item.altText}
                      style={{
                        width: 160,
                        height: 110,
                        objectFit: 'cover',
                        borderRadius: 8,
                        marginBottom: 12
                      }}
                    />
                  )}

                  <p className="eyebrow mono">
                    {item.publicationStatus} · {item.category}
                  </p>

                  <h3>{item.title}</h3>

                  <p className="muted">
                    Album: {item.eventName || 'Other Moments'}
                    {item.date
                      ? ` · ${item.date.toLocaleDateString('en-GB')}`
                      : ''}
                  </p>
                </div>

                <div className="admin-actions">
                  <Link
                    className="button"
                    href={`/admin/gallery?edit=${item.id}`}
                  >
                    Edit
                  </Link>

                  <form action={deleteGalleryAction}>
                    <input
                      type="hidden"
                      name="id"
                      value={item.id}
                    />

                    <ConfirmSubmitButton confirmation="Delete this photograph permanently?">
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
