'use client';

/**
 * Barra de progreso de una tarjeta.
 * - Nodal (tiene hijas)    -> púrpura; rojo si alguna hija está bloqueada.
 * - Simple (solo checklist)-> azul.
 * - Sin datos              -> no renderiza nada.
 *
 * Se dibuja como una línea horizontal de 3px; ocupa el ancho disponible.
 */

import { cardProgress } from '@artemis/db';
import type { Card } from '@artemis/types';
import { useBoard } from '../../store/board';
import { cn } from '../../lib/utils';

interface Props {
  card: Card;
  className?: string;
}

export function ProgressBar({ card, className }: Props) {
  const cards = useBoard((s) => s.cards);
  const lists = useBoard((s) => s.lists);
  const checklists = useBoard((s) => s.checklists);

  const result = cardProgress(card.id, cards, lists, checklists);
  if (!result) return null;

  const barColor = result.blocked
    ? 'bg-red-500'
    : result.mode === 'nodal'
    ? 'bg-violet-500'
    : 'bg-cyan-500';

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      title={`${result.breakdown.done}/${result.breakdown.total} ${
        result.mode === 'nodal' ? 'subtareas' : 'items'
      } completados`}
    >
      <div className="h-[3px] flex-1 rounded-full bg-ink-600/60 overflow-hidden">
        <div
          className={cn('h-full transition-all', barColor)}
          style={{ width: `${result.percent}%` }}
        />
      </div>
      <span className="text-[10px] tabular-nums text-ink-400">
        {result.percent}%
      </span>
    </div>
  );
}
