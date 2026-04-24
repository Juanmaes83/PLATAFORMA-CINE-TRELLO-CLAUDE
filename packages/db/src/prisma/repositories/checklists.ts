import { Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import type { IChecklistRepository } from '../../index';
import { prisma } from '../client';
import { rowToChecklist } from '../mappers';

export const prismaChecklistRepo: IChecklistRepository = {
  async listByBoard(boardId) {
    // Todos los checklists cuyas cards pertenezcan a este board.
    const rows = await prisma.checklist.findMany({
      where: { card: { board_id: boardId } },
      orderBy: [{ position: 'asc' }]
    });
    return rows.map(rowToChecklist);
  },

  async create(input) {
    const id = input.id ?? `ck_${nanoid(8)}`;
    const row = await prisma.checklist.create({
      data: {
        id,
        card_id: input.card_id,
        title: input.title,
        items: (input.items ?? []) as unknown as Prisma.InputJsonValue,
        position: input.position
      }
    });
    return rowToChecklist(row);
  },

  async update(id, patch) {
    const data: Record<string, unknown> = {};
    if (patch.title !== undefined) data.title = patch.title;
    if (patch.items !== undefined)
      data.items = patch.items as unknown as Prisma.InputJsonValue;
    if (patch.position !== undefined) data.position = patch.position;
    if (patch.card_id !== undefined) data.card_id = patch.card_id;
    const row = await prisma.checklist.update({ where: { id }, data });
    return rowToChecklist(row);
  },

  async remove(id) {
    await prisma.checklist.delete({ where: { id } });
  }
};
