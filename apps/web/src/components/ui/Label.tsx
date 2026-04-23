import { cn } from '../../lib/utils';

const palette: Record<string, string> = {
  Hero: 'bg-amber-arte/90 text-ink-950',
  Breakaway: 'bg-red-500/90 text-white',
  Stunt: 'bg-red-700/90 text-white',
  Alquiler: 'bg-cyan-500/90 text-ink-950',
  Continuidad: 'bg-emerald-500/90 text-ink-950',
  Envejecido: 'bg-amber-700/90 text-white',
  'Atrezzo de Acción': 'bg-fuchsia-600/90 text-white',
  'Atrezzo de Decorado': 'bg-indigo-500/90 text-white'
};

export function Label({ name }: { name: string }) {
  const cls = palette[name] ?? 'bg-ink-600 text-ink-100';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        cls
      )}
    >
      {name}
    </span>
  );
}
