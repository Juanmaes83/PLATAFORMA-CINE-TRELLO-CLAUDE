/**
 * Implementación in-memory de los repositorios.
 * Sprint 1 sustituye este archivo por uno basado en Prisma/Drizzle
 * sin tocar UI ni store.
 */

import type {
  IBoardRepository,
  ICardRepository,
  IListRepository,
  IUserRepository
} from '@artemis/db';
import type { Board, Card, List, User } from '@artemis/types';
import { nanoid } from 'nanoid';
import { seedBoard, seedCards, seedLists, seedUsers } from '../seed';

let _cards: Card[] = [...seedCards];
let _lists: List[] = [...seedLists];
let _board: Board = { ...seedBoard };
let _users: User[] = [...seedUsers];

export const memoryCardRepo: ICardRepository = {
  async list(boardId) {
    return _cards.filter((c) => c.board_id === boardId);
  },
  async create(input) {
    const card: Card = {
      ...input,
      id: `c_${nanoid(8)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    _cards.push(card);
    return card;
  },
  async update(id, patch) {
    const idx = _cards.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Card ${id} not found`);
    _cards[idx] = {
      ..._cards[idx],
      ...patch,
      updated_at: new Date().toISOString()
    };
    return _cards[idx];
  },
  async remove(id) {
    _cards = _cards.filter((c) => c.id !== id);
  },
  async move(id, toListId, position) {
    const idx = _cards.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Card ${id} not found`);
    _cards[idx] = {
      ..._cards[idx],
      list_id: toListId,
      position,
      updated_at: new Date().toISOString()
    };
    return _cards[idx];
  },
  async reorder(listId, orderedIds) {
    orderedIds.forEach((id, position) => {
      const idx = _cards.findIndex((c) => c.id === id);
      if (idx !== -1) {
        _cards[idx] = { ..._cards[idx], list_id: listId, position };
      }
    });
  }
};

export const memoryListRepo: IListRepository = {
  async list(boardId) {
    return _lists
      .filter((l) => l.board_id === boardId)
      .sort((a, b) => a.position - b.position);
  },
  async create(input) {
    const list: List = { ...input, id: `l_${nanoid(8)}` };
    _lists.push(list);
    return list;
  },
  async update(id, patch) {
    const idx = _lists.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error(`List ${id} not found`);
    _lists[idx] = { ..._lists[idx], ...patch };
    return _lists[idx];
  },
  async remove(id) {
    _lists = _lists.filter((l) => l.id !== id);
    _cards = _cards.filter((c) => c.list_id !== id);
  }
};

export const memoryBoardRepo: IBoardRepository = {
  async get(id) {
    return _board.id === id ? _board : null;
  },
  async list() {
    return [_board];
  }
};

export const memoryUserRepo: IUserRepository = {
  async list() {
    return _users;
  },
  async current() {
    return _users[0]; // mock: la directora de arte
  }
};

export const repos = {
  cards: memoryCardRepo,
  lists: memoryListRepo,
  boards: memoryBoardRepo,
  users: memoryUserRepo
};
