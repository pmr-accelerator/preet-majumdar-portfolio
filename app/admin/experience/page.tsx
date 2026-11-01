import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import { ConfirmSubmitButton } from '@/components/confirm-submit-button';
import {
  saveExperienceAction,
  deleteExperienceAction
} from '../actions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Manage experience',
  robots: { index: false, follow: false }
};

function dateValue(date: Date | null) {
  if (!date) return '';
  return date.toISOString().slice(0, 10);
}

export default async function AdminExperiencePage({
  searchParams
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;

  const [items, editing] = await Promise.all([
    prisma.experience.findMany({
      orderBy: [
        { featured: 'desc' },
        { sortOrder: 'asc' },
        { updatedAt: 'desc' }
      ]
    }),
    params.edit
      ? prisma.experience.findUnique({
          where: { id: params.edit }
        })
      : Promise.resolve(null)
  ]);

  // Temporary diagnostic: check what the Next.js server reads.
  console.log(
    'EXPERIENCE ADMIN CHECK:',
    items.map(item => ({
      title: item.title,
      featured: item.featured,
      status: item.status,
      sortOrder: item.sortOrder
    }))
  );

  const e = editing;

  return (
    <section
      className="wrap"
      style={{ paddingBlock: 40, minHeight: '75vh' }}
    >
      <p className="eyebrow mono">PRIVATE CMS / EXPERIENCE</p>
      <h1>Manage Experience</h1>

      <p className="muted">
        Manage leadership roles, responsibilities, mentoring experience
        and their order on your public portfolio.
      </p>

      <Link className="button" href="/admin">
        ← Dashboard
      </Link>

      <div className="card" style={{ marginTop: 20 }}>
        <h2>{e ? 'Edit experience' : 'Add experience'}</h2>

        <form action={saveExperienceAction} className="admin-form">
          {e && (
            <input type="hidden" name="id" value={e.id} />
          )}

          <label>
            Role / Position
            <input
              name="title"
              required
              maxLength={160}
              defaultValue={e?.title ?? ''}
              placeholder="Vice President — College Council"
            />
          </label>

          <label>
            Organization
            <input
              name="organization"
              required
              maxLength={200}
              defaultValue={e?.organization ?? ''}
              placeholder="Elitte College of Engineering"
            />
          </label>

          <label>
            Start Date
            <input
              type="date"
              name="startDate"
              defaultValue={dateValue(e?.startDate ?? null)}
            />
          </label>

          <label>
            End Date
            <input
              type="date"
              name="endDate"
              defaultValue={dateValue(e?.endDate ?? null)}
            />
          </label>

          <label className="inline-check">
            <input
              type="checkbox"
              name="current"
              defaultChecked={e?.current ?? false}
            />
            Currently holding this position
          </label>

          <label className="inline-check">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={e?.featured ?? false}
            />
            Feature this experience on the public portfolio
          </label>

          <label>
            Description
            <textarea
              name="description"
              rows={4}
              maxLength={5000}
              defaultValue={e?.description ?? ''}
              placeholder="Briefly describe your role and contribution."
            />
          </label>

          <label>
            Responsibilities
            <textarea
              name="responsibilities"
              rows={6}
              maxLength={3000}
              defaultValue={e?.responsibilities.join('\n') ?? ''}
              placeholder={'Enter one responsibility per line:\nCoordinate activities\nSupport student initiatives'}
            />
          </label>

          <label>
            Teaching Subjects
            <input
              name="teachingSubjects"
              maxLength={1000}
              defaultValue={e?.teachingSubjects.join(', ') ?? ''}
              placeholder="C Programming, Programming Fundamentals"
            />
          </label>

          <label>
            Display Order
            <input
              type="number"
              name="sortOrder"
              min="0"
              max="9999"
              step="1"
              required
              defaultValue={e?.sortOrder ?? 0}
            />
            <span className="muted">
              Lower numbers appear first within the same featured group.
            </span>
          </label>

          <label>
            Publication Status
            <select
              name="status"
              defaultValue={e?.status ?? 'DRAFT'}
              required
            >
              <option value="DRAFT">Draft — Private</option>
              <option value="PUBLISHED">Published — Public</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>

          <button className="button button-primary" type="submit">
            {e ? 'Save Changes' : 'Create Experience'}
          </button>

          {e && (
            <Link href="/admin/experience" className="button">
              Cancel Edit
            </Link>
          )}
        </form>
      </div>

      <h2 style={{ marginTop: 32 }}>
        Existing Experience ({items.length})
      </h2>

      <div className="admin-list">
        {items.map(item => (
          <article className="card" key={item.id}>
            <div className="admin-row">
              <div>
                <p className="eyebrow mono">
                  {item.status} · ORDER {item.sortOrder}
                  {item.current ? ' · PRESENT' : ''}
                  {item.featured ? ' · FEATURED' : ''}
                </p>

                <h3>{item.title}</h3>

                <p className="muted">{item.organization}</p>

                {item.description && (
                  <p className="muted">{item.description}</p>
                )}
              </div>

              <div className="admin-actions">
                <Link
                  className="button"
                  href={`/admin/experience?edit=${item.id}`}
                >
                  Edit
                </Link>

                <form action={deleteExperienceAction}>
                  <input
                    type="hidden"
                    name="id"
                    value={item.id}
                  />
                  <ConfirmSubmitButton confirmation="Delete this experience entry permanently? This cannot be undone.">
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