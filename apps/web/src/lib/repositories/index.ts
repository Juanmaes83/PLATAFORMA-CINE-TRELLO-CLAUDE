/**
 * Selector de bundle de repositorios según DATA_LAYER.
 * SERVER-ONLY: se llama desde server actions / route handlers.
 * El PrismaClient no puede (ni debe) ejecutarse en el navegador.
 *
 *   DATA_LAYER=prisma  (default) -> Postgres
 *   DATA_LAYER=memory            -> arrays en memoria (demo / tests)
 */

import { memoryRepos, prismaRepos, type RepositoryBundle } from '@artemis/db';

let _repos: RepositoryBundle | null = null;

export function getRepos(): RepositoryBundle {
  if (_repos) return _repos;
  const layer = (process.env.DATA_LAYER ?? 'prisma').toLowerCase();
  _repos = layer === 'memory' ? memoryRepos : prismaRepos;
  return _repos;
}
