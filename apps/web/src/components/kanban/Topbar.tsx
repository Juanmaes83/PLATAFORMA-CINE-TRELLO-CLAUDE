'use client';

import { Clapperboard, LayoutGrid, Search, Settings } from 'lucide-react';
import { useBoard } from '../../store/board';
import { Avatar } from '../ui/Avatar';

export function Topbar() {
  const users = useBoard((s) => s.users);
  const currentUser = users[0];

  return (
    <header className="flex items-center justify-between gap-4 border-b border-ink-700/50 bg-ink-950/70 backdrop-blur-md px-6 py-3">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-arte text-ink-950">
          <Clapperboard className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-base font-bold text-ink-50">
            ARTEMIS
          </div>
          <div className="text-[10px] uppercase tracking-widest text-ink-400">
            Production · Art Department
          </div>
        </div>
      </div>

      {/* Subdept switcher (visual, MVP) */}
      <nav className="hidden md:flex items-center gap-1 rounded-lg bg-ink-800/60 p-1">
        {[
          { k: 'props', label: 'Atrezzo', active: true },
          { k: 'graphics', label: 'Grafismo' },
          { k: 'set_decoration', label: 'Decorados' },
          { k: 'construction', label: 'Construcción' }
        ].map((tab) => (
          <button
            key={tab.k}
            disabled={!tab.active}
            className={
              tab.active
                ? 'rounded-md bg-amber-arte px-3 py-1 text-xs font-semibold text-ink-950'
                : 'rounded-md px-3 py-1 text-xs text-ink-400 hover:text-ink-200 disabled:cursor-not-allowed'
            }
            title={
              tab.active
                ? undefined
                : 'Disponible cuando se active este subdepartamento (Sprint 2)'
            }
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="rounded-md p-1.5 text-ink-300 hover:bg-ink-800 hover:text-ink-50 transition-colors">
          <Search className="h-4 w-4" />
        </button>
        <button className="rounded-md p-1.5 text-ink-300 hover:bg-ink-800 hover:text-ink-50 transition-colors">
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button className="rounded-md p-1.5 text-ink-300 hover:bg-ink-800 hover:text-ink-50 transition-colors">
          <Settings className="h-4 w-4" />
        </button>
        <div className="h-6 w-px bg-ink-700" />
        {currentUser && (
          <div className="flex items-center gap-2">
            <Avatar user={currentUser} size="md" />
            <div className="hidden sm:block leading-tight">
              <div className="text-xs font-semibold text-ink-50">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-ink-400 capitalize">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
