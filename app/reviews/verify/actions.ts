'use server';

import { createHash } from 'node:crypto';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

function getAppUrl() {
  const value = process.env.APP_URL;

  if (!value) {
    throw new Error('APP_URL is not configured.');
  }

  const url = new URL(value);

  if (
    process.env.NODE_ENV === 'production' &&
    url.protocol !== 'https:'
  ) {
    throw new Error('APP_URL must use HTTPS in production.');
  }

  return url.origin;
}

export async function verifyReviewEmailAction(formData: FormData) {
  const token = String(formData.get('token') ?? '');
  const appUrl = getAppUrl();

  if (!/^[a-f0-9]{64}$/i.test(token)) {
    redirect(`${appUrl}/reviews?verification=invalid`);
  }

  const tokenHash = createHash('sha256')
    .update(token)
    .digest('hex');

  const now = new Date();

  // Atomically verify only if the token is still valid and unused.
  const result = await prisma.review.updateMany({
    where: {
      verificationTokenHash: tokenHash,
      verificationStatus: 'UNVERIFIED',
      verificationExpiresAt: {
        gt: now,
      },
    },
    data: {
      verificationStatus: 'VERIFIED',
      emailVerifiedAt: now,
      verificationTokenHash: null,
      verificationExpiresAt: null,
    },
  });

  if (result.count === 1) {
    redirect(`${appUrl}/reviews?verification=success`);
  }

  // Check whether this was a matching but expired token.
  const expiredReview = await prisma.review.findFirst({
    where: {
      verificationTokenHash: tokenHash,
      verificationStatus: 'UNVERIFIED',
      OR: [
        { verificationExpiresAt: null },
        { verificationExpiresAt: { lte: now } },
      ],
    },
    select: {
      id: true,
    },
  });

  if (expiredReview) {
    await prisma.review.updateMany({
      where: {
        id: expiredReview.id,
        verificationStatus: 'UNVERIFIED',
        verificationTokenHash: tokenHash,
      },
      data: {
        verificationTokenHash: null,
        verificationExpiresAt: null,
      },
    });

    redirect(`${appUrl}/reviews?verification=expired`);
  }

  redirect(`${appUrl}/reviews?verification=invalid`);
}