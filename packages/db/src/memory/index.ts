/**
 * Implementación in-memory de los repositorios (demo / tests).
 */

import type { Board, Card, Checklist, List, User } from '@artemis/types';
import { nanoid } from 'nanoid';
import type {
  IBoardRepository,
  ICardRepository,
  IChecklistRepository,
  IListRepository,
  IUserRepository,
  RepositoryBundle
} from '../index';
import { seedBoard, seedCards, seedLists, seedUsers } from './seed-data';

let _cards: Card[] = [...seedCards];
let _lists: List[] = [...seedLists];
let _board: Board = { ...seedBoard };
let _users: User[] = [...seedUsers];
let _checklists: Checklist[] = [];

const memoryCardRepo: ICardRepository = {
  async list(boardId) {
    return _cards
      .filter((c) => c.board_id === boardId)
      .sort((a, b) => a.position - b.position);
  },
  async create(input) {
    const card: Card = {
      ...input,
      id: input.id ?? `c_${nanoid(8)}`,
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

const memoryListRepo: IListRepository = {
  async list(boardId) {
    return _lists
      .filter((l) => l.board_id === boardId)
      .sort((a, b) => a.position - b.position);
  },
  async create(input) {
    const list: List = { ...input, id: input.id ?? `l_${nanoid(8)}` };
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

const memoryBoardRepo: IBoardRepository = {
  async get(id) {
    return _board.id === id ? _board : null;
  },
  async list() {
    return [_board];
  }
};

const memoryUserRepo: IUserRepository = {
  async list() {
    return _users;
  },
  async current() {
    return _users[0];
  }
};

const memoryChecklistRepo: IChecklistRepository = {
  async listByBoard(boardId) {
    const cardIds = new Set(
      _cards.filter((c) => c.board_id === boardId).map((c) => c.id)
    );
    return _checklists
      .filter((cl) => cardIds.has(cl.card_id))
      .sort((a, b) => a.position - b.position);
  },
  async create(input) {
    const cl: Checklist = {
      ...input,
      id: input.id ?? `ck_${nanoid(8)}`,
      items: input.items ?? []
    };
    _checklists.push(cl);
    return cl;
  },
  async update(id, patch) {
    const idx = _checklists.findIndex((cl) => cl.id === id);
    if (idx === -1) throw new Error(`Checklist ${id} not found`);
    _checklists[idx] = { ..._checklists[idx], ...patch };
    return _checklists[idx];
  },
  async remove(id) {
    _checklists = _checklists.filter((cl) => cl.id !== id);
  }
};

export const memoryRepos: RepositoryBundle = {
  cards: memoryCardRepo,
  lists: memoryListRepo,
  boards: memoryBoardRepo,
  users: memoryUserRepo,
  checklists: memoryChecklistRepo
};
