import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

const COOKIE_NAME = 'preet_admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 8;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32 || value.includes('replace-with')) throw new Error('AUTH_SECRET must be configured with a long random value.');
  return value;
}
function signature(payload: string) { return createHmac('sha256', secret()).update(payload).digest('base64url'); }

export function createSessionToken(adminId: string, expiresAt: number) {
  const payload = `${adminId}.${expiresAt}`;
  return `${payload}.${signature(payload)}`;
}

function verifyToken(token: string): { adminId: string; expiresAt: number } | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [adminId, expiryRaw, suppliedSignature] = parts;
  const expiresAt = Number(expiryRaw);
  if (!adminId || !Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return null;
  const expected = Buffer.from(signature(`${adminId}.${expiryRaw}`));
  const supplied = Buffer.from(suppliedSignature);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
  return { adminId, expiresAt };
}

export async function setAdminSession(adminId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createSessionToken(adminId, expiresAt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, maxAge: 0 };
  cookieStore.set(COOKIE_NAME, '', { ...options, path: '/' });
  cookieStore.set(COOKIE_NAME, '', { ...options, path: '/admin' });
}

export async function getAdmin() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  let parsed: ReturnType<typeof verifyToken>;
  try { parsed = verifyToken(token); } catch { return null; }
  if (!parsed) return null;
  return prisma.adminUser.findFirst({ where: { id: parsed.adminId, active: true }, select: { id: true, name: true, email: true } });
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}
