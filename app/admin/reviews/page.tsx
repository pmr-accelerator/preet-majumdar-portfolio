
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';
import {
  moderateReviewAction,
  editReviewAction,
  deleteReviewAction,
} from '../actions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Manage Reviews',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminReviewsPage() {
  await requireAdmin();

  const reviews = await prisma.review.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  });

  const pending = reviews.filter(
    (review) =>
      review.status === 'PENDING' &&
      review.verificationStatus === 'VERIFIED'
  ).length;

  const approved = reviews.filter(
    (review) => review.status === 'APPROVED'
  ).length;

  const unverified = reviews.filter(
    (review) => review.verificationStatus !== 'VERIFIED'
  ).length;

  return (
    <section
      className="wrap"
      style={{
        paddingBlock: 40,
        minHeight: '75vh',
      }}
    >
      <p className="eyebrow mono">PRIVATE CMS / REVIEW MODERATION</p>

      <h1
        style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
          letterSpacing: '-.05em',
        }}
      >
        Manage reviews
      </h1>

      <p className="muted" style={{ lineHeight: 1.8 }}>
        Review submissions, verify email status, edit feedback, and decide
        which reviews are published on your portfolio.
      </p>

      <Link className="button" href="/admin">
        ← Back to dashboard
      </Link>

      {/* REVIEW STATISTICS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
          marginTop: 25,
          marginBottom: 30,
        }}
      >
        {[
          ['Total loaded', reviews.length],
          ['Awaiting moderation', pending],
          ['Approved', approved],
          ['Email not verified', unverified],
        ].map(([label, count]) => (
          <div className="card" key={label}>
            <p className="muted" style={{ fontSize: '.85rem' }}>
              {label}
            </p>
            <p
              style={{
                fontSize: '2.2rem',
                margin: '10px 0 0',
              }}
            >
              {count}
            </p>
          </div>
        ))}
      </div>

      {/* REVIEW LIST */}
      <div className="admin-list">
        {reviews.length === 0 ? (
          <div className="card">
            <h2>No reviews yet</h2>
            <p className="muted">
              Public submissions will appear here after they are received.
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <article
              className="card"
              key={review.id}
              style={{
                marginBottom: 18,
                overflowWrap: 'anywhere',
              }}
            >
              {/* REVIEW DETAILS */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <p className="eyebrow mono">
                    {review.createdAt.toLocaleString('en-IN')}
                  </p>

                  <h2 style={{ marginBlock: 8 }}>
                    {review.name}
                  </h2>

                  <p className="muted">
                    {review.designation || 'No designation provided'}
                  </p>

                  <p>
                    <strong>Rating:</strong>{' '}
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                    {' '}({review.rating}/5)
                  </p>
                </div>

                <div>
                  <p>
                    <strong>Status:</strong> {review.status}
                  </p>
                  <p>
                    <strong>Email:</strong>{' '}
                    {review.verificationStatus}
                  </p>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border, #30363c)',
                  marginTop: 15,
                  paddingTop: 15,
                }}
              >
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                  {review.content}
                </p>

                <p className="muted" style={{ fontSize: '.85rem' }}>
                  Private email: {review.email}
                </p>

                {review.linkedInUrl && (
                  <p>
                    <a
                      href={review.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View LinkedIn profile ↗
                    </a>
                  </p>
                )}

                {review.emailVerifiedAt && (
                  <p className="muted" style={{ fontSize: '.85rem' }}>
                    Email verified:{' '}
                    {review.emailVerifiedAt.toLocaleString('en-IN')}
                  </p>
                )}
              </div>

              {/* MODERATION */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 10,
                  marginTop: 20,
                }}
              >
                <form action={moderateReviewAction}>
                  <input
                    type="hidden"
                    name="id"
                    value={review.id}
                  />
                  <input
                    type="hidden"
                    name="status"
                    value="APPROVED"
                  />
                  <button
                    className="button button-primary"
                    type="submit"
                    disabled={review.verificationStatus !== 'VERIFIED'}
                    style={{ width: '100%' }}
                  >
                    Approve
                  </button>
                </form>

                <form action={moderateReviewAction}>
                  <input
                    type="hidden"
                    name="id"
                    value={review.id}
                  />
                  <input
                    type="hidden"
                    name="status"
                    value="REJECTED"
                  />
                  <button
                    className="button"
                    type="submit"
                    disabled={review.verificationStatus !== 'VERIFIED'}
                    style={{ width: '100%' }}
                  >
                    Reject
                  </button>
                </form>
              </div>

              {/* EDIT REVIEW */}
              <details style={{ marginTop: 20 }}>
                <summary
                  style={{
                    cursor: 'pointer',
                    fontWeight: 600,
                    paddingBlock: 10,
                  }}
                >
                  Edit review
                </summary>

                <form
                  action={editReviewAction}
                  className="admin-form"
                  style={{
                    display: 'grid',
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  <input
                    type="hidden"
                    name="id"
                    value={review.id}
                  />

                  <label>
                    Name
                    <input
                      type="text"
                      name="name"
                      defaultValue={review.name}
                      required
                      minLength={2}
                      maxLength={100}
                    />
                  </label>

                  <label>
                    Designation / Relationship
                    <input
                      type="text"
                      name="designation"
                      defaultValue={review.designation ?? ''}
                      maxLength={150}
                    />
                  </label>

                  <label>
                    Rating
                    <select
                      name="rating"
                      defaultValue={String(review.rating)}
                      required
                    >
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <option
                          key={rating}
                          value={rating}
                        >
                          {rating} / 5
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Feedback
                    <textarea
                      name="content"
                      defaultValue={review.content}
                      required
                      minLength={10}
                      maxLength={2000}
                      rows={5}
                    />
                  </label>

                  <label>
                    LinkedIn URL
                    <input
                      type="url"
                      name="linkedInUrl"
                      defaultValue={review.linkedInUrl ?? ''}
                      placeholder="https://www.linkedin.com/in/..."
                    />
                  </label>

                  <button
                    className="button button-primary"
                    type="submit"
                  >
                    Save changes
                  </button>
                </form>
              </details>

              {/* DELETE REVIEW */}
              <form
                action={deleteReviewAction}
                style={{ marginTop: 15 }}
              >
                <input
                  type="hidden"
                  name="id"
                  value={review.id}
                />
                <button
                  className="button"
                  type="submit"
                >
                  Delete review
                </button>
              </form>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
