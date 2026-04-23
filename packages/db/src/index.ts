/**
 * ARTEMIS · Capa de repositorios
 * --------------------------------
 * Interfaz pensada para que en Sprint 1 se sustituya la
 * implementación in-memory por Prisma/Drizzle sobre Postgres
 * SIN cambiar una línea de la UI.
 *
 * Los componentes consumen ICardRepository, no la implementación.
 */

import type { Board, Card, List, User } from '@artemis/types';

export interface ICardRepository {
  list(boardId: string): Promise<Card[]>;
  create(card: Omit<Card, 'id' | 'created_at' | 'updated_at'>): Promise<Card>;
  update(id: string, patch: Partial<Card>): Promise<Card>;
  remove(id: string): Promise<void>;
  move(id: string, toListId: string, position: number): Promise<Card>;
  reorder(listId: string, orderedIds: string[]): Promise<void>;
}

export interface IListRepository {
  list(boardId: string): Promise<List[]>;
  create(list: Omit<List, 'id'>): Promise<List>;
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

export interface RepositoryBundle {
  cards: ICardRepository;
  lists: IListRepository;
  boards: IBoardRepository;
  users: IUserRepository;
}
