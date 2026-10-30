import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const rl = createInterface({ input: stdin, output: stdout });
try {
  const existing = await prisma.adminUser.count();
  if (existing > 0) throw new Error('An administrator already exists. This bootstrap command only works on an installation with zero administrator accounts.');
  const name = (await rl.question('Administrator display name: ')).trim();
  const email = (await rl.question('Administrator email: ')).trim().toLowerCase();
  const password = await rl.question('Strong password (minimum 14 characters): ');
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid name and email are required.');
  if (password.length < 14 || password.length > 200) throw new Error('Password must be between 14 and 200 characters.');
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.create({ data: { name, email, passwordHash } });
  console.log(`Administrator created for ${email}. Keep the credentials private.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Administrator setup failed.');
  process.exitCode = 1;
} finally {
  rl.close();
  await prisma.$disconnect();
}
