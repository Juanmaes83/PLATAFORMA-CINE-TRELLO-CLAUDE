/**
 * ARTEMIS · Capa de repositorios
 * --------------------------------
 * Interfaces neutras consumidas por apps/web vía server actions.
 *
 * Implementaciones:
 *   - memoryRepos  (in-memory, útil para demos sin DB / tests rápidos)
 *   - prismaRepos  (Postgres via Prisma, producción desde Sprint 2)
 *
 * La selección se hace en apps/web/src/lib/repositories/index.ts según
 * process.env.DATA_LAYER.
 */

import type { Board, Card, Checklist, List, User } from '@artemis/types';

/* ============================ Interfaces ============================ */

export interface ICardRepository {
  list(boardId: string): Promise<Card[]>;
  /**
   * IMPORTANTE: el id lo genera el cliente (para optimistic update instantáneo).
   * Si se omite, el repo lo rellena.
   */
  create(
    card: Omit<Card, 'created_at' | 'updated_at'> & { id?: string }
  ): Promise<Card>;
  update(id: string, patch: Partial<Card>): Promise<Card>;
  remove(id: string): Promise<void>;
  move(id: string, toListId: string, position: number): Promise<Card>;
  reorder(listId: string, orderedIds: string[]): Promise<void>;
}

export interface IListRepository {
  list(boardId: string): Promise<List[]>;
  create(list: Omit<List, 'id'> & { id?: string }): Promise<List>;
  update(id: string, patch: Partial<List>): Promise<List>;
  remove(id: string): Promise<void>;
}

export interface IBoardRepository {
  get(id: string): Promise<Board | null>;
  list(): Promise<Board[]>;
}

export interface IUserRepository {
  list(): Promise<User[]>;
  current(): Promise<User>;
}

export interface IChecklistRepository {
  listByBoard(boardId: string): Promise<Checklist[]>;
  create(checklist: Omit<Checklist, 'id'> & { id?: string }): Promise<Checklist>;
  update(id: string, patch: Partial<Checklist>): Promise<Checklist>;
  remove(id: string): Promise<void>;
}

export interface RepositoryBundle {
  cards: ICardRepository;
  lists: IListRepository;
  boards: IBoardRepository;
  users: IUserRepository;
  checklists: IChecklistRepository;
}

/* ============================ Bundles ============================ */

export { memoryRepos } from './memory';
export { prismaRepos } from './prisma';
export { prisma } from './prisma/client';
export { cardProgress, type ProgressResult } from './progress';
