/**
 * Cálculo puro del progreso de una tarjeta.
 *
 *   - Si tiene HIJOS  -> modo "nodal": % = done / total (done = hija cuya
 *     lista es workflow_type "done" o "approved").
 *   - Si tiene CHECKLIST pero NO hijos -> modo "simple": % = items done / items total.
 *   - Ninguno -> devuelve null (la UI oculta la barra).
 *
 * "Bloqueado" en modo nodal: hija con approval_status === 'rejected'.
 * (Decisión de mapeo — el modelo no tiene estado blocked explícito.)
 */

import type { Card, Checklist, List } from '@artemis/types';

export interface ProgressResult {
  percent: number;
  mode: 'simple' | 'nodal';
  blocked: boolean;
  breakdown: {
    total: number;
    done: number;
  };
}

const DONE_WORKFLOWS = new Set(['done', 'approved']);

export function cardProgress(
  cardId: string,
  allCards: Card[],
  allLists: List[],
  allChecklists: Checklist[]
): ProgressResult | null {
  const children = allCards.filter((c) => c.parent_card_id === cardId);

  if (children.length > 0) {
    const listById = new Map(allLists.map((l) => [l.id, l]));
    let done = 0;
    let blocked = false;
    for (const child of children) {
      const wf = listById.get(child.list_id)?.workflow_type;
      if (wf && DONE_WORKFLOWS.has(wf)) done += 1;
      if (child.approval_status === 'rejected') blocked = true;
    }
    return {
      percent: Math.round((done / children.length) * 100),
      mode: 'nodal',
      blocked,
      breakdown: { total: children.length, done }
    };
  }

  const checklists = allChecklists.filter((cl) => cl.card_id === cardId);
  if (checklists.length === 0) return null;

  let total = 0;
  let done = 0;
  for (const cl of checklists) {
    for (const it of cl.items) {
      total += 1;
      if (it.done) done += 1;
    }
  }
  if (total === 0) return null;

  return {
    percent: Math.round((done / total) * 100),
    mode: 'simple',
    blocked: false,
    breakdown: { total, done }
  };
}
