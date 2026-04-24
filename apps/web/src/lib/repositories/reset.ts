/**
 * Server-side: reset + re-seed del tablero de demo.
 * Sólo importado desde server actions.
 */

import {
  seedBoard,
  seedCards,
  seedLists,
  seedUsers
} from '../seed';
import { getRepos } from './index';

export async function resetAndSeed(): Promise<void> {
  const layer = (process.env.DATA_LAYER ?? 'prisma').toLowerCase();

  if (layer !== 'prisma') {
    // memoryRepos: el bundle guarda estado mutable; no podemos "resetear"
    // sin tocar su interno. Para demo lo dejamos como no-op warn.
    console.warn(
      '[resetAndSeed] DATA_LAYER != prisma; sin implementación. Reinicia el server.'
    );
    return;
  }

  // Import dinámico del cliente Prisma (sólo server).
  const { prisma } = await import('@artemis/db');

  await prisma.$transaction([
    prisma.comment.deleteMany(),
    prisma.attachment.deleteMany(),
    prisma.card.deleteMany(),
    prisma.list.deleteMany(),
    prisma.board.deleteMany(),
    prisma.user.deleteMany(),
    prisma.project.deleteMany()
  ]);

  // Project (no existe en apps/web/src/lib/seed.ts, lo derivamos del board)
  await prisma.project.create({
    data: {
      id: seedBoard.project_id,
      title: 'GOLDEN HOUR',
      code: 'GLDN-S01',
      client: 'Atresplayer Premium'
    }
  });

  const repos = getRepos();

  for (const u of seedUsers) {
    // memoryRepos.users no tiene create; pasamos por Prisma directo.
    await prisma.user.create({ data: u });
  }

  await prisma.board.create({
    data: { ...seedBoard, created_at: new Date(seedBoard.created_at) }
  });

  for (const l of seedLists) {
    await repos.lists.create(l);
  }

  for (const c of seedCards) {
    await repos.cards.create({
      ...c,
      due_date: c.due_date
    });
  }
}
