import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function generateUniqueUsername(base: string): Promise<string> {
  const username = base.toLowerCase().replace(/\s+/g, '');
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? username : `${username}${suffix}`;
    const existing = await prisma.user.findUnique({
      where: { username: candidate }
    });

    if (!existing) return candidate;
    suffix++;
  }
}
