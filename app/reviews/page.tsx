
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { submitReviewAction } from './actions';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 6;

type ReviewsPageProps = {
  searchParams: Promise<{
    page?: string;
    submission?: string;
    verification?: string;
  }>;
};

const submissionMessages: Record<string, string> = {
  invalid: 'Please check your details and submit the form again.',
  received: 'If your submission was accepted, check your email for verification instructions.',
  unavailable: 'Email verification is temporarily unavailable. Please try again later.',
  limited: 'Submission limit reached. Please try again after some time.',
  'verification-sent': 'Verification email sent. Please check your inbox.',
};

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const params = await searchParams;
  const requestedPage = Math.max(1, Number(params.page) || 1);

  const [total, aggregate] = await Promise.all([
    prisma.review.count({
      where: { status: 'APPROVED' },
    }),
    prisma.review.aggregate({
      where: { status: 'APPROVED' },
      _avg: { rating: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const reviews = await prisma.review.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      designation: true,
      rating: true,
      content: true,
      createdAt: true,
    },
  });

  const averageRating = aggregate._avg.rating
    ? aggregate._avg.rating.toFixed(1)
    : '—';

  return (
    <main className="wrap" style={{ paddingBlock: '70px 100px' }}>
      <header style={{ marginBottom: 42 }}>
        <p className="eyebrow mono">PORTFOLIO / REVIEWS</p>
        <h1 style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)', letterSpacing: '-.06em', margin: '14px 0' }}>
          Words from people.
        </h1>
        <p className="muted" style={{ maxWidth: 650, lineHeight: 1.8 }}>
          Feedback and experiences shared by people who have interacted with
          my academic, technical, and collaborative work.
        </p>
      </header>
      <div style={{ marginBottom: 28 }}>
        <Link
          href="#submit-review"
          className="button button-primary"
        >
          Write a Review
        </Link>
      </div>
      {params.verification === 'success' && (
        <p className="card" role="status">
          Your email has been verified. Your review is now awaiting moderation.
        </p>
      )}

      {params.verification === 'expired' && (
        <p className="card" role="status">
          This verification link has expired. Please submit your review again.
        </p>
      )}

      {params.verification === 'invalid' && (
        <p className="card" role="status">
          This verification link is invalid or has already been used.
        </p>
      )}

      {params.submission && submissionMessages[params.submission] && (
        <p className="card" role="status" style={{ marginBottom: 24 }}>
          {submissionMessages[params.submission]}
        </p>
      )}

      <section className="card" style={{ marginBottom: 48 }}>
        <p className="eyebrow mono">COMMUNITY FEEDBACK</p>
        <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.8rem', margin: '8px 0' }}>{averageRating} / 5</h2>
            <p className="muted">Average rating</p>
          </div>
          <div>
            <h2 style={{ fontSize: '2.8rem', margin: '8px 0' }}>{total}</h2>
            <p className="muted">Published reviews</p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 70 }}>
        <div className="section-heading">
          <p className="eyebrow mono">PUBLISHED REVIEWS</p>
          <h2>Shared experiences</h2>
        </div>

        {reviews.length === 0 ? (
          <p className="muted">No published reviews yet.</p>
        ) : (
          <div className="content-grid">
            {reviews.map((review) => (
              <article className="card" key={review.id}>
                <p
                  aria-label={`${review.rating} out of 5 stars`}
                  style={{ color: 'var(--accent)', letterSpacing: 3 }}
                >
                  {'★'.repeat(review.rating)}
                  <span style={{ color: 'var(--line)' }}>
                    {'★'.repeat(5 - review.rating)}
                  </span>
                </p>
                <blockquote style={{ margin: '18px 0', lineHeight: 1.8 }}>
                  “{review.content}”
                </blockquote>
                <h3 style={{ marginBottom: 4 }}>{review.name}</h3>
                {review.designation && (
                  <p className="muted" style={{ fontSize: '.9rem' }}>
                    {review.designation}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Review pages"
            style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 30 }}
          >
            {currentPage > 1 && (
              <Link className="button" href={`/reviews?page=${currentPage - 1}`}>
                Previous
              </Link>
            )}
            <span className="muted mono">
              PAGE {currentPage} / {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link className="button" href={`/reviews?page=${currentPage + 1}`}>
                Next
              </Link>
            )}
          </nav>
        )}
      </section>

      <section className="card" id="submit-review">
        <p className="eyebrow mono">LEAVE A REVIEW</p>
        <h2 style={{ margin: '12px 0' }}>Share your feedback.</h2>
        <p className="muted" style={{ lineHeight: 1.8, marginBottom: 28 }}>
          Your email address is private and will only be used for verification.
          Reviews are published only after email verification and admin approval.
        </p>

        <form action={submitReviewAction} className="admin-form">
          <label>
            Your name
            <input name="name" type="text" minLength={2} maxLength={100} required />
          </label>

          <label>
            Designation / Relationship
            <input
              name="designation"
              type="text"
              maxLength={150}
              placeholder="e.g. Student, Faculty, Collaborator"
            />
          </label>

          <label>
            Email address (private)
            <input name="email" type="email" maxLength={254} required />
          </label>

          <label>
            Rating
            <select name="rating" defaultValue="5" required>
              <option value="5">5 — Excellent</option>
              <option value="4">4 — Very good</option>
              <option value="3">3 — Good</option>
              <option value="2">2 — Fair</option>
              <option value="1">1 — Needs improvement</option>
            </select>
          </label>

          <label>
            Your feedback
            <textarea
              name="content"
              minLength={10}
              maxLength={2000}
              rows={6}
              required
              placeholder="Write about your experience..."
            />
          </label>

          <label>
            LinkedIn profile URL (optional)
            <input
              name="linkedInUrl"
              type="url"
              placeholder="https://www.linkedin.com/in/..."
            />
          </label>

          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              overflow: 'hidden',
              clipPath: 'inset(50%)',
            }}
          >
            <label>
              Leave this field empty
              <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <button className="button button-primary" type="submit">
            Submit review
          </button>
        </form>
      </section>

      <p style={{ marginTop: 28 }}>
        <Link href="/" className="text-link">← Back to homepage</Link>
      </p>
    </main>
  );
}
