'use client';

import {
  AlignLeft,
  Calendar,
  CircleDollarSign,
  Film,
  Tag,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useBoard } from '../../store/board';
import { Avatar } from '../ui/Avatar';
import { Label } from '../ui/Label';
import { formatEUR, priorityLabel } from '../../lib/utils';

export function CardEditor() {
  const selectedCardId = useBoard((s) => s.selectedCardId);
  const setSelected = useBoard((s) => s.setSelectedCard);
  const cards = useBoard((s) => s.cards);
  const lists = useBoard((s) => s.lists);
  const users = useBoard((s) => s.users);
  const updateCard = useBoard((s) => s.updateCard);
  const deleteCard = useBoard((s) => s.deleteCard);

  const card = selectedCardId
    ? cards.find((c) => c.id === selectedCardId)
    : null;

  const [titleDraft, setTitleDraft] = useState('');
  const [descDraft, setDescDraft] = useState('');

  useEffect(() => {
    if (card) {
      setTitleDraft(card.title);
      setDescDraft(card.description ?? '');
    }
  }, [card?.id]);

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelected(null);
    }
    if (selectedCardId) {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [selectedCardId, setSelected]);

  if (!card) return null;

  const list = lists.find((l) => l.id === card.list_id);
  const assignees = users.filter((u) => card.assignee_ids.includes(u.id));
  const isPropsHero =
    card.art_metadata?.subdept === 'props' && card.art_metadata.data.is_hero;
  const propsData =
    card.art_metadata?.subdept === 'props' ? card.art_metadata.data : null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setSelected(null)}
        className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm z-40 animate-fade-in"
      />

      {/* Panel lateral derecho */}
      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto bg-ink-900 border-l border-ink-700 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-ink-700 bg-ink-900/95 backdrop-blur px-6 py-4">
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-ink-400 mb-1">
              en lista <span className="text-amber-arte">{list?.title}</span>
            </div>
            <input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => updateCard(card.id, { title: titleDraft })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              }}
              className="w-full bg-transparent font-display text-2xl font-bold text-ink-50 outline-none focus:bg-ink-800 rounded px-2 -mx-2 py-1"
            />
          </div>
          <button
            onClick={() => setSelected(null)}
            className="rounded-md p-1.5 text-ink-300 hover:bg-ink-800 hover:text-ink-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Ficha técnica cinematográfica */}
          <section>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
              <Film className="h-3.5 w-3.5" />
              Ficha técnica
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-ink-800/60 p-4">
              <Field label="Escenas">
                <span className="font-mono text-sm text-ink-50">
                  {card.scene_numbers?.join(', ') ?? '—'}
                </span>
              </Field>
              <Field label="Referencia guion">
                <span className="text-sm text-ink-50">
                  {card.script_reference ?? '—'}
                </span>
              </Field>
              <Field label="Prioridad">
                <span className="text-sm text-ink-50">
                  {priorityLabel[card.priority]}
                </span>
              </Field>
              <Field label="Fecha límite">
                <span className="text-sm text-ink-50">
                  {card.due_date
                    ? new Date(card.due_date).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })
                    : '—'}
                </span>
              </Field>
              {propsData && (
                <>
                  <Field label="Cantidad">
                    <span className="text-sm text-ink-50">
                      {propsData.quantity ?? '—'}
                    </span>
                  </Field>
                  <Field label="Origen">
                    <span className="text-sm text-ink-50 capitalize">
                      {propsData.source?.replace('_', ' ') ?? '—'}
                    </span>
                  </Field>
                </>
              )}
            </div>
            {(isPropsHero || propsData?.is_breakaway) && (
              <div className="mt-2 flex gap-2">
                {isPropsHero && (
                  <span className="rounded bg-amber-arte/20 px-2 py-1 text-[10px] font-bold uppercase text-amber-arte">
                    ★ Hero Prop
                  </span>
                )}
                {propsData?.is_breakaway && (
                  <span className="rounded bg-red-500/20 px-2 py-1 text-[10px] font-bold uppercase text-red-300">
                    Breakaway
                  </span>
                )}
              </div>
            )}
          </section>

          {/* Continuidad */}
          {propsData?.continuity_notes && (
            <section>
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
                Notas de continuidad
              </div>
              <div className="rounded-lg border-l-2 border-amber-arte bg-ink-800/60 px-3 py-2 text-sm italic text-ink-100">
                {propsData.continuity_notes}
              </div>
            </section>
          )}

          {/* Etiquetas */}
          {card.labels.length > 0 && (
            <section>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
                <Tag className="h-3.5 w-3.5" />
                Etiquetas
              </div>
              <div className="flex flex-wrap gap-2">
                {card.labels.map((l) => (
                  <Label key={l} name={l} />
                ))}
              </div>
            </section>
          )}

          {/* Asignados */}
          <section>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
              <Users className="h-3.5 w-3.5" />
              Asignados
            </div>
            <div className="flex flex-wrap gap-2">
              {assignees.length === 0 && (
                <span className="text-sm text-ink-400">Sin asignar</span>
              )}
              {assignees.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-2 rounded-full bg-ink-800 pr-3 pl-1 py-1"
                >
                  <Avatar user={u} />
                  <span className="text-xs text-ink-100">{u.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Descripción editable */}
          <section>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
              <AlignLeft className="h-3.5 w-3.5" />
              Descripción
            </div>
            <textarea
              value={descDraft}
              onChange={(e) => setDescDraft(e.target.value)}
              onBlur={() => updateCard(card.id, { description: descDraft })}
              placeholder="Añade una descripción más detallada…"
              rows={4}
              className="w-full resize-none rounded-lg bg-ink-800 p-3 text-sm text-ink-50 placeholder:text-ink-400 outline-none focus:ring-2 focus:ring-amber-arte"
            />
          </section>

          {/* Panel financiero (RBAC stub) */}
          {(card.estimated_cost !== undefined ||
            card.actual_cost !== undefined) && (
            <section>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
                <CircleDollarSign className="h-3.5 w-3.5" />
                Financiero
                <span className="ml-1 rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">
                  RBAC
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 rounded-lg bg-ink-800/60 p-4">
                <Field label="Estimado">
                  <span className="text-base font-bold text-ink-50 tabular-nums">
                    {formatEUR(card.estimated_cost)}
                  </span>
                </Field>
                <Field label="Real">
                  <span className="text-base font-bold text-ink-50 tabular-nums">
                    {formatEUR(card.actual_cost)}
                  </span>
                </Field>
                <Field label="Estado">
                  <span className="text-sm capitalize text-ink-50">
                    {card.approval_status ?? 'draft'}
                  </span>
                </Field>
              </div>
              <div className="mt-2 text-[10px] text-ink-400 italic">
                Flujo de aprobación Arte → Producción se activa en Fase 2.
              </div>
            </section>
          )}

          {/* Acciones */}
          <section className="border-t border-ink-700 pt-4">
            <button
              onClick={() => {
                if (confirm(`¿Eliminar la tarjeta "${card.title}"?`)) {
                  deleteCard(card.id);
                }
              }}
              className="inline-flex items-center gap-2 rounded-md bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/25 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar tarjeta
            </button>
          </section>
        </div>
      </aside>
    </>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-400 mb-0.5">
        {label}
      </div>
      {children}
    </div>
  );
}
