
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { saveDramaAction, deleteDramaAction } from '../actions';
import { ConfirmSubmitButton } from '@/components/confirm-submit-button';
import { DirectMediaUpload } from '@/components/direct-media-upload';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Manage drama productions',
  robots: { index: false, follow: false },
};

export default async function DramaAdmin({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;

  const [items, editing] = await Promise.all([
    prisma.dramaProduction.findMany({
      orderBy: { updatedAt: 'desc' },
    }),
    params.edit
      ? prisma.dramaProduction.findUnique({
          where: { id: params.edit },
        })
      : Promise.resolve(null),
  ]);

  const d = editing;

  return (
    <section
      className="wrap"
      style={{ paddingBlock: 40, minHeight: '75vh' }}
    >
      <p className="eyebrow mono">PRIVATE CMS / CULTURAL PRODUCTIONS</p>

      <h1>Drama productions</h1>

      <p className="muted">
        Add the actual titles and dates when you have them. Do not invent
        production details.
      </p>

      <Link className="button" href="/admin">
        ← Dashboard
      </Link>

      <div className="card" style={{ marginTop: 20 }}>
        <h2>{d ? 'Edit production' : 'Add production'}</h2>

        <form action={saveDramaAction} className="admin-form">
          {d && <input type="hidden" name="id" value={d.id} />}

          <label>
            Production title
            <input name="title" required defaultValue={d?.title} />
          </label>

          <label>
            Your role
            <input
              name="role"
              required
              defaultValue={d?.role ?? 'Director'}
            />
          </label>

          <label>
            College / department
            <input
              name="organization"
              required
              defaultValue={
                d?.organization ??
                'Elitte College of Engineering · Cultural Department'
              }
            />
          </label>

          <label>
            Production date (optional)
            <input
              type="date"
              name="productionDate"
              defaultValue={d?.productionDate?.toISOString().slice(0, 10)}
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              required
              rows={4}
              defaultValue={d?.description ?? ''}
            />
          </label>

          <label>
            Credits (comma-separated, optional)
            <input
              name="credits"
              defaultValue={d?.credits.join(', ') ?? ''}
            />
          </label>

          <DirectMediaUpload
            name="posterMediaId"
            accept="image/jpeg,image/png,image/webp"
            label="Poster / thumbnail image (optional)"
            existingId={d?.posterMediaId ?? null}
          />

          <label>
            Video URL or uploaded video URL (optional)
            <input
              type="url"
              name="videoUrl"
              defaultValue={d?.videoUrl ?? ''}
              placeholder="Paste YouTube/social link or uploaded media URL"
            />
          </label>

          <p className="muted">
            Upload the poster here. For full-length video, paste a hosted
            YouTube or other video URL.
          </p>

          <label>
            Publication
            <select
              name="publicationStatus"
              defaultValue={d?.publicationStatus ?? 'DRAFT'}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>

          <button className="button button-primary" type="submit">
            {d ? 'Save production' : 'Create production'}
          </button>

          {d && (
            <Link className="button" href="/admin/drama">
              Cancel edit
            </Link>
          )}
        </form>
      </div>

      <h2 style={{ marginTop: 32 }}>
        Productions ({items.length})
      </h2>

      <div className="admin-list">
        {items.map((i) => (
          <article className="card" key={i.id}>
            <div className="admin-row">
              <div>
                <p className="eyebrow mono">
                  {i.publicationStatus} · {i.role}
                </p>

                <h3>{i.title}</h3>

                <p className="muted">{i.organization}</p>
              </div>

              <div className="admin-actions">
                <Link
                  className="button"
                  href={`/admin/drama?edit=${i.id}`}
                >
                  Edit
                </Link>

                <form action={deleteDramaAction}>
                  <input type="hidden" name="id" value={i.id} />

                  <ConfirmSubmitButton confirmation="Delete this production permanently?">
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
