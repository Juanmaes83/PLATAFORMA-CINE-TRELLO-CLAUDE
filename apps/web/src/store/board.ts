'use client';

import type { Board, Card, List, User } from '@artemis/types';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import {
  actionCreateCard,
  actionCreateList,
  actionDeleteCard,
  actionDeleteList,
  actionMoveCard,
  actionResetSeed,
  actionUpdateCard,
  actionUpdateList,
  loadBoardState
} from '../app/actions/board';

/**
 * Store de Artemis (Sprint 2).
 * Ya no usamos el middleware `persist` — la persistencia vive en Postgres.
 * Patrón para cada acción mutadora:
 *   1. snapshot del estado previo
 *   2. optimistic update LOCAL (instantáneo para el usuario)
 *   3. fire-and-forget server action; en `.catch`, revertir + toast.
 */

const LOADING_BOARD: Board = {
  id: '',
  title: 'Cargando…',
  subdepartment: 'props',
  project_id: '',
  background:
    'linear-gradient(135deg, #1a1e23 0%, #272c32 50%, #363c43 100%)',
  created_at: new Date().toISOString()
};

export interface ToastMessage {
  id: string;
  message: string;
}

interface BoardState {
  board: Board;
  lists: List[];
  cards: Card[];
  users: User[];
  selectedCardId: string | null;
  hydrated: boolean;
  toasts: ToastMessage[];

  // Hydration
  hydrate: () => Promise<void>;

  // UI
  setSelectedCard: (id: string | null) => void;
  dismissToast: (id: string) => void;

  // Optimistic ops (firmas idénticas a Sprint 1)
  moveCard: (cardId: string, toListId: string, toPosition: number) => void;
  addCard: (listId: string, title: string) => string | null;
  updateCard: (cardId: string, patch: Partial<Card>) => void;
  duplicateCard: (cardId: string) => string | null;
  deleteCard: (cardId: string) => void;

  addList: (title: string) => void;
  renameList: (listId: string, title: string) => void;
  deleteList: (listId: string) => void;

  resetSeed: () => void;
}

/** Apila un toast de error; auto-descarte en 3s. */
function toast(msg: string) {
  const id = `t_${nanoid(6)}`;
  useBoard.setState((s) => ({ toasts: [...s.toasts, { id, message: msg }] }));
  setTimeout(() => {
    useBoard.setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  }, 3000);
}

