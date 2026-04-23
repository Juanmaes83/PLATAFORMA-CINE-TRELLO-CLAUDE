import type { Board, Card, List, User } from '@artemis/types';

/**
 * Seed inicial: proyecto ficticio "GOLDEN HOUR · S01"
 * Tablero piloto: PROPS (subdepto. Atrezzo)
 *
 * Las tarjetas reflejan el flujo real descrito en el Bloque 1.4.4:
 *   Necesidad → Búsqueda → Adquirido → Taller → En Set → Devuelto
 */

export const seedUsers: User[] = [
  {
    id: 'u_ana',
    name: 'Ana Castaño',
    email: 'ana.castano@goldenhour.tv',
    avatar_color: '#f5b400',
    role: 'art_director'
  },
  {
    id: 'u_marc',
    name: 'Marc Rovira',
    email: 'marc.rovira@goldenhour.tv',
    avatar_color: '#06b6d4',
    role: 'department_lead'
  },
  {
    id: 'u_lucia',
    name: 'Lucía Ferrer',
    email: 'lucia.ferrer@goldenhour.tv',
    avatar_color: '#ec4899',
    role: 'crew'
  },
  {
    id: 'u_nico',
    name: 'Nico Vega',
    email: 'nico.vega@goldenhour.tv',
    avatar_color: '#a78bfa',
    role: 'production_manager'
  }
];

export const seedBoard: Board = {
  id: 'b_props_01',
  title: 'GOLDEN HOUR · S01 — Atrezzo / Props',
  subdepartment: 'props',
  project_id: 'p_golden_hour',
  background:
    'linear-gradient(135deg, #1a1e23 0%, #272c32 50%, #363c43 100%)',
  created_at: new Date().toISOString()
};

export const seedLists: List[] = [
  {
    id: 'l_need',
    board_id: 'b_props_01',
    title: 'Necesidad',
    position: 0,
    workflow_type: 'todo'
  },
  {
    id: 'l_search',
    board_id: 'b_props_01',
    title: 'Búsqueda',
    position: 1,
    workflow_type: 'in_progress'
  },
  {
    id: 'l_acquired',
    board_id: 'b_props_01',
    title: 'Adquirido / Taller',
    position: 2,
    workflow_type: 'review'
  },
  {
    id: 'l_onset',
    board_id: 'b_props_01',
    title: 'En Set',
    position: 3,
    workflow_type: 'approved',
    wip_limit: 8
  },
  {
    id: 'l_returned',
    board_id: 'b_props_01',
    title: 'Devuelto',
    position: 4,
    workflow_type: 'done'
  }
];

const now = new Date().toISOString();

