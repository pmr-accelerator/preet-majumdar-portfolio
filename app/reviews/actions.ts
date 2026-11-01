
'use server';

import { createHash, createHmac, randomBytes } from 'node:crypto';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const reviewSchema = z.object({
  name: z.string().trim().min(2).max(100),
  designation: z.string().trim().max(150).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  content: z.string().trim().min(10).max(2000),
  email: z.string().trim().email().max(254),
  linkedInUrl: z.string().trim().url().optional().or(z.literal('')),
  website: z.string().max(0).optional(),
});

const TOKEN_EXPIRY_MS = 30 * 60 * 1000;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 3;

function getAppUrl() {
  const value = process.env.APP_URL;

  if (!value) throw new Error('APP_URL is not configured.');

  const url = new URL(value);

  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
    throw new Error('APP_URL must use HTTPS in production.');
  }

  return url.origin;
}

function getIpHash(ip: string) {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET is not configured correctly.');
  }

  return createHmac('sha256', secret).update(ip).digest('hex');
}

export async function submitReviewAction(formData: FormData) {
  const parsed = reviewSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsed.success) redirect('/reviews?submission=invalid');

  const data = parsed.data;

  if (data.website) redirect('/reviews?submission=received');

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !from) {
    redirect('/reviews?submission=unavailable');
  }

  const appUrl = getAppUrl();
  const normalizedEmail = data.email.toLowerCase();

  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
  const ipHash = getIpHash(ip);

  const windowStart = new Date(Date.now() - RATE_WINDOW_MS);

  const recentAttempts = await prisma.reviewSubmissionAttempt.count({
    where: {
      ipHash,
      createdAt: { gte: windowStart },
    },
  });

  if (recentAttempts >= MAX_SUBMISSIONS_PER_WINDOW) {
    redirect('/reviews?submission=limited');
  }

  await prisma.reviewSubmissionAttempt.create({
    data: { ipHash },
  });

  const existing = await prisma.review.findFirst({
    where: {
      email: normalizedEmail,
      status: { in: ['PENDING', 'APPROVED'] },
      createdAt: { gte: windowStart },
    },
    select: { id: true },
  });

  if (existing) redirect('/reviews?submission=received');

  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  const review = await prisma.review.create({
    data: {
      name: data.name,
      designation: data.designation || null,
      rating: data.rating,
      content: data.content,
      email: normalizedEmail,
      linkedInUrl: data.linkedInUrl || null,
      verificationStatus: 'UNVERIFIED',
      verificationTokenHash: tokenHash,
      verificationExpiresAt: expiresAt,
      status: 'PENDING',
    },
  });

  const verificationUrl = new URL('/reviews/verify', appUrl);
  verificationUrl.searchParams.set('token', token);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [normalizedEmail],
        subject: 'Verify your portfolio review',
        text: [
          `Hello ${data.name},`,
          '',
          'Please verify your email address to complete your review submission.',
          '',
          `Verify email: ${verificationUrl.toString()}`,
          '',
          'This link expires in 30 minutes.',
          'Your review will remain private until it is approved by the portfolio owner.',
          '',
          'If you did not submit this review, you can ignore this email.',
        ].join('\n'),
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
  const errorBody = await response.text();

  console.error('Resend email error:', {
    status: response.status,
    response: errorBody,
  });

  throw new Error(`Resend returned ${response.status}`);
}
  } catch (error) {
  console.error('Review verification email failed:', error);

  await prisma.review.delete({ where: { id: review.id } });
  redirect('/reviews?submission=unavailable');
}

  redirect('/reviews?submission=verification-sent');
}
