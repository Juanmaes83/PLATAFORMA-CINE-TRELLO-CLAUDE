/**
 * ARTEMIS · Seed de Postgres
 * Replica los datos de apps/web/src/lib/seed.ts (snapshot al 2026-04-23)
 * con la adición del Project "GOLDEN HOUR" (referenciado por Board.project_id).
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const now = new Date();

const users = [
  {
    id: 'u_ana',
    name: 'Ana Castaño',
    email: 'ana.castano@goldenhour.tv',
    avatar_color: '#f5b400',
    role: 'art_director' as const
  },
  {
    id: 'u_marc',
    name: 'Marc Rovira',
    email: 'marc.rovira@goldenhour.tv',
    avatar_color: '#06b6d4',
    role: 'department_lead' as const
  },
  {
    id: 'u_lucia',
    name: 'Lucía Ferrer',
    email: 'lucia.ferrer@goldenhour.tv',
    avatar_color: '#ec4899',
    role: 'crew' as const
  },
  {
    id: 'u_nico',
    name: 'Nico Vega',
    email: 'nico.vega@goldenhour.tv',
    avatar_color: '#a78bfa',
    role: 'production_manager' as const
  }
];

const project = {
  id: 'p_golden_hour',
  title: 'GOLDEN HOUR',
  code: 'GLDN-S01',
  client: 'Atresplayer Premium'
};

const board = {
  id: 'b_props_01',
  title: 'GOLDEN HOUR · S01 — Atrezzo / Props',
  subdepartment: 'props' as const,
  project_id: 'p_golden_hour',
  background:
    'linear-gradient(135deg, #1a1e23 0%, #272c32 50%, #363c43 100%)',
  created_at: now
};

const lists = [
  {
    id: 'l_need',
    board_id: 'b_props_01',
    title: 'Necesidad',
    position: 0,
    workflow_type: 'todo' as const
  },
  {
    id: 'l_search',
    board_id: 'b_props_01',
    title: 'Búsqueda',
    position: 1,
    workflow_type: 'in_progress' as const
  },
  {
    id: 'l_acquired',
    board_id: 'b_props_01',
    title: 'Adquirido / Taller',
    position: 2,
    workflow_type: 'review' as const
  },
  {
    id: 'l_onset',
    board_id: 'b_props_01',
    title: 'En Set',
    position: 3,
    workflow_type: 'approved' as const,
    wip_limit: 8
  },
  {
    id: 'l_returned',
    board_id: 'b_props_01',
    title: 'Devuelto',
    position: 4,
    workflow_type: 'done' as const
  }
];

type SeedCard = Omit<Prisma.CardCreateManyInput, 'art_metadata'> & {
  art_metadata?: Prisma.InputJsonValue;
};

const cards: SeedCard[] = [
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
    due_date: new Date('2026-05-12'),
    priority: 'critical',
    labels: ['Hero', 'Atrezzo de Acción'],
    estimated_cost: 1200,
    approval_status: 'pending',
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
    due_date: new Date('2026-05-08'),
    priority: 'high',
    labels: ['Atrezzo de Decorado'],
    estimated_cost: 340,
    approval_status: 'draft',
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
    due_date: new Date('2026-05-15'),
    priority: 'medium',
    labels: ['Alquiler'],
    estimated_cost: 180,
    approval_status: 'approved',
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
    due_date: new Date('2026-05-20'),
    priority: 'high',
    labels: ['Breakaway', 'Stunt'],
    estimated_cost: 720,
    approval_status: 'approved',
    created_by: 'u_marc'
  },
  {
    id: 'c_005',
    list_id: 'l_acquired',
    board_id: 'b_props_01',
    position: 0,
    title: 'Maleta de cuero marrón años 60',
    description:
      'Iniciales "A.M." grabadas en plata. En taller para envejecido.',
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
    created_by: 'u_marc'
  },
  // Hijas del reloj (c_001): demo de tarjeta nodal con 3 subtareas.
  {
    id: 'c_001a',
    list_id: 'l_returned',
    board_id: 'b_props_01',
    parent_card_id: 'c_001',
    position: 0,
    title: 'Grabado manual inscripción tapa',
    scene_numbers: ['12A'],
    assignee_ids: ['u_lucia'],
    priority: 'high',
    labels: ['Hero'],
    approval_status: 'approved',
    created_by: 'u_ana'
  },
  {
    id: 'c_001b',
    list_id: 'l_search',
    board_id: 'b_props_01',
    parent_card_id: 'c_001',
    position: 2,
    title: 'Proveedor de cadena de acero envejecida',
    scene_numbers: ['47'],
    assignee_ids: ['u_marc'],
    priority: 'medium',
    labels: [],
    approval_status: 'pending',
    created_by: 'u_ana'
  },
  {
    id: 'c_001c',
    list_id: 'l_need',
    board_id: 'b_props_01',
    parent_card_id: 'c_001',
    position: 2,
    title: 'Doblaje: réplica para plano detalle',
    scene_numbers: ['47'],
    assignee_ids: ['u_ana'],
    priority: 'medium',
    labels: ['Hero'],
    approval_status: 'draft',
    created_by: 'u_ana'
  }
];

// Checklist demo en c_002 (prop simple con 4 pasos).
const checklists = [
  {
    id: 'ck_c002_1',
    card_id: 'c_002',
    title: 'Flujo de producción',
    position: 0,
    items: [
      { id: 'i_1', text: 'Redactar titular y cuerpo del artículo', done: true },
      { id: 'i_2', text: 'Maquetar en InDesign estilo época', done: true },
      { id: 'i_3', text: 'Imprimir 12 copias en papel envejecido', done: false },
      { id: 'i_4', text: 'Envejecer manualmente con té', done: false }
    ]
  }
];

async function main() {
  console.log('🎬 ARTEMIS · seed start');

  // Orden respeta foreign keys: Project → User → Board → List → Card
  await prisma.checklist.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  // Hijas primero (self-FK onDelete SetNull pero mejor explícito).
  await prisma.card.deleteMany({ where: { parent_card_id: { not: null } } });
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.board.deleteMany();
  await prisma.userFunction.deleteMany();
  await prisma.user.deleteMany();
  await prisma.project.deleteMany();

  await prisma.project.create({ data: project });
  console.log(`  ✓ 1 project`);

  await prisma.user.createMany({ data: users });
  console.log(`  ✓ ${users.length} users`);

  await prisma.board.create({ data: board });
  console.log(`  ✓ 1 board`);

  await prisma.list.createMany({ data: lists });
  console.log(`  ✓ ${lists.length} lists`);

  // Insertamos padres primero (c_00X sin parent), luego hijas (c_001a/b/c).
  const parents = cards.filter((c) => !c.parent_card_id);
  const children = cards.filter((c) => c.parent_card_id);
  await prisma.card.createMany({
    data: parents as Prisma.CardCreateManyInput[]
  });
  if (children.length > 0) {
    await prisma.card.createMany({
      data: children as Prisma.CardCreateManyInput[]
    });
  }
  console.log(`  ✓ ${cards.length} cards (${children.length} subtareas)`);

  await prisma.checklist.createMany({
    data: checklists.map((cl) => ({
      id: cl.id,
      card_id: cl.card_id,
      title: cl.title,
      position: cl.position,
      items: cl.items as unknown as Prisma.InputJsonValue
    }))
  });
  console.log(`  ✓ ${checklists.length} checklist(s)`);

  console.log('✅ seed done');
}

main()
  .catch((e) => {
    console.error('❌ seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
