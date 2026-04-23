'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import { Plus, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useBoard } from '../../store/board';
import { CardItem } from './CardItem';
import { ListColumn } from './ListColumn';
import { CardEditor } from './CardEditor';
import { Topbar } from './Topbar';

export function Board() {
  const board = useBoard((s) => s.board);
  const lists = useBoard((s) => s.lists);
  const cards = useBoard((s) => s.cards);
  const moveCard = useBoard((s) => s.moveCard);
  const addList = useBoard((s) => s.addList);
  const resetSeed = useBoard((s) => s.resetSeed);

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [composingList, setComposingList] = useState(false);
  const [listDraft, setListDraft] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const sortedLists = useMemo(
    () => [...lists].sort((a, b) => a.position - b.position),
    [lists]
  );

  const listIds = useMemo(() => sortedLists.map((l) => l.id), [sortedLists]);

  const cardsByList = useMemo(() => {
    const map = new Map<string, typeof cards>();
    for (const list of sortedLists) {
      map.set(
        list.id,
        cards
          .filter((c) => c.list_id === list.id)
          .sort((a, b) => a.position - b.position)
      );
    }
    return map;
  }, [cards, sortedLists]);

  const activeCard = activeCardId
    ? cards.find((c) => c.id === activeCardId)
    : null;

  /* ----------------------------- DnD Handlers ----------------------------- */

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    if (active.data.current?.type === 'card') {
      setActiveCardId(active.id as string);
    }
  }

  /**
   * onDragOver: detecta cuando una tarjeta cruza a otra lista
   * y mueve optimísticamente para que la animación sea fluida
   * (igual que Trello).
   */
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type !== 'card') return;

    const activeCard = cards.find((c) => c.id === activeId);
    if (!activeCard) return;

    // Caso 1: drop sobre una lista (vacía o no)
    if (overData?.type === 'list') {
      const targetListId = overId;
      if (activeCard.list_id !== targetListId) {
        const targetCount = cards.filter(
          (c) => c.list_id === targetListId
        ).length;
        moveCard(activeId, targetListId, targetCount);
      }
      return;
    }

    // Caso 2: drop sobre otra tarjeta
    if (overData?.type === 'card') {
      const overCard = overData.card;
      if (activeCard.list_id !== overCard.list_id) {
        // mover a la lista de la tarjeta destino, en su posición
        moveCard(activeId, overCard.list_id, overCard.position);
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCardId(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type !== 'card') return;

    const activeCard = cards.find((c) => c.id === activeId);
    if (!activeCard) return;

    // Reordenar dentro de la misma lista
    if (overData?.type === 'card') {
      const overCard = overData.card;
      if (activeCard.list_id === overCard.list_id) {
        const listCards = cards
          .filter((c) => c.list_id === activeCard.list_id)
          .sort((a, b) => a.position - b.position);

        const oldIdx = listCards.findIndex((c) => c.id === activeId);
        const newIdx = listCards.findIndex((c) => c.id === overId);
        if (oldIdx !== newIdx && newIdx !== -1) {
          const reordered = arrayMove(listCards, oldIdx, newIdx);
          // mover el activo a la nueva posición
          moveCard(activeId, activeCard.list_id, newIdx);
          // y reordenar los demás: el store ya re-asigna posiciones contiguas
          reordered.forEach((c, i) => {
            if (c.id !== activeId) {
              useBoard.getState().updateCard(c.id, { position: i });
            }
          });
        }
      }
    }
  }

  /* ----------------------------- Render ----------------------------- */

  return (
    <div className="flex h-screen flex-col">
      <Topbar />

      {/* sub-header del tablero */}
      <div className="flex items-center justify-between gap-4 border-b border-ink-700/50 bg-ink-900/40 backdrop-blur-md px-6 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-xl font-bold tracking-tight text-ink-50">
            {board.title}
          </h1>
          <span className="rounded-md bg-amber-arte/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-arte">
            Subdepto · Atrezzo
          </span>
        </div>

        <button
          onClick={() => {
            if (
              confirm(
                'Esto restaurará el tablero a los datos iniciales y borrará todos tus cambios. ¿Continuar?'
              )
            )
              resetSeed();
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink-700/60 px-2.5 py-1.5 text-xs text-ink-200 hover:bg-ink-700 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restaurar demo
        </button>
      </div>

      {/* Board scroll horizontal */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="board-scroll flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full items-start gap-3 p-6">
            <SortableContext
              items={listIds}
              strategy={horizontalListSortingStrategy}
            >
              {sortedLists.map((list) => (
                <ListColumn
                  key={list.id}
                  list={list}
                  cards={cardsByList.get(list.id) ?? []}
                />
              ))}
            </SortableContext>

            {/* Añadir lista */}
            <div className="w-72 shrink-0">
              {composingList ? (
                <div className="rounded-xl bg-ink-800/90 p-2 shadow-list">
                  <input
                    autoFocus
                    value={listDraft}
                    onChange={(e) => setListDraft(e.target.value)}
                    placeholder="Introduce el título de la lista…"
                    className="w-full rounded-md bg-ink-700 px-2 py-1.5 text-sm text-ink-50 placeholder:text-ink-400 outline-none ring-2 ring-amber-arte"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (listDraft.trim()) addList(listDraft);
                        setListDraft('');
                        setComposingList(false);
                      }
                      if (e.key === 'Escape') {
                        setListDraft('');
                        setComposingList(false);
                      }
                    }}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => {
                        if (listDraft.trim()) addList(listDraft);
                        setListDraft('');
                        setComposingList(false);
                      }}
                      className="rounded-md bg-amber-arte px-3 py-1.5 text-xs font-semibold text-ink-950 hover:bg-amber-arte/90"
                    >
                      Añadir lista
                    </button>
                    <button
                      onClick={() => {
                        setComposingList(false);
                        setListDraft('');
                      }}
                      className="rounded-md px-2 py-1.5 text-xs text-ink-300 hover:bg-ink-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setComposingList(true)}
                  className="flex w-full items-center gap-2 rounded-xl bg-ink-800/40 hover:bg-ink-800/70 px-3 py-2.5 text-sm text-ink-200 backdrop-blur-sm transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Añadir otra lista
                </button>
              )}
            </div>
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeCard && (
            <div className="drag-overlay w-72">
              <CardItem card={activeCard} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Card editor side panel */}
      <CardEditor />
    </div>
  );
}
