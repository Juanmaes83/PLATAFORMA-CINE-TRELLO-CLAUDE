import type { RepositoryBundle } from '../index';
import { prismaCardRepo } from './repositories/cards';
import { prismaListRepo } from './repositories/lists';
import { prismaBoardRepo } from './repositories/boards';
import { prismaUserRepo } from './repositories/users';

export const prismaRepos: RepositoryBundle = {
  cards: prismaCardRepo,
  lists: prismaListRepo,
  boards: prismaBoardRepo,
  users: prismaUserRepo
};
