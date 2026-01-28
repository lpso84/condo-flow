export enum UserRole {
    ADMIN = 'ADMIN',
    GESTOR = 'GESTOR',
    COLABORADOR = 'COLABORADOR',
}

export enum RiskLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export enum PaymentStatus {
    EM_DIA = 'EM_DIA',
    ATRASO = 'ATRASO',
    CRITICO = 'CRITICO',
}

export enum FractionTypology {
    T0 = 'T0',
    T1 = 'T1',
    T2 = 'T2',
    T3 = 'T3',
    T4 = 'T4',
    T5 = 'T5',
    OUTRO = 'OUTRO',
}

export enum FractionOccupation {
    PROPRIETARIO = 'PROPRIETARIO',
    ARRENDADA = 'ARRENDADA',
    DESCONHECIDO = 'DESCONHECIDO',
}

export enum OccurrenceStatus {
    ABERTA = 'ABERTA',
    EM_ANALISE = 'EM_ANALISE',
    EM_EXECUCAO = 'EM_EXECUCAO',
    RESOLVIDA = 'RESOLVIDA',
    ARQUIVADA = 'ARQUIVADA',
}

export enum OccurrencePriority {
    NORMAL = 'NORMAL',
    URGENTE = 'URGENTE',
}

export enum OccurrenceCategory {
    INFILTRACAO = 'INFILTRACAO',
    ELEVADOR = 'ELEVADOR',
    LIMPEZA = 'LIMPEZA',
    ELETRICIDADE = 'ELETRICIDADE',
    CANALIZACAO = 'CANALIZACAO',
    AQUECIMENTO = 'AQUECIMENTO',
    SEGURANCA = 'SEGURANCA',
    OUTRO = 'OUTRO',
}

export enum AssemblyStatus {
    NAO_MARCADA = 'NAO_MARCADA',
    AGENDADA = 'AGENDADA',
    REALIZADA = 'REALIZADA',
    CANCELADA = 'CANCELADA',
}

export enum AssemblyType {
    AGO = 'AGO',
    AGE = 'AGE',
}

export enum ProjectStatus {
    PLANEAMENTO = 'PLANEAMENTO',
    EM_APROVACAO = 'EM_APROVACAO',
    APROVADO = 'APROVADO',
    EM_EXECUCAO = 'EM_EXECUCAO',
    CONCLUIDO = 'CONCLUIDO',
    CANCELADO = 'CANCELADO',
}

export enum TransactionType {
    RECEITA = 'RECEITA',
    DESPESA = 'DESPESA',
}

export enum TransactionCategory {
    QUOTA = 'QUOTA',
    FUNDO_RESERVA = 'FUNDO_RESERVA',
    MANUTENCAO = 'MANUTENCAO',
    LIMPEZA = 'LIMPEZA',
    SEGURO = 'SEGURO',
    AGUA = 'AGUA',
    ELETRICIDADE = 'ELETRICIDADE',
    GAS = 'GAS',
    ELEVADOR = 'ELEVADOR',
    OBRA = 'OBRA',
    OUTRO = 'OUTRO',
}

export enum PaymentMethod {
    TRANSFERENCIA = 'TRANSFERENCIA',
    MULTIBANCO = 'MULTIBANCO',
    DINHEIRO = 'DINHEIRO',
    DEBITO_DIRETO = 'DEBITO_DIRETO',
}

export enum TransactionStatus {
    NORMAL = 'NORMAL',
    REEMBOLSADO = 'REEMBOLSADO',
    ANULADO = 'ANULADO',
    PENDENTE = 'PENDENTE',
}

export enum DocumentCategory {
    ATA = 'ATA',
    CONTRATO = 'CONTRATO',
    FATURA = 'FATURA',
    SEGURO = 'SEGURO',
    OUTROS = 'OUTROS',
}

export enum ContactRole {
    GESTOR = 'GESTOR',
    ADMINISTRADOR = 'ADMINISTRADOR',
    CONSELHO_CONSULTIVO = 'CONSELHO_CONSULTIVO',
    FORNECEDOR_CHAVE = 'FORNECEDOR_CHAVE',
    OUTRO = 'OUTRO',
}

// User Types
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export interface LoginResponse {
    token: string;
    user: User;
}