export const seedCards: Card[] = [
  {
    id: 'c_001',
    list_id: 'l_need',
    board_id: 'b_props_01',
    position: 0,
    title: 'Reloj de bolsillo grabado del abuelo',
    description:
      'Hero prop. Aparece en flashback Esc. 12A y plano detalle Esc. 47.',
    cover_color: '#f5b400',
    scene_numbers: ['12A', '47'],
    script_reference: 'pp. 23, 89',
    art_metadata: {
      subdept: 'props',
      data: {
        is_hero: true,
        is_breakaway: false,
        quantity: 3,
        source: 'fabrication',
        continuity_notes:
          'Inscripción "1947 · A.M." en tapa interior. Mantener pátina envejecida.'
      }
    },
    assignee_ids: ['u_ana', 'u_lucia'],
    due_date: '2026-05-12',
    priority: 'critical',
    labels: ['Hero', 'Atrezzo de Acción'],
    estimated_cost: 1200,
    approval_status: 'pending',
    created_at: now,
    updated_at: now,
    created_by: 'u_ana'
  },
  {
    id: 'c_002',
    list_id: 'l_need',
    board_id: 'b_props_01',
    position: 1,
    title: 'Periódico de época "El Heraldo, marzo 1962"',
    description: 'Portada con titular sobre el incendio del Café Castilla.',
    scene_numbers: ['8'],
    script_reference: 'p. 14',
    art_metadata: {
      subdept: 'props',
      data: { is_hero: false, quantity: 12, source: 'fabrication' }
    },
    assignee_ids: ['u_marc'],
    due_date: '2026-05-08',
    priority: 'high',
    labels: ['Atrezzo de Decorado'],
    estimated_cost: 340,
    approval_status: 'draft',
    created_at: now,
    updated_at: now,
    created_by: 'u_marc'
  },
  {
    id: 'c_003',
    list_id: 'l_search',
    board_id: 'b_props_01',
    position: 0,
    title: 'Máquina de escribir Olivetti Lettera 32',
    description: 'Funcional. Color verde oliva original.',
    scene_numbers: ['22', '23', '25'],
    art_metadata: {
      subdept: 'props',
      data: { quantity: 1, source: 'rental', return_date: '2026-06-30' }
    },
    assignee_ids: ['u_lucia'],
    due_date: '2026-05-15',
    priority: 'medium',
    labels: ['Alquiler'],
    estimated_cost: 180,
    approval_status: 'approved',
    created_at: now,
    updated_at: now,
    created_by: 'u_lucia'
  },
  {
    id: 'c_004',
    list_id: 'l_search',
    board_id: 'b_props_01',
    position: 1,
    title: 'Botella de whisky breakaway (×6)',
    description: 'Para Esc. 31 — pelea bar. Cristal de azúcar.',
    cover_color: '#dc2626',
    scene_numbers: ['31'],
    art_metadata: {
      subdept: 'props',
      data: {
        is_hero: false,
        is_breakaway: true,
        quantity: 6,
        source: 'fabrication',
        continuity_notes:
          'Etiqueta ficticia "Old Cobblestone" ya aprobada por legal.'
      }
    },
    assignee_ids: ['u_marc', 'u_lucia'],
    due_date: '2026-05-20',
    priority: 'high',
    labels: ['Breakaway', 'Stunt'],
    estimated_cost: 720,
    approval_status: 'approved',
    created_at: now,
    updated_at: now,
    created_by: 'u_marc'
  },
  {
    id: 'c_005',
    list_id: 'l_acquired',
    board_id: 'b_props_01',
    position: 0,
    title: 'Maleta de cuero marrón años 60',
    description: 'Iniciales "A.M." grabadas en plata. En taller para envejecido.',
    scene_numbers: ['1', '2', '54'],
    art_metadata: {
      subdept: 'props',
      data: {
        is_hero: true,
        quantity: 2,
        source: 'purchase',
        continuity_notes: 'Doble idéntico para escena de lluvia.'
      }
    },
    assignee_ids: ['u_ana'],
    priority: 'high',
    labels: ['Hero', 'Envejecido'],
    estimated_cost: 540,
    actual_cost: 510,
    approval_status: 'approved',
    created_at: now,
    updated_at: now,
    created_by: 'u_ana'
  },
  {
    id: 'c_006',
    list_id: 'l_onset',
    board_id: 'b_props_01',
    position: 0,
    title: 'Carta manuscrita en papel envejecido',
    description: 'Caligrafía aprobada por dirección. Tinta sepia.',
    scene_numbers: ['47'],
    art_metadata: {
      subdept: 'props',
      data: { is_hero: true, quantity: 4, source: 'fabrication' }
    },
    assignee_ids: ['u_lucia'],
    priority: 'medium',
    labels: ['Hero', 'Continuidad'],
    estimated_cost: 90,
    actual_cost: 85,
    approval_status: 'approved',
    created_at: now,
    updated_at: now,
    created_by: 'u_lucia'
  },
  {
    id: 'c_007',
    list_id: 'l_returned',
    board_id: 'b_props_01',
    position: 0,
    title: 'Teléfono de baquelita negro (alquiler)',
    description: 'Devuelto a Decorados Históricos S.L. el 18/04.',
    scene_numbers: ['5'],
    art_metadata: {
      subdept: 'props',
      data: { quantity: 1, source: 'rental' }
    },
    assignee_ids: ['u_marc'],
    priority: 'low',
    labels: ['Alquiler'],
    estimated_cost: 60,
    actual_cost: 60,
    approval_status: 'approved',
    created_at: now,
    updated_at: now,
    created_by: 'u_marc'
  }
];
