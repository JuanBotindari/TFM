/* ============================================
   MOCK DATA — Supabase-Ready Structure
   ============================================ */

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry: string;
  logo: string;
  plan: 'basic' | 'pro' | 'enterprise';
  createdAt: string;
  documentsCount: number;
  usersCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  orgId: string;
  avatar: string;
  joinedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'csv' | 'txt';
  size: string;
  status: 'indexed' | 'processing' | 'error';
  uploadedBy: string;
  uploadedAt: string;
  orgId: string;
  accessUserIds: string[];
  filePath?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { docName: string; page?: number; relevance: number }[];
  timestamp: string;
}

export interface SqlQuery {
  id: string;
  name: string;
  query: string;
  createdBy: string;
  createdAt: string;
  lastRun: string;
  rowsReturned: number;
}

// ── Organizations ──────────────────────────

export const mockOrganizations: Organization[] = [
  {
    id: 'org-banco',
    name: 'Banco Metropolitano',
    slug: 'banco-metropolitano',
    industry: 'Banca & Finanzas',
    logo: '🏦',
    plan: 'enterprise',
    createdAt: '2024-01-15',
    documentsCount: 342,
    usersCount: 28,
  },
  {
    id: 'org-estudio',
    name: 'Estudio Contable Botindari',
    slug: 'estudio-botindari',
    industry: 'Contabilidad',
    logo: '📊',
    plan: 'enterprise',
    createdAt: '2024-03-22',
    documentsCount: 156,
    usersCount: 12,
  },
  {
    id: 'org-demo',
    name: 'Demo Public',
    slug: 'demo-public',
    industry: 'General',
    logo: '🚀',
    plan: 'basic',
    createdAt: '2024-06-10',
    documentsCount: 45,
    usersCount: 5,
  },
];

// ── Users ──────────────────────────────────

export const mockUsers: User[] = [
  // ── Banco Metropolitano ─────────────────
  {
    id: 'user-banco-admin',
    name: 'Admin Banco',
    email: 'admin_banco@tfm.com',
    role: 'admin',
    orgId: 'org-banco',
    avatar: '',
    joinedAt: '2024-01-15',
  },
  {
    id: 'user-banco-demo',
    name: 'Demo Banco',
    email: 'demo@banco.com',
    role: 'viewer',
    orgId: 'org-banco',
    avatar: '',
    joinedAt: '2024-02-20',
  },
  {
    id: 'user-banco-editor',
    name: 'Editor Banco',
    email: 'usuario_editor@banco.com',
    role: 'editor',
    orgId: 'org-banco',
    avatar: '',
    joinedAt: '2024-02-25',
  },

  // ── Estudio Contable ────────────────────
  {
    id: 'user-estudio-admin',
    name: 'Admin Estudio',
    email: 'admin_estudio@tfm.com',
    role: 'admin',
    orgId: 'org-estudio',
    avatar: '',
    joinedAt: '2024-03-22',
  },
  {
    id: 'user-estudio-demo',
    name: 'Demo Estudio',
    email: 'demo@estudio.com',
    role: 'viewer',
    orgId: 'org-estudio',
    avatar: '',
    joinedAt: '2024-04-05',
  },
  {
    id: 'user-estudio-editor',
    name: 'Editor Estudio',
    email: 'usuario_editor@estudio.com',
    role: 'editor',
    orgId: 'org-estudio',
    avatar: '',
    joinedAt: '2024-04-10',
  },

  // ── Demo Public ─────────────────────────
  {
    id: 'user-guest',
    name: 'Invitado Demo',
    email: 'guest@demo.tfm',
    role: 'viewer',
    orgId: 'org-demo',
    avatar: '',
    joinedAt: '2024-06-10',
  },
];

// ── Documents ──────────────────────────────

