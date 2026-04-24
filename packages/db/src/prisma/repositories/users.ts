import type { IUserRepository } from '../../index';
import { prisma } from '../client';
import { rowToUser } from '../mappers';

export const prismaUserRepo: IUserRepository = {
  async list() {
    const rows = await prisma.user.findMany({ orderBy: [{ name: 'asc' }] });
    return rows.map(rowToUser);
  },

  async current() {
    // Stub hasta Sprint 3 (NextAuth). Devolvemos el art_director como "yo".
    const row = await prisma.user.findFirst({
      where: { role: 'art_director' }
    });
    if (!row) throw new Error('No art_director user seeded');
    return rowToUser(row);
  }
};