// Condominium Types
export interface Condominium {
    id: string;
    name: string;
    address: string;
    postalCode: string;
    city: string;
    nif: string;
    bankAccount: string;
    balance: number;
    debtTotal: number;
    reserveFund: number;
    riskLevel: RiskLevel;
    urgentOccurrences: number;
    openOccurrences: number;
    fractionsCount: number;
    nextAssemblyDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

// Fraction Types
export interface Fraction {
    id: string;
    condominiumId: string;
    number: string;
    floor: string;
    block: string | null;
    staircase: string | null;
    typology: FractionTypology;
    permillage: number;
    monthlyQuota: number;
    ownerName: string;
    ownerEmail: string | null;
    ownerPhone: string | null;
    tenantName: string | null;
    tenantEmail: string | null;
    tenantPhone: string | null;
    occupation: FractionOccupation;
    paymentStatus: PaymentStatus;
    debtAmount: number;
    isActive: boolean;
    isFollowUp: boolean;
    createdAt: Date;
    updatedAt: Date;
    condominium?: Condominium;
}

// Occurrence Types
export interface OccurrenceComment {
    id: string;
    occurrenceId: string;
    text: string;
    authorId: string;
    authorName: string;
    createdAt: Date;
}

export interface OccurrenceAuditLog {
    id: string;
    occurrenceId: string;
    action: string;
    metadata: string | null;
    authorId: string;
    authorName: string;
    createdAt: Date;
}

export interface Occurrence {
    id: string;
    condominiumId: string;
    fractionId: string | null;
    title: string;
    description: string;
    category: OccurrenceCategory;
    priority: OccurrencePriority;
    status: OccurrenceStatus;
    location: string;
    reportedBy: string;
    reportedAt: Date;
    slaDeadline: Date | null;
    assignedSupplierId: string | null;
    resolvedAt: Date | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    condominium?: Condominium;
    fraction?: Fraction;
    supplier?: Supplier;
    comments?: OccurrenceComment[];
    auditLogs?: OccurrenceAuditLog[];
    documents?: Document[];
}

// Transaction Types
export interface Transaction {
    id: string;
    condominiumId: string;
    fractionId: string | null;
    supplierId: string | null;
    type: TransactionType;
    category: TransactionCategory;
    amount: number;
    description: string;
    date: Date;
    paymentMethod: PaymentMethod | null;
    reference: string | null;
    status: TransactionStatus;
    createdAt: Date;
    updatedAt: Date;
    condominium?: Condominium;
    fraction?: Fraction;
    supplier?: Supplier;
    documents?: Document[];
}

// Supplier Types
export interface Supplier {
    id: string;
    name: string;
    nif: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    contactPerson: string | null;
    categories: string;
    notes: string | null;
    tags: string | null;
    favorite: boolean;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    occurrences?: Occurrence[];
    transactions?: Transaction[];
    projects?: Project[];
    documents?: Document[];
}

export interface SupplierSummary {
    totalOccurrences: number;
    totalProjects: number;
    totalSpent: number;
    lastInteraction: Date | null;
}

// Project (Obra) Types
export interface Project {
    id: string;
    condominiumId: string;
    title: string;
    description: string;
    status: ProjectStatus;
    budgetEstimate: number;
    startDate: Date | null;
    endDate: Date | null;
    supplierId: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    condominium?: Condominium;
    supplier?: Supplier;
    documents?: Document[];
}

// Assembly Types
export interface AgendaItem {
    id: string;
    assemblyId: string;
    order: number;
    title: string;
    description: string | null;
}

export interface Decision {
    id: string;
    assemblyId: string;
    description: string;
    result: string;
}

export interface Minutes {
    id: string;
    assemblyId: string;
    content: string;
    signedFile: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Assembly {
    id: string;
    condominiumId: string;
    year: number;
    type: AssemblyType | string;
    status: AssemblyStatus;
    date: Date | null;
    location: string | null;
    agendaItems?: AgendaItem[];
    decisions?: Decision[];
    minutes?: Minutes | null;
    createdAt: Date;
    updatedAt: Date;
    condominium?: Condominium;
    documents?: Document[];
    _count?: { documents: number };
}

// Document Types
export interface DocumentVersion {
    id: string;
    documentId: string;
    version: number;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: string;
    createdAt: Date;
}

export interface Document {
    id: string;
    condominiumId: string;
    assemblyId: string | null;
    occurrenceId: string | null;
    supplierId: string | null;
    transactionId: string | null;
    projectId: string | null;
    category: DocumentCategory;
    title: string;
    description: string | null;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    tags: string | null;
    version: number;
    uploadedBy: string;
    versions?: DocumentVersion[];
    createdAt: Date;
    updatedAt: Date;
    condominium?: Condominium;
    assembly?: Assembly;
    occurrence?: Occurrence;
    supplier?: Supplier;
    // project?: Project; // Optional but circular dep might be issue? Interfaces are fine.
}

// Contact Types
export interface Contact {
    id: string;
    condominiumId: string;
    name: string;
    role: ContactRole;
    email: string | null;
    phone: string | null;
    description: string | null;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    condominium?: Condominium;
}

// Dashboard Types
export interface DashboardStats {
    globalBalance: number;
    totalDebt: number;
    openOccurrences: number;
    urgentOccurrences: number;
    pendingAssemblies: number;
    condominiumsAtRisk: number;
}

export interface PriorityItem {
    id: string;
    type: 'payment' | 'occurrence' | 'assembly' | 'sla';
    title: string;
    description: string;
    dueDate: Date | null;
    urgency: 'high' | 'medium' | 'low';
    condominiumId: string;
    condominiumName: string;
}

export interface CondominiumRisk {
    id: string;
    name: string;
    riskLevel: RiskLevel;
    debtTotal: number;
    urgentOccurrences: number;
    openOccurrences: number;
    lastPaymentDate: Date | null;
}

// API Response Types
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ApiError {
    message: string;
    code?: string;
    statusCode: number;
}
