'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { setAdminSession } from '@/lib/admin-session';

const loginSchema = z.object({ email: z.email().transform(v => v.trim().toLowerCase()), password: z.string().min(1).max(200) });

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) redirect('/admin/login?error=invalid');
  const admin = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (!admin || !admin.active || !(await bcrypt.compare(parsed.data.password, admin.passwordHash))) redirect('/admin/login?error=invalid');
  await setAdminSession(admin.id);
  redirect('/admin');
}
