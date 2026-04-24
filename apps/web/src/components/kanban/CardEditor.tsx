'use client';

import {
  AlignLeft,
  Calendar,
  CircleDollarSign,
  Copy,
  Film,
  Move,
  Tag,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useBoard } from '../../store/board';
import { Avatar } from '../ui/Avatar';
import { Label } from '../ui/Label';
import { formatEUR } from '../../lib/utils';
import type { ApprovalStatus, CardPriority, PropsMetadata } from '@artemis/types';

export function CardEditor() {
  const selectedCardId = useBoard((s) => s.selectedCardId);
  const setSelected = useBoard((s) => s.setSelectedCard);
  const cards = useBoard((s) => s.cards);
  const lists = useBoard((s) => s.lists);
  const users = useBoard((s) => s.users);
  const updateCard = useBoard((s) => s.updateCard);
  const deleteCard = useBoard((s) => s.deleteCard);
  const duplicateCard = useBoard((s) => s.duplicateCard);
  const moveCard = useBoard((s) => s.moveCard);

  const card = selectedCardId
    ? cards.find((c) => c.id === selectedCardId)
    : null;

  // --- Drafts locales (optimistic on blur) ---
  const [titleDraft, setTitleDraft] = useState('');
  const [descDraft, setDescDraft] = useState('');
  const [scenesDraft, setScenesDraft] = useState('');
  const [scriptRefDraft, setScriptRefDraft] = useState('');
  const [labelsDraft, setLabelsDraft] = useState('');
  const [dueDraft, setDueDraft] = useState('');
  const [estCostDraft, setEstCostDraft] = useState('');
  const [actCostDraft, setActCostDraft] = useState('');
  const [continuityDraft, setContinuityDraft] = useState('');
  const [quantityDraft, setQuantityDraft] = useState('');

  const [showMoveMenu, setShowMoveMenu] = useState(false);

  useEffect(() => {
    if (card) {
      setTitleDraft(card.title);
      setDescDraft(card.description ?? '');
      setScenesDraft(card.scene_numbers?.join(', ') ?? '');
      setScriptRefDraft(card.script_reference ?? '');
      setLabelsDraft(card.labels.join(', '));
      setDueDraft(card.due_date ? card.due_date.slice(0, 10) : '');
      setEstCostDraft(
        card.estimated_cost !== undefined ? String(card.estimated_cost) : ''
      );
      setActCostDraft(
        card.actual_cost !== undefined ? String(card.actual_cost) : ''
      );
      const pd =
        card.art_metadata?.subdept === 'props' ? card.art_metadata.data : null;
      setContinuityDraft(pd?.continuity_notes ?? '');
      setQuantityDraft(
        pd?.quantity !== undefined ? String(pd.quantity) : ''
      );
      setShowMoveMenu(false);
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

  const list = useMemo(
    () => (card ? lists.find((l) => l.id === card.list_id) : null),
    [card, lists]
  );

  if (!card) return null;

  const propsData =
    card.art_metadata?.subdept === 'props' ? card.art_metadata.data : null;
  const isProps = card.art_metadata?.subdept === 'props';

  // --- Helpers para actualizar art_metadata.data (props) ---
  const patchPropsData = (patch: Partial<PropsMetadata>) => {
    if (!isProps) return;
    const current = (card.art_metadata?.subdept === 'props'
      ? card.art_metadata.data
      : {}) as PropsMetadata;
    updateCard(card.id, {
      art_metadata: {
        subdept: 'props',
        data: { ...current, ...patch }
      }
    });
  };

  const parseCsv = (v: string) =>
    v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

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
                <input
                  type="text"
                  value={scenesDraft}
                  onChange={(e) => setScenesDraft(e.target.value)}
                  onBlur={() =>
                    updateCard(card.id, {
                      scene_numbers: parseCsv(scenesDraft)
                    })
                  }
                  placeholder="12A, 47, 53"
                  className={inputCls + ' font-mono'}
                />
              </Field>
              <Field label="Referencia guion">
                <input
                  type="text"
                  value={scriptRefDraft}
                  onChange={(e) => setScriptRefDraft(e.target.value)}
                  onBlur={() =>
                    updateCard(card.id, {
                      script_reference: scriptRefDraft.trim() || undefined
                    })
                  }
                  placeholder="Esc. 47 — cafetería"
                  className={inputCls}
                />
              </Field>
              <Field label="Prioridad">
                <select
                  value={card.priority}
                  onChange={(e) =>
                    updateCard(card.id, {
                      priority: e.target.value as CardPriority
                    })
                  }
                  className={selectCls}
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </Field>
              <Field label="Fecha límite">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-ink-400" />
                  <input
                    type="date"
                    value={dueDraft}
                    onChange={(e) => setDueDraft(e.target.value)}
                    onBlur={() =>
                      updateCard(card.id, {
                        due_date: dueDraft
                          ? new Date(dueDraft).toISOString()
                          : undefined
                      })
                    }
                    className={inputCls}
                  />
                </div>
              </Field>
              {isProps && (
                <>
                  <Field label="Cantidad">
                    <input
                      type="number"
                      min={0}
                      value={quantityDraft}
                      onChange={(e) => setQuantityDraft(e.target.value)}
                      onBlur={() =>
                        patchPropsData({
                          quantity:
                            quantityDraft === ''
                              ? undefined
                              : Number(quantityDraft)
                        })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Origen">
                    <select
                      value={propsData?.source ?? ''}
                      onChange={(e) =>
                        patchPropsData({
                          source:
                            (e.target.value as PropsMetadata['source']) ||
                            undefined
                        })
                      }
                      className={selectCls}
                    >
                      <option value="">—</option>
                      <option value="rental">Alquiler</option>
                      <option value="purchase">Compra</option>
                      <option value="fabrication">Fabricación</option>
                      <option value="loan">Préstamo</option>
                    </select>
                  </Field>
                </>
              )}
            </div>

            {isProps && (
              <div className="mt-3 flex flex-wrap gap-4 rounded-lg bg-ink-800/60 p-3">
                <label className="flex items-center gap-2 text-xs text-ink-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!propsData?.is_hero}
                    onChange={(e) =>
                      patchPropsData({ is_hero: e.target.checked })
                    }
                    className="h-3.5 w-3.5 rounded border-ink-600 bg-ink-700 text-amber-arte focus:ring-amber-arte"
                  />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    ★ Hero Prop
                  </span>
                </label>
                <label className="flex items-center gap-2 text-xs text-ink-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!propsData?.is_breakaway}
                    onChange={(e) =>
                      patchPropsData({ is_breakaway: e.target.checked })
                    }
                    className="h-3.5 w-3.5 rounded border-ink-600 bg-ink-700 text-amber-arte focus:ring-amber-arte"
                  />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Breakaway
                  </span>
                </label>
              </div>
            )}
          </section>

          {/* Continuidad (solo props) */}
          {isProps && (
            <section>
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
                Notas de continuidad
              </div>
              <textarea
                value={continuityDraft}
                onChange={(e) => setContinuityDraft(e.target.value)}
                onBlur={() =>
                  patchPropsData({
                    continuity_notes: continuityDraft.trim() || undefined
                  })
                }
                placeholder="Ej: taza con borde desportillado lado izquierdo."
                rows={3}
                className="w-full resize-none rounded-lg border-l-2 border-amber-arte bg-ink-800/60 px-3 py-2 text-sm italic text-ink-100 placeholder:text-ink-400 outline-none focus:ring-2 focus:ring-amber-arte"
              />
            </section>
          )}

          {/* Etiquetas */}
          <section>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
              <Tag className="h-3.5 w-3.5" />
              Etiquetas
            </div>
            <input
              type="text"
              value={labelsDraft}
              onChange={(e) => setLabelsDraft(e.target.value)}
              onBlur={() =>
                updateCard(card.id, { labels: parseCsv(labelsDraft) })
              }
              placeholder="Hero, Breakaway"
              className={inputCls}
            />
            {card.labels.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {card.labels.map((l) => (
                  <Label key={l} name={l} />
                ))}
              </div>
            )}
          </section>

          {/* Asignados */}
          <section>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
              <Users className="h-3.5 w-3.5" />
              Asignados
            </div>
            <select
              multiple
              value={card.assignee_ids}
              onChange={(e) => {
                const ids = Array.from(e.target.selectedOptions).map(
                  (o) => o.value
                );
                updateCard(card.id, { assignee_ids: ids });
              }}
              className="w-full min-h-[7rem] rounded-lg bg-ink-800 p-2 text-sm text-ink-50 outline-none focus:ring-2 focus:ring-amber-arte"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id} className="py-1">
                  {u.name}
                </option>
              ))}
            </select>
            {card.assignee_ids.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {users
                  .filter((u) => card.assignee_ids.includes(u.id))
                  .map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-2 rounded-full bg-ink-800 pr-3 pl-1 py-1"
                    >
                      <Avatar user={u} />
                      <span className="text-xs text-ink-100">{u.name}</span>
                    </div>
                  ))}
              </div>
            )}
            <div className="mt-1 text-[10px] text-ink-400 italic">
              Mantén Ctrl/⌘ para seleccionar varios.
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
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    value={estCostDraft}
                    onChange={(e) => setEstCostDraft(e.target.value)}
                    onBlur={() =>
                      updateCard(card.id, {
                        estimated_cost:
                          estCostDraft === '' ? undefined : Number(estCostDraft)
                      })
                    }
                    className={inputCls + ' tabular-nums'}
                  />
                  <span className="text-ink-400 text-sm">€</span>
                </div>
                <div className="mt-1 text-[10px] text-ink-400 tabular-nums">
                  {formatEUR(card.estimated_cost)}
                </div>
              </Field>
              <Field label="Real">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    value={actCostDraft}
                    onChange={(e) => setActCostDraft(e.target.value)}
                    onBlur={() =>
                      updateCard(card.id, {
                        actual_cost:
                          actCostDraft === '' ? undefined : Number(actCostDraft)
                      })
                    }
                    className={inputCls + ' tabular-nums'}
                  />
                  <span className="text-ink-400 text-sm">€</span>
                </div>
                <div className="mt-1 text-[10px] text-ink-400 tabular-nums">
                  {formatEUR(card.actual_cost)}
                </div>
              </Field>
              <Field label="Estado">
                <select
                  value={card.approval_status ?? 'draft'}
                  onChange={(e) =>
                    updateCard(card.id, {
                      approval_status: e.target.value as ApprovalStatus
                    })
                  }
                  className={selectCls}
                >
                  <option value="draft">Borrador</option>
                  <option value="pending">Pendiente</option>
                  <option value="approved">Aprobado</option>
                  <option value="rejected">Rechazado</option>
                </select>
              </Field>
            </div>
            <div className="mt-2 text-[10px] text-ink-400 italic">
              Flujo de aprobación Arte → Producción se activa en Fase 2.
            </div>
          </section>

          {/* Acciones */}
          <section className="border-t border-ink-700 pt-4 space-y-2">
            <div className="flex flex-wrap gap-2">
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

              <button
                onClick={() => {
                  const newId = duplicateCard(card.id);
                  if (newId) {
                    setSelected(null);
                    // Pequeño delay para forzar reinicio de drafts en useEffect
                    setTimeout(() => setSelected(newId), 0);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-md bg-ink-700 px-3 py-2 text-xs font-semibold text-ink-100 hover:bg-ink-600 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicar tarjeta
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMoveMenu((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-md bg-ink-700 px-3 py-2 text-xs font-semibold text-ink-100 hover:bg-ink-600 transition-colors"
                >
                  <Move className="h-3.5 w-3.5" />
                  Mover a otra lista
                </button>
                {showMoveMenu && (
                  <div className="absolute bottom-full mb-1 left-0 z-10 min-w-[12rem] rounded-md border border-ink-700 bg-ink-800 shadow-2xl">
                    {lists
                      .filter((l) => l.id !== card.list_id)
                      .sort((a, b) => a.position - b.position)
                      .map((l) => {
                        const destCount = cards.filter(
                          (c) => c.list_id === l.id
                        ).length;
                        return (
                          <button
                            key={l.id}
                            onClick={() => {
                              moveCard(card.id, l.id, destCount);
                              setShowMoveMenu(false);
                            }}
                            className="block w-full px-3 py-2 text-left text-xs text-ink-100 hover:bg-ink-700 first:rounded-t-md last:rounded-b-md"
                          >
                            {l.title}
                          </button>
                        );
                      })}
                    {lists.filter((l) => l.id !== card.list_id).length ===
                      0 && (
                      <div className="px-3 py-2 text-xs text-ink-400 italic">
                        No hay otras listas.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

const inputCls =
  'w-full rounded bg-ink-800 px-2 py-1 text-sm text-ink-50 placeholder:text-ink-500 outline-none focus:ring-2 focus:ring-amber-arte';

const selectCls =
  'w-full rounded bg-ink-800 px-2 py-1 text-sm text-ink-50 outline-none focus:ring-2 focus:ring-amber-arte';

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
