/**
 * ARTEMIS · Tipos compartidos del dominio cinematográfico
 * --------------------------------------------------------
 * Modelo alineado con la arquitectura del Bloque 1:
 *  - cards con art_metadata (JSONB) por subdepartamento
 *  - lists con workflow_type
 *  - boards multi-tenant
 *
 * Estos tipos se replicarán en el esquema Prisma/Drizzle
 * cuando se active la persistencia (Sprint 1).
 */

export type Subdepartment =
  | 'graphics'
  | 'props'
  | 'set_decoration'
  | 'construction'
  | 'production';

export type WorkflowType =
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'approved'
  | 'done'
  | 'archived';

export type CardPriority = 'low' | 'medium' | 'high' | 'critical';

export type ApprovalStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected';

/* -------------------- Metadata por subdepartamento -------------------- */

export interface GraphicsMetadata {
  asset_type?: 'logo' | 'newspaper' | 'sign' | 'document' | 'wallpaper' | 'other';
  print_specs?: { material?: string; dimensions?: string; copies?: number };
  brand_clearance?: 'cleared' | 'pending' | 'fictional';
}

export interface PropsMetadata {
  is_hero?: boolean;
  is_breakaway?: boolean;
  quantity?: number;
  source?: 'rental' | 'purchase' | 'fabrication' | 'loan';
  return_date?: string; // ISO
  continuity_notes?: string;
}

export interface SetDecorationMetadata {
  dressing_zone?: string;
  reference_images?: string[];
  pull_list_ref?: string;
}

export interface ConstructionMetadata {
  blueprint_ref?: string;
  materials?: string[];
  cad_file_url?: string;
  weight_kg?: number;
}

export type ArtMetadata =
  | { subdept: 'graphics'; data: GraphicsMetadata }
  | { subdept: 'props'; data: PropsMetadata }
  | { subdept: 'set_decoration'; data: SetDecorationMetadata }
  | { subdept: 'construction'; data: ConstructionMetadata }
  | { subdept: 'production'; data: Record<string, unknown> };

/* -------------------- Entidades principales -------------------- */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_color: string;
  role: 'admin' | 'production_manager' | 'art_director' | 'department_lead' | 'crew' | 'viewer';
}

export interface Comment {
  id: string;
  card_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  card_id: string;
  filename: string;
  url: string;
  size_bytes: number;
  uploaded_at: string;
}

export interface Card {
  id: string;
  list_id: string;
  board_id: string;
  parent_card_id?: string | null; // nodal: null/undefined = raíz
  position: number; // orden dentro de la lista
  title: string;
  description?: string;
  cover_color?: string;

  // Cinematográfico
  scene_numbers?: string[];     // ej. ["12A", "12B"]
  script_reference?: string;
  art_metadata?: ArtMetadata;

  // Asignación / fechas
  assignee_ids: string[];
  due_date?: string;
  priority: CardPriority;
  labels: string[];

  // Financiero (RBAC: solo visible para roles autorizados)
  estimated_cost?: number;
  actual_cost?: number;
  approval_status?: ApprovalStatus;

  // Auditoría
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface List {
  id: string;
  board_id: string;
  title: string;
  position: number;
  workflow_type: WorkflowType;
  wip_limit?: number; // WIP limit Kanban (Fase 2)
}

export interface Board {
  id: string;
  title: string;
  subdepartment: Subdepartment;
  project_id: string;
  background: string; // gradiente o color (estilo Trello)
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  code: string; // ej. "GLDN-S01"
  client?: string;
}

/**
 * Multi-proyecto: un usuario puede pertenecer a N proyectos con roles distintos.
 * Reservado para Sprint 5 (auth + RBAC multi-proyecto).
 */
export interface UserFunction {
  id: string;
  user_id: string;
  project_id: string;
  role: User['role'];
  subdepartment?: Subdepartment;
  created_at: string;
}

