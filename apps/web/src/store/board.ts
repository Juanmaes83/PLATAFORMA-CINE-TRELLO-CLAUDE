'use client';

import type { Board, Card, List, User } from '@artemis/types';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { seedBoard, seedCards, seedLists, seedUsers } from '../lib/seed';

interface BoardState {
  board: Board;
  lists: List[];
  cards: Card[];
  users: User[];
  selectedCardId: string | null;
  hydrated: boolean;

  // Actions
  setSelectedCard: (id: string | null) => void;

  // Optimistic ops
  moveCard: (cardId: string, toListId: string, toPosition: number) => void;
  addCard: (listId: string, title: string) => void;
  updateCard: (cardId: string, patch: Partial<Card>) => void;
  deleteCard: (cardId: string) => void;

  addList: (title: string) => void;
  renameList: (listId: string, title: string) => void;
  deleteList: (listId: string) => void;

  resetSeed: () => void;
}

export const useBoard = create<BoardState>()(
  persist(
    (set, get) => ({
      board: seedBoard,
      lists: seedLists,
      cards: seedCards,
      users: seedUsers,
      selectedCardId: null,
      hydrated: false,

      setSelectedCard: (id) => set({ selectedCardId: id }),

      moveCard: (cardId, toListId, toPosition) => {
        const { cards } = get();
        const card = cards.find((c) => c.id === cardId);
        if (!card) return;

        const fromListId = card.list_id;

        // 1. Quitar la tarjeta de su lista actual y reordenar
        const remainingInSource = cards
          .filter((c) => c.list_id === fromListId && c.id !== cardId)
          .sort((a, b) => a.position - b.position)
          .map((c, i) => ({ ...c, position: i }));

        // 2. Insertar en la lista destino en la posición indicada
        const targetList = cards
          .filter((c) => c.list_id === toListId && c.id !== cardId)
          .sort((a, b) => a.position - b.position);

        targetList.splice(toPosition, 0, {
          ...card,
          list_id: toListId,
          position: toPosition,
          updated_at: new Date().toISOString()
        });

        const reorderedTarget = targetList.map((c, i) => ({
          ...c,
          position: i
        }));

        // 3. Reconstruir el array de cards
        const otherCards = cards.filter(
          (c) => c.list_id !== fromListId && c.list_id !== toListId
        );

        set({
          cards: [...otherCards, ...remainingInSource, ...reorderedTarget]
        });
      },

      addCard: (listId, title) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        const { cards, users } = get();
        const lastPos = cards
          .filter((c) => c.list_id === listId)
          .reduce((m, c) => Math.max(m, c.position), -1);

        const newCard: Card = {
          id: `c_${nanoid(8)}`,
          list_id: listId,
          board_id: get().board.id,
          position: lastPos + 1,
          title: trimmed,
          assignee_ids: [],
          priority: 'medium',
          labels: [],
          approval_status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: users[0]?.id ?? 'u_system'
        };

        set({ cards: [...cards, newCard] });
      },

      updateCard: (cardId, patch) => {
        set({
          cards: get().cards.map((c) =>
            c.id === cardId
              ? { ...c, ...patch, updated_at: new Date().toISOString() }
              : c
          )
        });
      },

      deleteCard: (cardId) => {
        set({
          cards: get().cards.filter((c) => c.id !== cardId),
          selectedCardId:
            get().selectedCardId === cardId ? null : get().selectedCardId
        });
      },

      addList: (title) => {
        const { lists, board } = get();
        const newList: List = {
          id: `l_${nanoid(8)}`,
          board_id: board.id,
          title: title.trim() || 'Nueva lista',
          position: lists.length,
          workflow_type: 'todo'
        };
        set({ lists: [...lists, newList] });
      },

      renameList: (listId, title) => {
        set({
          lists: get().lists.map((l) =>
            l.id === listId ? { ...l, title: title.trim() || l.title } : l
          )
        });
      },

      deleteList: (listId) => {
        set({
          lists: get().lists.filter((l) => l.id !== listId),
          cards: get().cards.filter((c) => c.list_id !== listId)
        });
      },

      resetSeed: () => {
        set({
          board: seedBoard,
          lists: seedLists,
          cards: seedCards,
          users: seedUsers,
          selectedCardId: null
        });
      }
    }),
    {
      name: 'artemis-board-v1',
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      }
    }
  )
);
