import type { CardPriority, WorkflowType } from '@artemis/types';

export function cn(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(' ');
}

export function formatEUR(value?: number) {
  if (value === undefined || value === null) return '—';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short'
  }).format(d);
}

export const priorityColor: Record<CardPriority, string> = {
  low: 'bg-ink-500',
  medium: 'bg-cyan-600',
  high: 'bg-orange-500',
  critical: 'bg-red-600'
};

export const priorityLabel: Record<CardPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica'
};

export const workflowAccent: Record<WorkflowType, string> = {
  todo: 'border-t-ink-400',
  in_progress: 'border-t-cyan-500',
  review: 'border-t-amber-arte',
  approved: 'border-t-emerald-500',
  done: 'border-t-emerald-700',
  archived: 'border-t-ink-700'
};