export const mockDocuments: Document[] = [
  {
    id: 'doc-001',
    name: 'Política de Créditos 2024.pdf',
    type: 'pdf',
    size: '2.4 MB',
    status: 'indexed',
    uploadedBy: 'user-001',
    uploadedAt: '2024-08-15T10:30:00Z',
    orgId: 'org-001',
    accessUserIds: ['user-001', 'user-002', 'user-003'],
  },
  {
    id: 'doc-002',
    name: 'Organigrama Institucional.png',
    type: 'image',
    size: '1.1 MB',
    status: 'indexed',
    uploadedBy: 'user-001',
    uploadedAt: '2024-08-14T14:20:00Z',
    orgId: 'org-001',
    accessUserIds: ['user-001', 'user-002'],
  },
  {
    id: 'doc-003',
    name: 'Transacciones Q3 2024.csv',
    type: 'csv',
    size: '5.8 MB',
    status: 'indexed',
    uploadedBy: 'user-002',
    uploadedAt: '2024-08-13T09:15:00Z',
    orgId: 'org-001',
    accessUserIds: ['user-001', 'user-002', 'user-003'],
  },
  {
    id: 'doc-004',
    name: 'Manual de Procedimientos AML.pdf',
    type: 'pdf',
    size: '4.2 MB',
    status: 'processing',
    uploadedBy: 'user-001',
    uploadedAt: '2024-08-16T08:00:00Z',
    orgId: 'org-001',
    accessUserIds: ['user-001'],
  },
  {
    id: 'doc-005',
    name: 'Balance General 2024.pdf',
    type: 'pdf',
    size: '1.8 MB',
    status: 'indexed',
    uploadedBy: 'user-004',
    uploadedAt: '2024-08-10T11:00:00Z',
    orgId: 'org-002',
    accessUserIds: ['user-004', 'user-005'],
  },
  {
    id: 'doc-006',
    name: 'Clientes Activos.csv',
    type: 'csv',
    size: '890 KB',
    status: 'indexed',
    uploadedBy: 'user-004',
    uploadedAt: '2024-08-09T16:30:00Z',
    orgId: 'org-002',
    accessUserIds: ['user-004', 'user-005'],
  },
  {
    id: 'doc-007',
    name: 'Normativa BCRA 2024.pdf',
    type: 'pdf',
    size: '3.1 MB',
    status: 'error',
    uploadedBy: 'user-002',
    uploadedAt: '2024-08-16T12:00:00Z',
    orgId: 'org-001',
    accessUserIds: ['user-001', 'user-002'],
  },
  {
    id: 'doc-008',
    name: 'Notas Internas.txt',
    type: 'txt',
    size: '45 KB',
    status: 'indexed',
    uploadedBy: 'user-005',
    uploadedAt: '2024-08-12T10:00:00Z',
    orgId: 'org-002',
    accessUserIds: ['user-004', 'user-005'],
  },
];

// ── Chat Messages (example conversation) ──

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-001',
    role: 'user',
    content: '¿Cuáles son los requisitos para otorgar un crédito hipotecario según la política vigente?',
    timestamp: '2024-08-16T10:00:00Z',
  },
  {
    id: 'msg-002',
    role: 'assistant',
    content:
      'Según la **Política de Créditos 2024**, los requisitos principales para un crédito hipotecario son:\n\n1. **Antigüedad laboral**: Mínimo 2 años en el mismo empleo\n2. **Relación cuota/ingreso**: No debe superar el 30%\n3. **Documentación requerida**:\n   - DNI vigente\n   - Últimos 3 recibos de sueldo\n   - Certificado de ingresos\n   - Tasación del inmueble\n4. **Score crediticio**: Mínimo 650 puntos\n\nAdemás, el solicitante no debe tener deudas en mora en el sistema financiero.',
    sources: [
      { docName: 'Política de Créditos 2024.pdf', page: 12, relevance: 0.95 },
      { docName: 'Política de Créditos 2024.pdf', page: 15, relevance: 0.87 },
      { docName: 'Normativa BCRA 2024.pdf', page: 3, relevance: 0.72 },
    ],
    timestamp: '2024-08-16T10:00:05Z',
  },
  {
    id: 'msg-003',
    role: 'user',
    content: '¿Cuántas transacciones hubo en el Q3 y cuál fue el monto promedio?',
    timestamp: '2024-08-16T10:01:00Z',
  },
  {
    id: 'msg-004',
    role: 'assistant',
    content:
      'Basándome en los datos de **Transacciones Q3 2024**, el resumen es:\n\n| Métrica | Valor |\n|---|---|\n| Total Transacciones | 15,847 |\n| Monto Total | $142,350,000 |\n| Monto Promedio | $8,982 |\n| Transacción Mayor | $2,500,000 |\n| Transacción Menor | $150 |\n\nEl mes con mayor volumen fue **Agosto** con 6,230 transacciones.',
    sources: [
      { docName: 'Transacciones Q3 2024.csv', relevance: 0.98 },
    ],
    timestamp: '2024-08-16T10:01:08Z',
  },
];

