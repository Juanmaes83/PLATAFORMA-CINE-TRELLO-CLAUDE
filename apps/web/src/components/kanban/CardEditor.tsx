'use client';

import {
  AlignLeft,
  Calendar,
  CheckSquare,
  CircleDollarSign,
  Copy,
  Film,
  GitBranch,
  Move,
  Plus,
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
  const checklists = useBoard((s) => s.checklists);
  const updateCard = useBoard((s) => s.updateCard);
  const deleteCard = useBoard((s) => s.deleteCard);
  const duplicateCard = useBoard((s) => s.duplicateCard);
  const moveCard = useBoard((s) => s.moveCard);
  const moveCardWithDescendants = useBoard((s) => s.moveCardWithDescendants);
  const addSubcard = useBoard((s) => s.addSubcard);
  const reorderChildren = useBoard((s) => s.reorderChildren);
  const addChecklist = useBoard((s) => s.addChecklist);
  const deleteChecklist = useBoard((s) => s.deleteChecklist);
  const addChecklistItem = useBoard((s) => s.addChecklistItem);
  const toggleChecklistItem = useBoard((s) => s.toggleChecklistItem);
  const removeChecklistItem = useBoard((s) => s.removeChecklistItem);

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
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [pendingMove, setPendingMove] = useState<{ listId: string } | null>(
    null
  );
  const [draggedChildId, setDraggedChildId] = useState<string | null>(null);

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

  const cardChildren = useMemo(
    () =>
      card
        ? cards
            .filter((c) => c.parent_card_id === card.id)
            .sort((a, b) => a.position - b.position)
        : [],
    [card, cards]
  );

  const cardChecklists = useMemo(
    () =>
      card
        ? checklists
            .filter((cl) => cl.card_id === card.id)
            .sort((a, b) => a.position - b.position)
        : [],
    [card, checklists]
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

          {/* Subtareas (tarjetas nodales) — Sprint 3 */}
          <section>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
              <GitBranch className="h-3.5 w-3.5" />
              Subtareas
              {cardChildren.length > 0 && (
                <span className="ml-1 rounded bg-violet-500/20 px-1.5 py-0.5 text-[9px] font-bold text-violet-300">
                  {cardChildren.filter((c) => {
                    const wf = lists.find((l) => l.id === c.list_id)?.workflow_type;
                    return wf === 'done' || wf === 'approved';
                  }).length}
                  /{cardChildren.length}
                </span>
              )}
            </div>
            {cardChildren.length > 0 && (
              <ul className="space-y-1 mb-2">
                {cardChildren.map((ch, idx) => {
                  const wf = lists.find((l) => l.id === ch.list_id)?.workflow_type;
                  const isDone = wf === 'done' || wf === 'approved';
                  return (
                    <li
                      key={ch.id}
                      draggable
                      onDragStart={() => setDraggedChildId(ch.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (!draggedChildId || draggedChildId === ch.id) return;
                        const ids = cardChildren.map((c) => c.id);
                        const from = ids.indexOf(draggedChildId);
                        const to = idx;
                        if (from === -1) return;
                        ids.splice(from, 1);
                        ids.splice(to, 0, draggedChildId);
                        reorderChildren(card.id, ids);
                        setDraggedChildId(null);
                      }}
                      className="flex items-center gap-2 rounded bg-ink-800/60 px-2 py-1.5 text-xs hover:bg-ink-800 cursor-grab active:cursor-grabbing"
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={(e) => {
                          // Mover la hija al final de la lista "done" o volver a la lista del padre.
                          const targetList = e.target.checked
                            ? lists.find((l) => l.workflow_type === 'done')
                            : lists.find((l) => l.id === card.list_id);
                          if (!targetList) return;
                          const destCount = cards.filter(
                            (c) => c.list_id === targetList.id
                          ).length;
                          moveCard(ch.id, targetList.id, destCount);
                        }}
                        className="h-3.5 w-3.5 rounded border-ink-600 bg-ink-700 text-amber-arte focus:ring-amber-arte"
                      />
                      <button
                        onClick={() => setSelected(ch.id)}
                        className="flex-1 truncate text-left text-ink-100 hover:text-amber-arte"
                      >
                        {ch.title}
                      </button>
                      <span
                        className={
                          'inline-block h-1.5 w-1.5 rounded-full ' +
                          (ch.approval_status === 'rejected'
                            ? 'bg-red-500'
                            : isDone
                            ? 'bg-emerald-500'
                            : 'bg-amber-500')
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="flex gap-2">
              <input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSubtaskTitle.trim()) {
                    addSubcard(card.id, newSubtaskTitle.trim());
                    setNewSubtaskTitle('');
                  }
                }}
                placeholder={
                  cardChildren.length === 0
                    ? 'Convertir en tarjeta nodal añadiendo una subtarea…'
                    : 'Añadir subtarea…'
                }
                className={inputCls + ' flex-1'}
              />
              <button
                onClick={() => {
                  if (!newSubtaskTitle.trim()) return;
                  addSubcard(card.id, newSubtaskTitle.trim());
                  setNewSubtaskTitle('');
                }}
                className="inline-flex items-center gap-1 rounded bg-ink-700 px-2 py-1 text-xs font-semibold text-ink-100 hover:bg-ink-600"
              >
                <Plus className="h-3.5 w-3.5" />
                Añadir
              </button>
            </div>
          </section>

          {/* Checklists (tarjetas simples) — Sprint 3 */}
          <section>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
              <CheckSquare className="h-3.5 w-3.5" />
              Checklist
            </div>
            {cardChecklists.length === 0 && cardChildren.length === 0 && (
              <div className="text-[10px] text-ink-400 italic mb-2">
                Usa checklist para tareas simples, o subtareas para tarjetas nodales.
              </div>
            )}
            {cardChecklists.map((cl) => {
              const doneCount = cl.items.filter((it) => it.done).length;
              return (
                <div
                  key={cl.id}
                  className="mb-3 rounded-lg bg-ink-800/60 p-3"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="text-xs font-semibold text-ink-100">
                      {cl.title}
                      <span className="ml-2 text-[10px] text-ink-400 tabular-nums">
                        {doneCount}/{cl.items.length}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar el checklist "${cl.title}"?`)) {
                          deleteChecklist(cl.id);
                        }
                      }}
                      className="text-ink-400 hover:text-red-400"
                      aria-label="Eliminar checklist"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {cl.items.map((it) => (
                      <li key={it.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={it.done}
                          onChange={() => toggleChecklistItem(cl.id, it.id)}
                          className="h-3.5 w-3.5 rounded border-ink-600 bg-ink-700 text-amber-arte focus:ring-amber-arte"
                        />
                        <span
                          className={
                            'flex-1 text-xs ' +
                            (it.done
                              ? 'line-through text-ink-400'
                              : 'text-ink-100')
                          }
                        >
                          {it.text}
                        </span>
                        <button
                          onClick={() => removeChecklistItem(cl.id, it.id)}
                          className="text-ink-500 hover:text-red-400"
                          aria-label="Quitar item"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <AddItemRow
                    onAdd={(text) => addChecklistItem(cl.id, text)}
                  />
                </div>
              );
            })}
            <div className="flex gap-2">
              <input
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newChecklistTitle.trim()) {
                    addChecklist(card.id, newChecklistTitle.trim());
                    setNewChecklistTitle('');
                  }
                }}
                placeholder="Nuevo checklist…"
                className={inputCls + ' flex-1'}
              />
              <button
                onClick={() => {
                  if (!newChecklistTitle.trim()) return;
                  addChecklist(card.id, newChecklistTitle.trim());
                  setNewChecklistTitle('');
                }}
                className="inline-flex items-center gap-1 rounded bg-ink-700 px-2 py-1 text-xs font-semibold text-ink-100 hover:bg-ink-600"
              >
                <Plus className="h-3.5 w-3.5" />
                Nuevo
              </button>
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
                        return (
                          <button
                            key={l.id}
                            onClick={() => {
                              setShowMoveMenu(false);
                              if (cardChildren.length > 0) {
                                // Pide confirmación (modal) antes de mover
                                setPendingMove({ listId: l.id });
                              } else {
                                const destCount = cards.filter(
                                  (c) => c.list_id === l.id
                                ).length;
                                moveCard(card.id, l.id, destCount);
                              }
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

      {/* Modal: mover tarjeta nodal con/sin subtareas */}
      {pendingMove && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-ink-700 bg-ink-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-ink-50 mb-2">
              Tarjeta nodal
            </h3>
            <p className="text-sm text-ink-300 mb-5">
              &quot;{card.title}&quot; tiene{' '}
              <span className="font-semibold text-ink-100">
                {cardChildren.length} subtarea{cardChildren.length !== 1 && 's'}
              </span>
              . ¿Mover solo esta tarjeta o también sus subtareas?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  const destCount = cards.filter(
                    (c) => c.list_id === pendingMove.listId
                  ).length;
                  moveCard(card.id, pendingMove.listId, destCount);
                  setPendingMove(null);
                }}
                className="w-full rounded-md bg-ink-700 px-4 py-2 text-sm font-semibold text-ink-100 hover:bg-ink-600"
              >
                Solo esta tarjeta
              </button>
              <button
                onClick={() => {
                  const destCount = cards.filter(
                    (c) => c.list_id === pendingMove.listId
                  ).length;
                  moveCardWithDescendants(
                    card.id,
                    pendingMove.listId,
                    destCount
                  );
                  setPendingMove(null);
                }}
                className="w-full rounded-md bg-amber-arte px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-amber-arte/90"
              >
                Esta y sus {cardChildren.length} subtarea
                {cardChildren.length !== 1 && 's'}
              </button>
              <button
                onClick={() => setPendingMove(null)}
                className="w-full rounded-md px-4 py-2 text-xs text-ink-400 hover:text-ink-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
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

function AddItemRow({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState('');
  const commit = () => {
    const v = text.trim();
    if (!v) return;
    onAdd(v);
    setText('');
  };
  return (
    <div className="mt-2 flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
        }}
        placeholder="Añadir item…"
        className={inputCls + ' flex-1 text-xs'}
      />
      <button
        onClick={commit}
        className="inline-flex items-center rounded bg-ink-700 px-2 py-1 text-[10px] font-semibold text-ink-100 hover:bg-ink-600"
      >
        +
      </button>
    </div>
  );
}
