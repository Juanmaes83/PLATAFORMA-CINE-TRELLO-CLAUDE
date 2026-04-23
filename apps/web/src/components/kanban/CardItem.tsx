'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card as TCard } from '@artemis/types';
import {
  Calendar,
  CircleDollarSign,
  Film,
  MessageSquare,
  Paperclip
} from 'lucide-react';
import { useBoard } from '../../store/board';
import { cn, formatDate, formatEUR, priorityColor } from '../../lib/utils';
import { Avatar } from '../ui/Avatar';
import { Label } from '../ui/Label';

interface Props {
  card: TCard;
}

export function CardItem({ card }: Props) {
  const users = useBoard((s) => s.users);
  const setSelected = useBoard((s) => s.setSelectedCard);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: card.id,
    data: { type: 'card', card }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const assignees = users.filter((u) => card.assignee_ids.includes(u.id));
  const isHero = card.art_metadata?.subdept === 'props' && card.art_metadata.data.is_hero;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setSelected(card.id)}
      className={cn(
        'group relative cursor-grab active:cursor-grabbing rounded-lg bg-ink-700 p-3 shadow-card hover:shadow-card-hover hover:bg-ink-700/95 transition-all card-enter',
        isDragging && 'is-dragging'
      )}
    >
      {/* cover color */}
      {card.cover_color && (
        <div
          className="-mx-3 -mt-3 mb-2 h-2 rounded-t-lg"
          style={{ background: card.cover_color }}
        />
      )}

      {/* labels */}
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map((l) => (
            <Label key={l} name={l} />
          ))}
        </div>
      )}

      {/* título */}
      <h4 className="text-[13px] font-medium leading-snug text-ink-50">
        {card.title}
      </h4>

      {/* metadatos cinematográficos */}
      {(card.scene_numbers?.length || card.script_reference) && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-ink-300">
          <Film className="h-3 w-3" />
          {card.scene_numbers && card.scene_numbers.length > 0 && (
            <span className="font-mono">
              Esc. {card.scene_numbers.join(', ')}
            </span>
          )}
          {card.script_reference && (
            <span className="text-ink-400">· {card.script_reference}</span>
          )}
        </div>
      )}

      {/* footer: badges + asignados */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] text-ink-300">
          {/* prioridad */}
          <span
            className={cn(
              'inline-block h-2 w-2 rounded-full',
              priorityColor[card.priority]
            )}
            title={`Prioridad: ${card.priority}`}
          />

          {/* hero */}
          {isHero && (
            <span className="rounded bg-amber-arte/15 px-1 py-0.5 font-bold text-amber-arte">
              ★ HERO
            </span>
          )}

          {/* fecha */}
          {card.due_date && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(card.due_date)}
            </span>
          )}

          {/* coste */}
          {card.estimated_cost !== undefined && (
            <span className="inline-flex items-center gap-1">
              <CircleDollarSign className="h-3 w-3" />
              {formatEUR(card.estimated_cost)}
            </span>
          )}

          {card.description && (
            <MessageSquare className="h-3 w-3" />
          )}
        </div>

        {assignees.length > 0 && (
          <div className="flex -space-x-1">
            {assignees.slice(0, 3).map((u) => (
              <Avatar key={u.id} user={u} ring />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
