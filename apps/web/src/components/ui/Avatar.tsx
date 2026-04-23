import type { User } from '@artemis/types';
import { cn } from '../../lib/utils';

interface Props {
  user: User;
  size?: 'sm' | 'md';
  ring?: boolean;
}

export function Avatar({ user, size = 'sm', ring }: Props) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      title={user.name}
      className={cn(
        'flex items-center justify-center rounded-full font-semibold text-ink-950 select-none',
        size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-xs',
        ring && 'ring-2 ring-ink-800'
      )}
      style={{ background: user.avatar_color }}
    >
      {initials}
    </div>
  );
}
