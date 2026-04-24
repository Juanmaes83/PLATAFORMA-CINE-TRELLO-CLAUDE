/**
 * Mappers DB row <-> @artemis/types.
 * Prisma devuelve Date objects y Json (unknown); @artemis/types usa ISO strings
 * y la unión ArtMetadata tipada.
 */

import type {
  ArtMetadata,
  Board,
  Card,
  CardPriority,
  ApprovalStatus,
  Checklist,
  ChecklistItem,
  List,
  User,
  WorkflowType
} from '@artemis/types';

type CardRow = {
  id: string;
  list_id: string;
  board_id: string;
  parent_card_id: string | null;
  position: number;
  title: string;
  description: string | null;
  cover_color: string | null;
  scene_numbers: string[];
  script_reference: string | null;
  art_metadata: unknown;
  assignee_ids: string[];
  due_date: Date | null;
  priority: CardPriority;
  labels: string[];
  estimated_cost: number | null;
  actual_cost: number | null;
  approval_status: ApprovalStatus | null;
  created_at: Date;
  updated_at: Date;
  created_by: string;
};

type ListRow = {
  id: string;
  board_id: string;
  title: string;
  position: number;
  workflow_type: WorkflowType;
  wip_limit: number | null;
};

type BoardRow = {
  id: string;
  title: string;
  subdepartment: Board['subdepartment'];
  project_id: string;
  background: string;
  created_at: Date;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  avatar_color: string;
  role: User['role'];
};

export function rowToCard(row: CardRow): Card {
  return {
    id: row.id,
    list_id: row.list_id,
    board_id: row.board_id,
    parent_card_id: row.parent_card_id,
    position: row.position,
    title: row.title,
    description: row.description ?? undefined,
    cover_color: row.cover_color ?? undefined,
    scene_numbers: row.scene_numbers.length > 0 ? row.scene_numbers : undefined,
    script_reference: row.script_reference ?? undefined,
    art_metadata: (row.art_metadata as ArtMetadata | null) ?? undefined,
    assignee_ids: row.assignee_ids,
    due_date: row.due_date ? row.due_date.toISOString() : undefined,
    priority: row.priority,
    labels: row.labels,
    estimated_cost: row.estimated_cost ?? undefined,
    actual_cost: row.actual_cost ?? undefined,
    approval_status: row.approval_status ?? undefined,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
    created_by: row.created_by
  };
}

export function rowToList(row: ListRow): List {
  return {
    id: row.id,
    board_id: row.board_id,
    title: row.title,
    position: row.position,
    workflow_type: row.workflow_type,
    wip_limit: row.wip_limit ?? undefined
  };
}

export function rowToBoard(row: BoardRow): Board {
  return {
    id: row.id,
    title: row.title,
    subdepartment: row.subdepartment,
    project_id: row.project_id,
    background: row.background,
    created_at: row.created_at.toISOString()
  };
}

export function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar_color: row.avatar_color,
    role: row.role
  };
}

type ChecklistRow = {
  id: string;
  card_id: string;
  title: string;
  items: unknown;
  position: number;
};

function coerceItems(raw: unknown): ChecklistItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (it): it is { id: unknown; text: unknown; done: unknown } =>
        typeof it === 'object' && it !== null
    )
    .map((it) => ({
      id: String(it.id ?? ''),
      text: String(it.text ?? ''),
      done: Boolean(it.done)
    }))
    .filter((it) => it.id.length > 0);
}

export function rowToChecklist(row: ChecklistRow): Checklist {
  return {
    id: row.id,
    card_id: row.card_id,
    title: row.title,
    items: coerceItems(row.items),
    position: row.position
  };
}

/**
 * Serializa un patch parcial de Card a columnas DB.
 * Campos string `due_date` -> Date; `art_metadata` -> Json.
 */
export function cardPatchToDb(
  patch: Partial<Card>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.list_id !== undefined) out.list_id = patch.list_id;
  if (patch.parent_card_id !== undefined) out.parent_card_id = patch.parent_card_id;
  if (patch.position !== undefined) out.position = patch.position;
  if (patch.title !== undefined) out.title = patch.title;
  if (patch.description !== undefined) out.description = patch.description;
  if (patch.cover_color !== undefined) out.cover_color = patch.cover_color;
  if (patch.scene_numbers !== undefined) out.scene_numbers = patch.scene_numbers;
  if (patch.script_reference !== undefined)
    out.script_reference = patch.script_reference;
  if (patch.art_metadata !== undefined) out.art_metadata = patch.art_metadata;
  if (patch.assignee_ids !== undefined) out.assignee_ids = patch.assignee_ids;
  if (patch.due_date !== undefined)
    out.due_date = patch.due_date ? new Date(patch.due_date) : null;
  if (patch.priority !== undefined) out.priority = patch.priority;
  if (patch.labels !== undefined) out.labels = patch.labels;
  if (patch.estimated_cost !== undefined)
    out.estimated_cost = patch.estimated_cost;
  if (patch.actual_cost !== undefined) out.actual_cost = patch.actual_cost;
  if (patch.approval_status !== undefined)
    out.approval_status = patch.approval_status;
  return out;
}
