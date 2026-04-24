import type { IBoardRepository } from '../../index';
import { prisma } from '../client';
import { rowToBoard } from '../mappers';

export const prismaBoardRepo: IBoardRepository = {
  async get(id) {
    const row = await prisma.board.findUnique({ where: { id } });
    return row ? rowToBoard(row) : null;
  },

  async list() {
    const rows = await prisma.board.findMany({
      orderBy: [{ created_at: 'asc' }]
    });
    return rows.map(rowToBoard);
  }
};
