import type { Metadata } from 'next';
import { verifyReviewEmailAction } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Verify Your Email | Portfolio Reviews',
  robots: {
    index: false,
    follow: false,
  },
};

type VerifyPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function VerifyReviewPage({
  searchParams,
}: VerifyPageProps) {
  const { token } = await searchParams;

  const isValidToken = Boolean(
    token && /^[a-f0-9]{64}$/i.test(token)
  );

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-6 py-20">
      <section className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
          Email verification
        </p>

        <h1 className="mb-4 text-3xl font-semibold">
          Confirm your email address
        </h1>

        {isValidToken ? (
          <>
            <p className="mb-8 text-sm leading-7 text-white/65">
              Click the button below to verify your email address
              and complete your review submission. Your review will
              remain private until it is approved.
            </p>

            <form action={verifyReviewEmailAction}>
              <input
                type="hidden"
                name="token"
                value={token}
              />

              <button
                type="submit"
                className="rounded-full bg-emerald-400 px-7 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
              >
                Verify my email
              </button>
            </form>

            <p className="mt-6 text-xs text-white/45">
              This verification link expires after 30 minutes.
            </p>
          </>
        ) : (
          <>
            <p className="mb-8 text-sm leading-7 text-white/65">
              This verification link is missing or invalid.
              Please return to the reviews page.
            </p>

            <a
              href="/reviews"
              className="inline-flex rounded-full border border-white/20 px-7 py-3 text-sm font-medium transition hover:bg-white/10"
            >
              Return to reviews
            </a>
          </>
        )}
      </section>
    </main>
  );
}