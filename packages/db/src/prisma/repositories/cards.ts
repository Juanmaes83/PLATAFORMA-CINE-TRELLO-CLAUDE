import { Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import type { ICardRepository } from '../../index';
import { prisma } from '../client';
import { cardPatchToDb, rowToCard } from '../mappers';

export const prismaCardRepo: ICardRepository = {
  async list(boardId) {
    const rows = await prisma.card.findMany({
      where: { board_id: boardId },
      orderBy: [{ position: 'asc' }]
    });
    return rows.map(rowToCard);
  },

  async create(input) {
    const id = input.id ?? `c_${nanoid(8)}`;
    const row = await prisma.card.create({
      data: {
        id,
        list_id: input.list_id,
        board_id: input.board_id,
        parent_card_id: input.parent_card_id ?? null,
        position: input.position,
        title: input.title,
        description: input.description,
        cover_color: input.cover_color,
        scene_numbers: input.scene_numbers ?? [],
        script_reference: input.script_reference,
        art_metadata: (input.art_metadata as Prisma.InputJsonValue | undefined) ?? Prisma.JsonNull,
        assignee_ids: input.assignee_ids,
        due_date: input.due_date ? new Date(input.due_date) : null,
        priority: input.priority,
        labels: input.labels,
        estimated_cost: input.estimated_cost,
        actual_cost: input.actual_cost,
        approval_status: input.approval_status,
        created_by: input.created_by
      }
    });
    return rowToCard(row);
  },

  async update(id, patch) {
    const row = await prisma.card.update({
      where: { id },
      data: cardPatchToDb(patch)
    });
    return rowToCard(row);
  },

  async remove(id) {
    await prisma.card.delete({ where: { id } });
  },

  async move(id, toListId, position) {
    const row = await prisma.card.update({
      where: { id },
      data: { list_id: toListId, position }
    });
    return rowToCard(row);
  },

  async reorder(listId, orderedIds) {
    // Transacción: cada tarjeta recibe la posición de su índice.
    await prisma.$transaction(
      orderedIds.map((cardId, position) =>
        prisma.card.update({
          where: { id: cardId },
          data: { list_id: listId, position }
        })
      )
    );
  }
};
