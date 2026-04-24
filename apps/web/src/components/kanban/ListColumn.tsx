'use client';

import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { Card, List } from '@artemis/types';
import { MoreHorizontal, Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useBoard } from '../../store/board';
import { cn, workflowAccent } from '../../lib/utils';
import { CardItem } from './CardItem';

interface Props {
  list: List;
  cards: Card[];
}

export function ListColumn({ list, cards }: Props) {
  const addCard = useBoard((s) => s.addCard);
  const deleteList = useBoard((s) => s.deleteList);
  const renameList = useBoard((s) => s.renameList);
  const setSelectedCard = useBoard((s) => s.setSelectedCard);

  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(list.title);

  const sortedCards = useMemo(
    () => [...cards].sort((a, b) => a.position - b.position),
    [cards]
  );

  const cardIds = useMemo(() => sortedCards.map((c) => c.id), [sortedCards]);

  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: { type: 'list', list }
  });

  const wipExceeded =
    list.wip_limit !== undefined && cards.length > list.wip_limit;

  const handleAdd = () => {
    if (!draft.trim()) {
      setComposing(false);
      return;
    }
    const newId = addCard(list.id, draft);
    setDraft('');
    setComposing(false);
    if (newId) setSelectedCard(newId);
  };

  return (
    <div
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-xl bg-ink-800/90 backdrop-blur-sm shadow-list border-t-2',
        workflowAccent[list.workflow_type],
        isOver && 'ring-2 ring-amber-arte/60'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => {
              renameList(list.id, titleDraft);
              setEditingTitle(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                renameList(list.id, titleDraft);
                setEditingTitle(false);
              }
              if (e.key === 'Escape') {
                setTitleDraft(list.title);
                setEditingTitle(false);
              }
            }}
            className="flex-1 rounded bg-ink-700 px-2 py-1 text-sm font-semibold text-ink-50 outline-none ring-2 ring-amber-arte"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="flex-1 text-left text-sm font-semibold text-ink-50 hover:text-amber-arte transition-colors truncate"
          >
            {list.title}
          </button>
        )}

        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums',
            wipExceeded
              ? 'bg-red-500/20 text-red-300'
              : 'bg-ink-700 text-ink-300'
          )}
          title={
            list.wip_limit !== undefined
              ? `WIP limit: ${list.wip_limit}`
              : undefined
          }
        >
          {cards.length}
          {list.wip_limit !== undefined && `/${list.wip_limit}`}
        </span>

        <button
          onClick={() => {
            if (confirm(`¿Eliminar la lista "${list.title}" y todas sus tarjetas?`))
              deleteList(list.id);
          }}
          className="rounded p-1 text-ink-400 hover:bg-ink-700 hover:text-ink-100 transition-colors"
          title="Opciones de la lista"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Drop zone con lista de tarjetas */}
      <div
        ref={setNodeRef}
        className="list-scroll flex-1 overflow-y-auto px-2 pb-2 space-y-2 max-h-[calc(100vh-260px)]"
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {sortedCards.map((card) => (
            <CardItem key={card.id} card={card} />
          ))}
        </SortableContext>

        {sortedCards.length === 0 && !composing && (
          <div className="rounded-lg border border-dashed border-ink-600 px-3 py-6 text-center text-[11px] text-ink-400">
            Suelta una tarjeta aquí
          </div>
        )}
      </div>

      {/* Footer: añadir tarjeta */}
      <div className="px-2 pb-2">
        {composing ? (
          <div className="space-y-2">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Introduce un título para esta tarjeta…"
              rows={3}
              className="w-full resize-none rounded-lg bg-ink-700 p-2 text-[13px] text-ink-50 placeholder:text-ink-400 outline-none ring-2 ring-amber-arte/60 focus:ring-amber-arte"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAdd();
                }
                if (e.key === 'Escape') {
                  setComposing(false);
                  setDraft('');
                }
              }}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleAdd}
                className="rounded-md bg-amber-arte px-3 py-1.5 text-xs font-semibold text-ink-950 hover:bg-amber-arte/90 transition-colors"
              >
                Añadir tarjeta
              </button>
              <button
                onClick={() => {
                  setComposing(false);
                  setDraft('');
                }}
                className="rounded-md p-1.5 text-ink-300 hover:bg-ink-700 hover:text-ink-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setComposing(true)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-ink-300 hover:bg-ink-700 hover:text-ink-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Añadir una tarjeta
          </button>
        )}
      </div>
    </div>
  );
}
