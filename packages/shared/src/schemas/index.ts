import { z } from 'zod';

// Query Params Schemas
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    search: z.string().optional(),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

// Auth Schemas
export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Password deve ter pelo menos 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Condominium Schemas
export const condominiumSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    address: z.string().min(5, 'Morada inválida'),
    postalCode: z.string().regex(/^\d{4}-\d{3}$/, 'Código postal inválido (formato: 1234-567)'),
    city: z.string().min(2, 'Cidade inválida'),
    nif: z.string().regex(/^\d{9}$/, 'NIF deve ter 9 dígitos'),
    bankAccount: z.string().min(1, 'Conta bancária é obrigatória'),
});

export type CondominiumInput = z.infer<typeof condominiumSchema>;

export const condominiumUpdateSchema = condominiumSchema.partial();

// Fraction Schemas
export const fractionSchema = z.object({
    condominiumId: z.string().uuid('ID do condomínio inválido'),
    number: z.string().min(1, 'Número da fração é obrigatório'),
    floor: z.string().min(1, 'Andar é obrigatório'),
    block: z.string().optional().nullable(),
    staircase: z.string().optional().nullable(),
    typology: z.enum(['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'OUTRO']).default('T2'),
    permillage: z.number().min(0).max(1000, 'Permilagem deve estar entre 0 e 1000'),
    monthlyQuota: z.number().min(0, 'Quota mensal deve ser positiva'),
    ownerName: z.string().min(3, 'Nome do proprietário é obrigatório'),
    ownerEmail: z.string().email('Email inválido').optional().nullable(),
    ownerPhone: z.string().optional().nullable(),
    tenantName: z.string().optional().nullable(),
    tenantEmail: z.string().email('Email inválido').optional().nullable(),
    tenantPhone: z.string().optional().nullable(),
    occupation: z.enum(['PROPRIETARIO', 'ARRENDADA', 'DESCONHECIDO']).default('PROPRIETARIO'),
    isActive: z.boolean().default(true),
    isFollowUp: z.boolean().default(false),
});

export type FractionInput = z.infer<typeof fractionSchema>;

export const fractionUpdateSchema = fractionSchema.partial().extend({
    paymentStatus: z.enum(['EM_DIA', 'ATRASO', 'CRITICO']).optional(),
    debtAmount: z.number().min(0).optional(),
});

// Occurrence Schemas
export const occurrenceSchema = z.object({
    condominiumId: z.string().uuid('ID do condomínio inválido'),
    fractionId: z.string().uuid().optional().nullable(),
    title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
    description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
    category: z.enum([
        'INFILTRACAO',
        'ELEVADOR',
        'LIMPEZA',
        'ELETRICIDADE',
        'CANALIZACAO',
        'AQUECIMENTO',
        'SEGURANCA',
        'OUTRO',
    ]),
    priority: z.enum(['NORMAL', 'URGENTE']),
    location: z.string().min(1, 'Localização é obrigatória'),
    reportedBy: z.string().min(1, 'Reportado por é obrigatório'),
    slaDeadline: z.string().datetime().optional().nullable(),
    assignedSupplierId: z.string().uuid().optional().nullable(),
    notes: z.string().optional().nullable(),
});

export type OccurrenceInput = z.infer<typeof occurrenceSchema>;

export const occurrenceUpdateSchema = occurrenceSchema.partial().extend({
    status: z
        .enum(['ABERTA', 'EM_ANALISE', 'EM_EXECUCAO', 'RESOLVIDA', 'ARQUIVADA'])
        .optional(),
});

export const occurrenceQuerySchema = paginationSchema.extend({
    condominiumId: z.string().uuid().optional(),
    fractionId: z.string().uuid().optional(),
    supplierId: z.string().uuid().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    category: z.string().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    overdue: z.preprocess((val) => val === 'true', z.boolean()).optional(),
});

export type OccurrenceQuery = z.infer<typeof occurrenceQuerySchema>;

export const occurrenceCommentSchema = z.object({
    text: z.string().min(1, 'Comentário não pode estar vazio'),
});

export type OccurrenceCommentInput = z.infer<typeof occurrenceCommentSchema>;

export const occurrenceAssignmentSchema = z.object({
    supplierId: z.string().uuid().nullable(),
});

export type OccurrenceAssignmentInput = z.infer<typeof occurrenceAssignmentSchema>;

export const occurrenceStatusSchema = z.object({
    status: z.enum(['ABERTA', 'EM_ANALISE', 'EM_EXECUCAO', 'RESOLVIDA', 'ARQUIVADA']),
    notes: z.string().optional(),
});

export type OccurrenceStatusInput = z.infer<typeof occurrenceStatusSchema>;

// Transaction Schemas
export const transactionSchema = z.object({
    condominiumId: z.string().uuid('ID do condomínio inválido'),
    fractionId: z.string().uuid().optional().nullable(),
    supplierId: z.string().uuid().optional().nullable(),
    type: z.enum(['RECEITA', 'DESPESA']),
    category: z.enum([
        'QUOTA',
        'FUNDO_RESERVA',
        'MANUTENCAO',
        'LIMPEZA',
        'SEGURO',
        'AGUA',
        'ELETRICIDADE',
        'GAS',
        'ELEVADOR',
        'OBRA',
        'OUTRO',
    ]),
    amount: z.number().positive('Montante deve ser positivo'),
    description: z.string().min(3, 'Descrição é obrigatória'),
    date: z.string().datetime(),
    paymentMethod: z
        .enum(['TRANSFERENCIA', 'MULTIBANCO', 'DINHEIRO', 'DEBITO_DIRETO'])
        .optional()
        .nullable(),
    reference: z.string().optional().nullable(),
    status: z.enum(['NORMAL', 'REEMBOLSADO', 'ANULADO', 'PENDENTE']).default('NORMAL'),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const transactionQuerySchema = paginationSchema.extend({
    condominiumId: z.string().uuid().optional(),
    fractionId: z.string().uuid().optional(),
    supplierId: z.string().uuid().optional(),
    type: z.enum(['RECEITA', 'DESPESA']).optional(),
    category: z.string().optional(),
    status: z.string().optional(),
    paymentMethod: z.string().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
});

export type TransactionQuery = z.infer<typeof transactionQuerySchema>;

// Helper for NIF validation
const isValidNIF = (nif: string) => {
    if (!/^\d{9}$/.test(nif)) return false;
    const firstDigit = parseInt(nif[0]);
    if (![1, 2, 3, 5, 6, 8, 9].includes(firstDigit)) return false;

    let sum = 0;
    for (let i = 0; i < 8; i++) {
        sum += parseInt(nif[i]) * (9 - i);
    }
    const checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return checkDigit === parseInt(nif[8]);
};

// Supplier Schemas
export const supplierSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    nif: z.string()
        .regex(/^\d{9}$/, 'NIF deve ter 9 dígitos')
        .refine(isValidNIF, 'NIF inválido (erro de checksum)'),
    email: z.string().email('Email inválido').optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    contactPerson: z.string().optional().nullable(),
    categories: z.string().min(1, 'Pelo menos uma categoria é obrigatória'),
    notes: z.string().optional().nullable(),
    tags: z.string().optional().nullable(),
    favorite: z.boolean().default(false),
    active: z.boolean().default(true),
});

export type SupplierInput = z.infer<typeof supplierSchema>;

export const supplierUpdateSchema = supplierSchema.partial();

export const supplierQuerySchema = paginationSchema.extend({
    categories: z.string().optional(),
    favorite: z.preprocess((val) => val === 'true', z.boolean()).optional(),
    active: z.preprocess((val) => val === 'true', z.boolean()).optional(),
    hasEmail: z.preprocess((val) => val === 'true', z.boolean()).optional(),
});

export type SupplierQuery = z.infer<typeof supplierQuerySchema>;

// Project Schemas
export const projectSchema = z.object({
    condominiumId: z.string().uuid('ID do condomínio inválido'),
    title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
    description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
    budgetEstimate: z.number().min(0, 'Orçamento deve ser positivo'),
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable(),
    supplierId: z.string().uuid().optional().nullable(),
    notes: z.string().optional().nullable(),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const projectUpdateSchema = z.object({
    title: z.string().min(5).optional(),
    description: z.string().min(10).optional(),
    status: z
        .enum(['PLANEAMENTO', 'EM_APROVACAO', 'APROVADO', 'EM_EXECUCAO', 'CONCLUIDO', 'CANCELADO'])
        .optional(),
    budgetEstimate: z.number().min(0).optional(),
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable(),
    supplierId: z.string().uuid().optional().nullable(),
    notes: z.string().optional().nullable(),
});

// Assembly Schemas
// Assembly Schemas
export const agendaItemSchema = z.object({
    order: z.number(),
    title: z.string().min(3),
    description: z.string().optional().nullable(),
});

export const decisionSchema = z.object({
    description: z.string().min(3),
    result: z.string(), // APROVADA, REJEITADA, ADIADA
});

export const minutesSchema = z.object({
    content: z.string(),
    signedFile: z.string().optional().nullable(),
});

export const assemblySchema = z.object({
    condominiumId: z.string().uuid('ID do condomínio inválido'),
    year: z.coerce.number().int().min(2000),
    type: z.enum(['AGO', 'AGE']).default('AGO'),
    status: z.enum(['NAO_MARCADA', 'AGENDADA', 'REALIZADA', 'CANCELADA']).default('NAO_MARCADA'),
    date: z.string().datetime().optional().nullable(),
    location: z.string().optional().nullable(),
    agendaItems: z.array(agendaItemSchema).optional(),
    decisions: z.array(decisionSchema).optional(),
    minutes: minutesSchema.optional().nullable(),
});

export type AssemblyInput = z.infer<typeof assemblySchema>;

export const assemblyUpdateSchema = assemblySchema.partial();

// Document Schemas
export const documentSchema = z.object({
    condominiumId: z.string().uuid('ID do condomínio inválido'),
    assemblyId: z.string().uuid().optional().nullable(),
    occurrenceId: z.string().uuid().optional().nullable(),
    supplierId: z.string().uuid().optional().nullable(),
    projectId: z.string().uuid().optional().nullable(),
    transactionId: z.string().uuid().optional().nullable(),
    category: z.enum([
        'ATA',
        'CONTRATO',
        'FATURA',
        'SEGURO',
        'OUTROS',
    ]),
    title: z.string().min(3, 'Título é obrigatório'),
    description: z.string().optional().nullable(),
    fileName: z.string().min(1, 'Nome do ficheiro é obrigatório'),
    tags: z.string().optional().nullable(),
});

export type DocumentInput = z.infer<typeof documentSchema>;

// Contact Schemas
export const contactSchema = z.object({
    condominiumId: z.string().uuid('ID do condomínio inválido'),
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    role: z.enum(['GESTOR', 'ADMINISTRADOR', 'CONSELHO_CONSULTIVO', 'FORNECEDOR_CHAVE', 'OUTRO']),
    email: z.string().email('Email inválido').optional().nullable(),
    phone: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    isPublic: z.boolean().default(true),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const contactUpdateSchema = contactSchema.partial();

