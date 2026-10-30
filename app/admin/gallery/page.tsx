
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import {
  saveGalleryAction,
  deleteGalleryAction,
} from '../actions';
import { ConfirmSubmitButton } from '@/components/confirm-submit-button';
import { DirectMediaUpload } from '@/components/direct-media-upload';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Manage gallery',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function GalleryAdmin({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;

  const [items, editing] = await Promise.all([
    prisma.galleryItem.findMany({
      orderBy: { updatedAt: 'desc' },
    }),
    params.edit
      ? prisma.galleryItem.findUnique({
          where: { id: params.edit },
        })
      : Promise.resolve(null),
  ]);

  const g = editing;

  return (
    <section
      className="wrap"
      style={{
        paddingBlock: 40,
        minHeight: '75vh',
      }}
    >
      <p className="eyebrow mono">
        PRIVATE CMS / PHOTO GALLERY
      </p>

      <h1>Gallery</h1>

      <p className="muted">
        Upload or replace this gallery image directly in this form.
      </p>

      <Link className="button" href="/admin">
        ← Dashboard
      </Link>

      <Link
        className="button"
        href="/admin/media"
        style={{ marginLeft: 8 }}
      >
        Open media library
      </Link>

      <div
        className="card"
        style={{ marginTop: 20 }}
      >
        <h2>
          {g ? 'Edit gallery item' : 'Add gallery item'}
        </h2>

        <form
          action={saveGalleryAction}
          className="admin-form"
        >
          {g && (
            <input
              type="hidden"
              name="id"
              value={g.id}
            />
          )}

          <label>
            Title
            <input
              name="title"
              required
              defaultValue={g?.title}
            />
          </label>

          <DirectMediaUpload
            name="imageMediaId"
            accept="image/jpeg,image/png,image/webp"
            label="Gallery image (required)"
            existingId={g?.imageMediaId ?? null}
          />

          <label>
            Date
            <input
              type="date"
              name="date"
              defaultValue={g?.date?.toISOString().slice(0, 10)}
            />
          </label>

          <label>
            Event or organization
            <input
              name="eventName"
              defaultValue={g?.eventName ?? ''}
            />
          </label>

          <label>
            Category
            <input
              name="category"
              required
              defaultValue={g?.category ?? 'Academic event'}
            />
          </label>

          <label>
            Alternative text
            <input
              name="altText"
              required
              minLength={3}
              defaultValue={g?.altText}
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              rows={3}
              defaultValue={g?.description ?? ''}
            />
          </label>

          <label>
            External source URL (optional)
            <input
              type="url"
              name="externalUrl"
              defaultValue={g?.externalUrl ?? ''}
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

          <button
            className="button button-primary"
            type="submit"
          >
            {g ? 'Save item' : 'Create item'}
          </button>

          {g && (
            <Link
              className="button"
              href="/admin/gallery"
            >
              Cancel edit
            </Link>
          )}
        </form>
      </div>

      <h2 style={{ marginTop: 32 }}>
        Gallery items ({items.length})
      </h2>

      <div className="admin-list">
        {items.map((i) => (
          <article
            className="card"
            key={i.id}
          >
            <div className="admin-row">
              <div>
                <p className="eyebrow mono">
                  {i.publicationStatus} · {i.category}
                </p>

                <h3>{i.title}</h3>

                <p className="muted">
                  {i.altText}
                </p>
              </div>

              <div className="admin-actions">
                <Link
                  className="button"
                  href={`/admin/gallery?edit=${i.id}`}
                >
                  Edit
                </Link>

                <form action={deleteGalleryAction}>
                  <input
                    type="hidden"
                    name="id"
                    value={i.id}
                  />

                  <ConfirmSubmitButton confirmation="Delete this gallery entry permanently?">
                    Delete
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
