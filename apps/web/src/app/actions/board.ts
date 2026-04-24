'use server';

/**
 * Server Actions de Artemis.
 * Son el único bridge permitido entre el store (cliente) y el repositorio
 * (server, que habla con Postgres vía Prisma).
 *
 * Patrón: optimistic en cliente; aquí sólo persistimos. Si algo peta,
 * lanzamos y el store revierte + muestra toast.
 */

import type { Card, Checklist, List } from '@artemis/types';
import { getRepos } from '../../lib/repositories';

/* ============================ Lectura ============================ */

export async function loadBoardState() {
  const repos = getRepos();
  const boards = await repos.boards.list();
  const board = boards[0];
  if (!board) {
    throw new Error(
      'No hay ningún board en la base. Ejecuta `pnpm prisma db seed` en packages/db.'
    );
  }
  const [lists, cards, users, checklists] = await Promise.all([
    repos.lists.list(board.id),
    repos.cards.list(board.id),
    repos.users.list(),
    repos.checklists.listByBoard(board.id)
  ]);
  return { board, lists, cards, users, checklists };
}

/* ============================ Cards ============================ */

export async function actionCreateCard(
  input: Omit<Card, 'created_at' | 'updated_at'> & { id?: string }
): Promise<Card> {
  return getRepos().cards.create(input);
}

export async function actionUpdateCard(
  id: string,
  patch: Partial<Card>
): Promise<Card> {
  return getRepos().cards.update(id, patch);
}

export async function actionDeleteCard(id: string): Promise<void> {
  await getRepos().cards.remove(id);
}

export async function actionMoveCard(
  id: string,
  toListId: string,
  position: number
): Promise<Card> {
  return getRepos().cards.move(id, toListId, position);
}

export async function actionReorderCards(
  listId: string,
  orderedIds: string[]
): Promise<void> {
  await getRepos().cards.reorder(listId, orderedIds);
}

/* ============================ Lists ============================ */

export async function actionCreateList(
  input: Omit<List, 'id'> & { id?: string }
): Promise<List> {
  return getRepos().lists.create(input);
}

export async function actionUpdateList(
  id: string,
  patch: Partial<List>
): Promise<List> {
  return getRepos().lists.update(id, patch);
}

export async function actionDeleteList(id: string): Promise<void> {
  await getRepos().lists.remove(id);
}

/* ============================ Checklists ============================ */

export async function actionCreateChecklist(
  input: Omit<Checklist, 'id'> & { id?: string }
): Promise<Checklist> {
  return getRepos().checklists.create(input);
}

export async function actionUpdateChecklist(
  id: string,
  patch: Partial<Checklist>
): Promise<Checklist> {
  return getRepos().checklists.update(id, patch);
}

export async function actionDeleteChecklist(id: string): Promise<void> {
  await getRepos().checklists.remove(id);
}

/* ============================ Reset demo ============================ */

/**
 * Restaura el tablero a los datos seed. Pensado para la demo al primer
 * cliente (24-jul-2026): un click y vuelve a un estado conocido.
 * Implementación: delega en el seed de Prisma (importamos dinámicamente
 * para no añadir al bundle cliente el módulo de seed).
 */
export async function actionResetSeed(): Promise<void> {
  const { resetAndSeed } = await import('../../lib/repositories/reset');
  await resetAndSeed();
}

