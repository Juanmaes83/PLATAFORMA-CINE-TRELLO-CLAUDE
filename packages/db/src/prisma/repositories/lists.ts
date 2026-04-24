import { nanoid } from 'nanoid';
import type { IListRepository } from '../../index';
import { prisma } from '../client';
import { rowToList } from '../mappers';

export const prismaListRepo: IListRepository = {
  async list(boardId) {
    const rows = await prisma.list.findMany({
      where: { board_id: boardId },
      orderBy: [{ position: 'asc' }]
    });
    return rows.map(rowToList);
  },

  async create(input) {
    const id = input.id ?? `l_${nanoid(8)}`;
    const row = await prisma.list.create({
      data: {
        id,
        board_id: input.board_id,
        title: input.title,
        position: input.position,
        workflow_type: input.workflow_type,
        wip_limit: input.wip_limit ?? null
      }
    });
    return rowToList(row);
  },

  async update(id, patch) {
    const row = await prisma.list.update({
      where: { id },
      data: {
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.position !== undefined && { position: patch.position }),
        ...(patch.workflow_type !== undefined && {
          workflow_type: patch.workflow_type
        }),
        ...(patch.wip_limit !== undefined && { wip_limit: patch.wip_limit })
      }
    });
    return rowToList(row);
  },

  async remove(id) {
    // onDelete: Cascade en schema.prisma elimina también las cards.
    await prisma.list.delete({ where: { id } });
  }
};