// ── SQL Queries ────────────────────────────

export const mockSqlQueries: SqlQuery[] = [
  {
    id: 'sql-001',
    name: 'Top 10 Clientes por Monto',
    query: 'SELECT cliente, SUM(monto) as total FROM transacciones GROUP BY cliente ORDER BY total DESC LIMIT 10;',
    createdBy: 'user-001',
    createdAt: '2024-08-10',
    lastRun: '2024-08-16',
    rowsReturned: 10,
  },
  {
    id: 'sql-002',
    name: 'Transacciones Sospechosas',
    query: "SELECT * FROM transacciones WHERE monto > 100000 AND tipo = 'transferencia' ORDER BY fecha DESC;",
    createdBy: 'user-001',
    createdAt: '2024-08-12',
    lastRun: '2024-08-15',
    rowsReturned: 23,
  },
  {
    id: 'sql-003',
    name: 'Resumen Mensual',
    query: "SELECT DATE_TRUNC('month', fecha) as mes, COUNT(*) as cantidad, AVG(monto) as promedio FROM transacciones GROUP BY mes;",
    createdBy: 'user-002',
    createdAt: '2024-08-14',
    lastRun: '2024-08-16',
    rowsReturned: 3,
  },
];

// ── Dashboard Stats per Organization ────────
export const orgStats: Record<string, any> = {
  'org-banco': {
    totalDocuments: 342,
    indexedDocuments: 298,
    totalQueries: 1547,
    avgResponseTime: '1.2s',
    activeUsers: 28,
    storageUsed: '12.4 GB',
    storageTotal: '50 GB',
    weeklyGrowth: 12.5,
    monthlyCharts: [
      { month: 'Ene', queries: 120 },
      { month: 'Feb', queries: 180 },
      { month: 'Mar', queries: 210 },
      { month: 'Abr', queries: 165 },
      { month: 'May', queries: 240 },
      { month: 'Jun', queries: 290 },
      { month: 'Jul', queries: 342 },
    ],
  },
  'org-estudio': {
    totalDocuments: 156,
    indexedDocuments: 142,
    totalQueries: 892,
    avgResponseTime: '0.8s',
    activeUsers: 12,
    storageUsed: '4.2 GB',
    storageTotal: '20 GB',
    weeklyGrowth: 8.2,
    monthlyCharts: [
      { month: 'Ene', queries: 45 },
      { month: 'Feb', queries: 62 },
      { month: 'Mar', queries: 88 },
      { month: 'Abr', queries: 75 },
      { month: 'May', queries: 110 },
      { month: 'Jun', queries: 130 },
      { month: 'Jul', queries: 156 },
    ],
  },
  'org-demo': {
    totalDocuments: 45,
    indexedDocuments: 40,
    totalQueries: 124,
    avgResponseTime: '1.5s',
    activeUsers: 5,
    storageUsed: '0.8 GB',
    storageTotal: '5 GB',
    weeklyGrowth: 2.1,
    monthlyCharts: [
      { month: 'Ene', queries: 10 },
      { month: 'Feb', queries: 15 },
      { month: 'Mar', queries: 22 },
      { month: 'Abr', queries: 18 },
      { month: 'May', queries: 25 },
      { month: 'Jun', queries: 30 },
      { month: 'Jul', queries: 45 },
    ],
  },
};

export const dashboardStats = orgStats['org-banco']; // Default/Legacy fallback