export const useBoard = create<BoardState>()((set, get) => ({
  board: LOADING_BOARD,
  lists: [],
  cards: [],
  users: [],
  selectedCardId: null,
  hydrated: false,
  toasts: [],

  hydrate: async () => {
    try {
      const state = await loadBoardState();
      set({
        board: state.board,
        lists: state.lists,
        cards: state.cards,
        users: state.users,
        hydrated: true
      });
    } catch (err) {
      console.error('[artemis] hydrate failed', err);
      toast('No se pudo cargar el tablero (¿Postgres arrancado?)');
    }
  },

  setSelectedCard: (id) => set({ selectedCardId: id }),
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  /* ------------------------------ Cards ------------------------------ */

  moveCard: (cardId, toListId, toPosition) => {
    const snapshot = get().cards;
    const card = snapshot.find((c) => c.id === cardId);
    if (!card) return;

    const fromListId = card.list_id;

    const remainingInSource = snapshot
      .filter((c) => c.list_id === fromListId && c.id !== cardId)
      .sort((a, b) => a.position - b.position)
      .map((c, i) => ({ ...c, position: i }));

    const targetList = snapshot
      .filter((c) => c.list_id === toListId && c.id !== cardId)
      .sort((a, b) => a.position - b.position);

    targetList.splice(toPosition, 0, {
      ...card,
      list_id: toListId,
      position: toPosition,
      updated_at: new Date().toISOString()
    });

    const reorderedTarget = targetList.map((c, i) => ({ ...c, position: i }));

    const otherCards = snapshot.filter(
      (c) => c.list_id !== fromListId && c.list_id !== toListId
    );

    set({ cards: [...otherCards, ...remainingInSource, ...reorderedTarget] });

    actionMoveCard(cardId, toListId, toPosition).catch((err) => {
      console.error('[artemis] moveCard failed', err);
      set({ cards: snapshot });
      toast('No se pudo mover la tarjeta. Cambio revertido.');
    });
  },

  addCard: (listId, title) => {
    const trimmed = title.trim();
    if (!trimmed) return null;
    const { cards, users, board } = get();

    const lastPos = cards
      .filter((c) => c.list_id === listId)
      .reduce((m, c) => Math.max(m, c.position), -1);

    const id = `c_${nanoid(8)}`;
    const now = new Date().toISOString();
    const newCard: Card = {
      id,
      list_id: listId,
      board_id: board.id,
      position: lastPos + 1,
      title: trimmed,
      assignee_ids: [],
      priority: 'medium',
      labels: [],
      approval_status: 'draft',
      created_at: now,
      updated_at: now,
      created_by: users[0]?.id ?? 'u_ana'
    };

    set({ cards: [...cards, newCard] });

    actionCreateCard({
      id,
      list_id: newCard.list_id,
      board_id: newCard.board_id,
      position: newCard.position,
      title: newCard.title,
      assignee_ids: newCard.assignee_ids,
      priority: newCard.priority,
      labels: newCard.labels,
      approval_status: newCard.approval_status,
      created_by: newCard.created_by
    }).catch((err) => {
      console.error('[artemis] addCard failed', err);
      set({ cards: cards });
      toast('No se pudo crear la tarjeta.');
    });

    return id;
  },

  updateCard: (cardId, patch) => {
    const snapshot = get().cards;
    set({
      cards: snapshot.map((c) =>
        c.id === cardId
          ? { ...c, ...patch, updated_at: new Date().toISOString() }
          : c
      )
    });
    actionUpdateCard(cardId, patch).catch((err) => {
      console.error('[artemis] updateCard failed', err);
      set({ cards: snapshot });
      toast('No se pudo guardar el cambio.');
    });
  },

  duplicateCard: (cardId) => {
    const { cards } = get();
    const src = cards.find((c) => c.id === cardId);
    if (!src) return null;

    const lastPos = cards
      .filter((c) => c.list_id === src.list_id)
      .reduce((m, c) => Math.max(m, c.position), -1);

    const now = new Date().toISOString();
    const newId = `c_${nanoid(8)}`;
    const copy: Card = {
      ...src,
      id: newId,
      title: `${src.title} (copia)`,
      position: lastPos + 1,
      assignee_ids: [...src.assignee_ids],
      labels: [...src.labels],
      scene_numbers: src.scene_numbers ? [...src.scene_numbers] : undefined,
      art_metadata: src.art_metadata
        ? ({
            subdept: src.art_metadata.subdept,
            data: { ...src.art_metadata.data }
          } as Card['art_metadata'])
        : undefined,
      created_at: now,
      updated_at: now
    };

    set({ cards: [...cards, copy] });

    const { created_at: _ca, updated_at: _ua, ...createInput } = copy;
    actionCreateCard(createInput).catch((err) => {
      console.error('[artemis] duplicateCard failed', err);
      set({ cards });
      toast('No se pudo duplicar la tarjeta.');
    });

    return newId;
  },

  deleteCard: (cardId) => {
    const snapshot = get().cards;
    set({
      cards: snapshot.filter((c) => c.id !== cardId),
      selectedCardId:
        get().selectedCardId === cardId ? null : get().selectedCardId
    });
    actionDeleteCard(cardId).catch((err) => {
      console.error('[artemis] deleteCard failed', err);
      set({ cards: snapshot });
      toast('No se pudo eliminar la tarjeta.');
    });
  },

  /* ------------------------------ Lists ------------------------------ */

  addList: (title) => {
    const { lists, board } = get();
    const id = `l_${nanoid(8)}`;
    const newList: List = {
      id,
      board_id: board.id,
      title: title.trim() || 'Nueva lista',
      position: lists.length,
      workflow_type: 'todo'
    };
    set({ lists: [...lists, newList] });

    actionCreateList(newList).catch((err) => {
      console.error('[artemis] addList failed', err);
      set({ lists });
      toast('No se pudo crear la lista.');
    });
  },

  renameList: (listId, title) => {
    const snapshot = get().lists;
    const newTitle = title.trim();
    if (!newTitle) return;
    set({
      lists: snapshot.map((l) =>
        l.id === listId ? { ...l, title: newTitle } : l
      )
    });
    actionUpdateList(listId, { title: newTitle }).catch((err) => {
      console.error('[artemis] renameList failed', err);
      set({ lists: snapshot });
      toast('No se pudo renombrar la lista.');
    });
  },

  deleteList: (listId) => {
    const snapshotLists = get().lists;
    const snapshotCards = get().cards;
    set({
      lists: snapshotLists.filter((l) => l.id !== listId),
      cards: snapshotCards.filter((c) => c.list_id !== listId)
    });
    actionDeleteList(listId).catch((err) => {
      console.error('[artemis] deleteList failed', err);
      set({ lists: snapshotLists, cards: snapshotCards });
      toast('No se pudo eliminar la lista.');
    });
  },

  /* ------------------------------ Reset demo ------------------------------ */

  resetSeed: () => {
    // Dispara el reseed en server y rehidrata cuando termine.
    actionResetSeed()
      .then(() => get().hydrate())
      .catch((err) => {
        console.error('[artemis] resetSeed failed', err);
        toast('No se pudo restaurar el tablero.');
      });
  }
}));
