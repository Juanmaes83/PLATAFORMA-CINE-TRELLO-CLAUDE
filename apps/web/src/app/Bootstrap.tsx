'use client';

import { useEffect } from 'react';
import { useBoard } from '../store/board';

/**
 * Client-side bootstrap:
 *   - Hidrata el store desde Postgres en el primer mount.
 *   - Monta el stack de toasts de error (auto-dismiss 3s).
 * Vive fuera de src/components/ para no tocar la UI del Kanban.
 */
export function Bootstrap({ children }: { children: React.ReactNode }) {
  const hydrated = useBoard((s) => s.hydrated);
  const toasts = useBoard((s) => s.toasts);
  const dismiss = useBoard((s) => s.dismissToast);

  useEffect(() => {
    if (!hydrated) {
      void useBoard.getState().hydrate();
    }
  }, [hydrated]);

  return (
    <>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
          {toasts.map((t) => (
            <div
              key={t.id}
              role="alert"
              className="rounded-lg border border-red-500/40 bg-red-500/15 backdrop-blur px-4 py-3 text-sm text-red-100 shadow-2xl animate-fade-in"
            >
              <div className="flex items-start gap-3">
                <span className="flex-1">{t.message}</span>
                <button
                  onClick={() => dismiss(t.id)}
                  className="text-red-200 hover:text-red-50 text-lg leading-none"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
