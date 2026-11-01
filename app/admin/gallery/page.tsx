
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { DirectMediaUpload } from '@/components/direct-media-upload';
import { ConfirmSubmitButton } from '@/components/confirm-submit-button';

import {
  saveGalleryEventAction,
  deleteGalleryEventAction,
  addGalleryPhotosAction,
  setGalleryEventCoverAction,
  deleteGalleryPhotoAction
} from '../actions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Manage Gallery',
  robots: { index: false, follow: false }
};

function dateValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : '';
}

export default async function AdminGalleryPage() {
  await requireAdmin();

  const [events, unassignedItems] = await Promise.all([
    prisma.galleryEvent.findMany({
      include: {
        galleryItems: {
          orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'asc' }
          ]
        }
      },
      orderBy: [
        { date: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    }),

    prisma.galleryItem.findMany({
      where: { galleryEventId: null },
      orderBy: [
        { date: 'desc' },
        { sortOrder: 'asc' }
      ]
    })
  ]);

  // Include event cover assets and all gallery photographs.
  const mediaIds = [
    ...new Set([
      ...events.flatMap((event) => [
        ...(event.coverMediaId ? [event.coverMediaId] : []),
        ...event.galleryItems.map((item) => item.imageMediaId)
      ]),
      ...unassignedItems.map((item) => item.imageMediaId)
    ])
  ];

  const assets = mediaIds.length
    ? await prisma.mediaAsset.findMany({
        where: { id: { in: mediaIds } },
        select: {
          id: true,
          contentType: true
        }
      })
    : [];

  const assetMap = new Map(
    assets.map((asset) => [asset.id, asset])
  );

  return (
    <section
      className="wrap"
      style={{ paddingBlock: 40, minHeight: '75vh' }}
    >
      <p className="eyebrow mono">PRIVATE CMS / GALLERY</p>

      <h1>Gallery Management</h1>

      <p className="muted">
        Create events first, then upload and organize their photographs.
        Each event can have its own optional cover image and publication status.
      </p>

      <Link className="button" href="/admin">
        ← Dashboard
      </Link>

      {/* CREATE EVENT */}
      <div className="card" style={{ marginTop: 24 }}>
        <h2>Create a new event / album</h2>

        <p className="muted">
          You can create an event without uploading any photographs.
          Photos can be added later. An optional separate cover image
          can also be uploaded here.
        </p>

        <form action={saveGalleryEventAction} className="admin-form">
          <label>
            Event title
            <input
              name="title"
              required
              minLength={2}
              maxLength={160}
              placeholder="e.g. Teachers' Day Celebration 2026"
            />
          </label>

          <label>
            Event URL slug
            <input
              name="slug"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="e.g. teachers-day-celebration-2026"
            />
            <small className="muted">
              Use lowercase letters, numbers and hyphens only.
            </small>
          </label>

          <label>
            Event date
            <input type="date" name="date" />
          </label>

          <label>
            Category
            <input
              name="category"
              required
              defaultValue="College Event"
              maxLength={100}
            />
          </label>

          <label>
            Event description
            <textarea
              name="description"
              rows={4}
              maxLength={5000}
              placeholder="Describe the event..."
            />
          </label>

          {/* OPTIONAL STANDALONE EVENT COVER */}
          <DirectMediaUpload
            name="coverMediaId"
            accept="image/jpeg,image/png,image/webp"
            label="Optional event cover image"
          />

          <label>
            Display order
            <input
              type="number"
              name="sortOrder"
              min="0"
              max="9999"
              defaultValue="0"
            />
          </label>

          <label>
            Publication status
            <select name="publicationStatus" defaultValue="DRAFT">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>

          <button className="button button-primary" type="submit">
            Create event
          </button>
        </form>
      </div>

      {/* EXISTING EVENTS */}
      <h2 style={{ marginTop: 36 }}>
        Existing events ({events.length})
      </h2>

      {events.length === 0 && (
        <div className="card">
          <p className="muted">
            No events have been created yet.
          </p>
        </div>
      )}

      <div className="admin-list">
        {events.map((event) => {
          const photos = event.galleryItems;

          // Prefer a standalone event cover.
          const coverAsset = event.coverMediaId
            ? assetMap.get(event.coverMediaId)
            : null;

          const validCoverAsset =
            coverAsset?.contentType.startsWith('image/')
              ? coverAsset
              : null;

          // Otherwise automatically select the first valid event photograph.
          const fallbackPhoto = photos.find((photo) =>
            assetMap.get(photo.imageMediaId)?.contentType.startsWith('image/')
          );

          const fallbackAsset = fallbackPhoto
            ? assetMap.get(fallbackPhoto.imageMediaId)
            : null;

          const displayCoverAsset = validCoverAsset || fallbackAsset;

          const displayCoverAlt = validCoverAsset
            ? event.title
            : fallbackPhoto?.altText || event.title;

          return (
            <article
              className="card"
              key={event.id}
              style={{ marginTop: 20 }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 20,
                  flexWrap: 'wrap',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ flex: '1 1 260px' }}>
                  {displayCoverAsset ? (
                    <img
                      src={`/api/media/${displayCoverAsset.id}`}
                      alt={displayCoverAlt}
                      style={{
                        width: '100%',
                        maxWidth: 360,
                        height: 210,
                        objectFit: 'cover',
                        borderRadius: 10,
                        marginBottom: 12
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 360,
                        height: 150,
                        borderRadius: 10,
                        background: 'var(--surface, #eee)',
                        display: 'grid',
                        placeItems: 'center',
                        marginBottom: 12
                      }}
                    >
                      <span className="muted">
                        No cover photograph yet
                      </span>
                    </div>
                  )}

                  <p className="eyebrow mono">
                    {event.publicationStatus} · {event.category}
                  </p>

                  <h2>{event.title}</h2>

                  <p className="muted">
                    Slug: {event.slug}
                  </p>

                  <p className="muted">
                    Date: {event.date
                      ? event.date.toLocaleDateString('en-GB')
                      : 'Not specified'}
                  </p>

                  <p className="muted">
                    Photographs: {photos.length}
                  </p>

                  <p className="muted">
                    Cover: {validCoverAsset
                      ? 'Separate uploaded cover'
                      : fallbackPhoto
                        ? 'Automatically selected from event photographs'
                        : 'Not available'}
                  </p>

                  {event.description && (
                    <p>{event.description}</p>
                  )}
                </div>

                <div style={{ flex: '2 1 340px' }}>
                  {/* EDIT EVENT */}
                  <details>
                    <summary
                      style={{
                        cursor: 'pointer',
                        fontWeight: 600,
                        marginBottom: 14
                      }}
                    >
                      Edit event details
                    </summary>

                    <form
                      action={saveGalleryEventAction}
                      className="admin-form"
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={event.id}
                      />

                      <label>
                        Event title
                        <input
                          name="title"
                          required
                          defaultValue={event.title}
                        />
                      </label>

                      <label>
                        Event URL slug
                        <input
                          name="slug"
                          required
                          pattern="[a-z0-9]+(-[a-z0-9]+)*"
                          defaultValue={event.slug}
                        />
                      </label>

                      <label>
                        Event date
                        <input
                          type="date"
                          name="date"
                          defaultValue={dateValue(event.date)}
                        />
                      </label>

                      <label>
                        Category
                        <input
                          name="category"
                          required
                          defaultValue={event.category}
                        />
                      </label>

                      <label>
                        Description
                        <textarea
                          name="description"
                          rows={4}
                          defaultValue={event.description ?? ''}
                        />
                      </label>

                      {/* OPTIONAL REPLACEABLE EVENT COVER */}
                      <DirectMediaUpload
                        name="coverMediaId"
                        accept="image/jpeg,image/png,image/webp"
                        label="Event cover image (optional)"
                        existingId={event.coverMediaId}
                      />

                      <label>
                        Display order
                        <input
                          type="number"
                          name="sortOrder"
                          min="0"
                          max="9999"
                          defaultValue={event.sortOrder}
                        />
                      </label>

                      <label>
                        Publication status
                        <select
                          name="publicationStatus"
                          defaultValue={event.publicationStatus}
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
                        Save event changes
                      </button>
                    </form>
                  </details>

                  {/* ADD PHOTOS */}
                  <details style={{ marginTop: 24 }}>
                    <summary
                      style={{
                        cursor: 'pointer',
                        fontWeight: 600,
                        marginBottom: 14
                      }}
                    >
                      Add photographs to this event
                    </summary>

                    <form
                      action={addGalleryPhotosAction}
                      className="admin-form"
                    >
                      <input
                        type="hidden"
                        name="galleryEventId"
                        value={event.id}
                      />

                      <DirectMediaUpload
                        name="imageMediaIds"
                        accept="image/jpeg,image/png,image/webp"
                        label="Select photographs (up to 10)"
                        multiple={true}
                        maxFiles={10}
                      />

                      <button
                        className="button button-primary"
                        type="submit"
                      >
                        Add photographs
                      </button>
                    </form>
                  </details>

                  {/* EVENT PHOTOGRAPHS */}
                  <h3 style={{ marginTop: 24 }}>
                    Event photographs ({photos.length})
                  </h3>

                  {photos.length === 0 && (
                    <p className="muted">
                      No photographs attached. You can upload them later.
                    </p>
                  )}

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: 14
                    }}
                  >
                    {photos.map((photo) => {
                      const asset = assetMap.get(photo.imageMediaId);

                      const isCover =
                        event.coverMediaId === photo.imageMediaId;

                      return (
                        <div
                          key={photo.id}
                          style={{
                            border: '1px solid var(--border, #ddd)',
                            borderRadius: 10,
                            padding: 10,
                            minWidth: 0
                          }}
                        >
                          {asset?.contentType.startsWith('image/') && (
                            <img
                              src={`/api/media/${asset.id}`}
                              alt={photo.altText}
                              style={{
                                width: '100%',
                                height: 130,
                                objectFit: 'cover',
                                borderRadius: 7
                              }}
                            />
                          )}

                          <p style={{ fontWeight: 600 }}>
                            {photo.title}
                          </p>

                          <p className="muted">
                            {photo.publicationStatus}
                          </p>

                          {isCover && (
                            <p className="eyebrow">
                              Current manual photo cover
                            </p>
                          )}

                          {!isCover && (
                            <form
                              action={setGalleryEventCoverAction}
                            >
                              <input
                                type="hidden"
                                name="galleryEventId"
                                value={event.id}
                              />

                              <input
                                type="hidden"
                                name="imageMediaId"
                                value={photo.imageMediaId}
                              />

                              <button
                                className="button"
                                type="submit"
                              >
                                Set as cover
                              </button>
                            </form>
                          )}

                          <form
                            action={deleteGalleryPhotoAction}
                            style={{ marginTop: 8 }}
                          >
                            <input
                              type="hidden"
                              name="id"
                              value={photo.id}
                            />

                            <ConfirmSubmitButton
                              confirmation="Remove this photograph from the event? The original media file will be preserved."
                            >
                              Remove photo
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      );
                    })}
                  </div>

                  {/* DELETE EVENT */}
                  <form
                    action={deleteGalleryEventAction}
                    style={{ marginTop: 28 }}
                  >
                    <input
                      type="hidden"
                      name="id"
                      value={event.id}
                    />

                    <ConfirmSubmitButton
                      confirmation="Delete this event? Its photographs will be preserved as unassigned gallery items."
                    >
                      Delete event
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* UNASSIGNED PHOTOGRAPHS */}
      <section style={{ marginTop: 40 }}>
        <h2>
          Unassigned photographs ({unassignedItems.length})
        </h2>

        <p className="muted">
          These photographs are not currently linked to an event.
          This section also preserves visibility of older gallery items
          that have not yet been assigned to an event.
        </p>

        {unassignedItems.length === 0 ? (
          <p className="muted">
            No unassigned photographs.
          </p>
        ) : (
          <div className="admin-list">
            {unassignedItems.map((item) => {
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
                            width: 150,
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 8,
                            marginBottom: 10
                          }}
                        />
                      )}

                      <p className="eyebrow mono">
                        {item.publicationStatus} · {item.category}
                      </p>

                      <h3>{item.title}</h3>

                      <p className="muted">
                        Previous event name: {item.eventName || 'None'}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
