import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { parsePagination, createPaginatedResponse } from '../utils/helpers';
import {
    occurrenceSchema,
    occurrenceUpdateSchema,
    occurrenceQuerySchema,
    occurrenceCommentSchema,
    occurrenceStatusSchema,
    occurrenceAssignmentSchema
} from '@condoflow/shared';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const queryValidation = occurrenceQuerySchema.safeParse(req.query);
        if (!queryValidation.success) {
            return res.status(400).json({ message: 'Parâmetros inválidos', errors: queryValidation.error.errors });
        }

        const {
            condominiumId,
            fractionId,
            supplierId,
            status,
            priority,
            category,
            from,
            to,
            overdue,
            search,
            sortBy,
            sortOrder
        } = queryValidation.data;

        const pagination = parsePagination(queryValidation.data);

        const where: any = {};
        if (condominiumId) where.condominiumId = condominiumId;
        if (fractionId) where.fractionId = fractionId;
        if (supplierId) {
            where.assignedSupplierId = supplierId;
        }
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (category) where.category = category;

        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt.gte = new Date(from);
            if (to) where.createdAt.lte = new Date(to);
        }

        if (overdue) {
            where.status = { notIn: ['RESOLVIDA', 'ARQUIVADA'] };
            where.slaDeadline = { lt: new Date() };
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Whitelist allowed sort fields to prevent invalid queries
        const allowedSortFields = ['createdAt', 'priority', 'status', 'slaDeadline'] as const;
        const sortField = allowedSortFields.includes((sortBy as any)) ? (sortBy as any) : 'createdAt';
        const sortDirection = sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc';

        const [occurrences, total] = await Promise.all([
            prisma.occurrence.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                include: {
                    condominium: true,
                    fraction: true,
                    supplier: true,
                    _count: {
                        select: { comments: true, documents: true }
                    }
                },
                orderBy: { [sortField]: sortDirection },
            }),
            prisma.occurrence.count({ where }),
        ]);

        res.json(createPaginatedResponse(occurrences, total, pagination));
    } catch (error) {
        console.error('Get occurrences error:', error);
        res.status(500).json({ message: 'Erro ao buscar ocorrências' });
    }
});

router.get('/stats', authenticate, async (req: AuthRequest, res) => {
    try {
        const { condominiumId } = req.query;
        const where: any = condominiumId ? { condominiumId: condominiumId as string } : {};

        const [open, urgent, execution, resolvedRecent] = await Promise.all([
            prisma.occurrence.count({ where: { ...where, status: 'ABERTA' } }),
            prisma.occurrence.count({ where: { ...where, priority: 'URGENTE', status: { notIn: ['RESOLVIDA', 'ARQUIVADA'] } } }),
            prisma.occurrence.count({ where: { ...where, status: 'EM_EXECUCAO' } }),
            prisma.occurrence.count({
                where: {
                    ...where,
                    status: 'RESOLVIDA',
                    resolvedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            }),
        ]);

        const overdue = await prisma.occurrence.count({
            where: {
                ...where,
                status: { notIn: ['RESOLVIDA', 'ARQUIVADA'] },
                slaDeadline: { lt: new Date() }
            }
        });

        res.json({ open, urgent, execution, resolvedRecent, overdue });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar estatísticas' });
    }
});

router.get('/:id', authenticate, async (req, res) => {
    try {
        const occurrence = await prisma.occurrence.findUnique({
            where: { id: req.params.id },
            include: {
                condominium: true,
                fraction: true,
                supplier: true,
                comments: {
                    orderBy: { createdAt: 'desc' }
                },
                auditLogs: {
                    orderBy: { createdAt: 'desc' }
                },
                documents: true
            },
        });

        if (!occurrence) {
            return res.status(404).json({ message: 'Ocorrência não encontrada' });
        }

        res.json(occurrence);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar ocorrência' });
    }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const validation = occurrenceSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos', errors: validation.error.errors });
        }

        const user = await prisma.user.findUnique({ where: { id: req.user!.id } });

        const occurrence = await prisma.occurrence.create({
            data: {
                ...validation.data,
                reportedBy: user?.name || req.user!.email,
                auditLogs: {
                    create: {
                        action: 'CREATION',
                        authorId: req.user!.id,
                        authorName: user?.name || req.user!.email,
                        metadata: JSON.stringify({ priority: validation.data.priority })
                    }
                }
            }
        });

        // Update condominium stats
        await prisma.condominium.update({
            where: { id: occurrence.condominiumId },
            data: {
                openOccurrences: { increment: 1 },
                ...(occurrence.priority === 'URGENTE' ? { urgentOccurrences: { increment: 1 } } : {})
            },
        });

        res.status(201).json(occurrence);
    } catch (error) {
        console.error('Create occurrence error:', error);
        res.status(500).json({ message: 'Erro ao criar ocorrência' });
    }
});

router.put('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const validation = occurrenceUpdateSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos', errors: validation.error.errors });
        }

        const oldOccurrence = await prisma.occurrence.findUnique({ where: { id: req.params.id } });
        if (!oldOccurrence) {
            return res.status(404).json({ message: 'Ocorrência não encontrada' });
        }

        const user = await prisma.user.findUnique({ where: { id: req.user!.id } });

        const occurrence = await prisma.occurrence.update({
            where: { id: req.params.id },
            data: {
                ...validation.data,
                auditLogs: {
                    create: {
                        action: 'UPDATE',
                        authorId: req.user!.id,
                        authorName: user?.name || req.user!.email,
                        metadata: JSON.stringify(validation.data)
                    }
                }
            },
        });

        res.json(occurrence);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar ocorrência' });
    }
});

router.post('/:id/status', authenticate, async (req: AuthRequest, res) => {
    try {
        const validation = occurrenceStatusSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos', errors: validation.error.errors });
        }

        const oldOccurrence = await prisma.occurrence.findUnique({ where: { id: req.params.id } });
        if (!oldOccurrence) return res.status(404).json({ message: 'Ocorrência não encontrada' });

        const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
        const { status, notes } = validation.data;

        const updateData: any = {
            status,
            resolvedAt: status === 'RESOLVIDA' ? new Date() : undefined
        };

        const occurrence = await prisma.occurrence.update({
            where: { id: req.params.id },
            data: {
                ...updateData,
                auditLogs: {
                    create: {
                        action: 'STATUS_CHANGE',
                        authorId: req.user!.id,
                        authorName: user?.name || req.user!.email,
                        metadata: JSON.stringify({ from: oldOccurrence.status, to: status, notes })
                    }
                }
            }
        });

        // Update condo stats if it was closed
        const wasOpen = !['RESOLVIDA', 'ARQUIVADA'].includes(oldOccurrence.status);
        const isOpen = !['RESOLVIDA', 'ARQUIVADA'].includes(status);

        if (wasOpen && !isOpen) {
            await prisma.condominium.update({
                where: { id: occurrence.condominiumId },
                data: {
                    openOccurrences: { decrement: 1 },
                    ...(oldOccurrence.priority === 'URGENTE' ? { urgentOccurrences: { decrement: 1 } } : {})
                }
            });
        } else if (!wasOpen && isOpen) {
            await prisma.condominium.update({
                where: { id: occurrence.condominiumId },
                data: {
                    openOccurrences: { increment: 1 },
                    ...(oldOccurrence.priority === 'URGENTE' ? { urgentOccurrences: { increment: 1 } } : {})
                }
            });
        }

        res.json(occurrence);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao alterar estado' });
    }
});

router.post('/:id/assign', authenticate, async (req: AuthRequest, res) => {
    try {
        const validation = occurrenceAssignmentSchema.safeParse(req.body);
        if (!validation.success) return res.status(400).json({ message: 'Dados inválidos' });

        const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
        const { supplierId } = validation.data;

        const occurrence = await prisma.occurrence.update({
            where: { id: req.params.id },
            data: {
                assignedSupplierId: supplierId,
                auditLogs: {
                    create: {
                        action: 'ASSIGNMENT',
                        authorId: req.user!.id,
                        authorName: user?.name || req.user!.email,
                        metadata: JSON.stringify({ supplierId })
                    }
                }
            }
        });

        res.json(occurrence);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atribuir fornecedor' });
    }
});

router.post('/:id/comments', authenticate, async (req: AuthRequest, res) => {
    try {
        const validation = occurrenceCommentSchema.safeParse(req.body);
        if (!validation.success) return res.status(400).json({ message: 'Comentário inválido' });

        const user = await prisma.user.findUnique({ where: { id: req.user!.id } });

        const comment = await prisma.occurrenceComment.create({
            data: {
                occurrenceId: req.params.id,
                text: validation.data.text,
                authorId: req.user!.id,
                authorName: user?.name || req.user!.email,
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao adicionar comentário' });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    try {
        const occurrence = await prisma.occurrence.findUnique({ where: { id: req.params.id } });
        if (!occurrence) return res.status(404).json({ message: 'Ocorrência não encontrada' });

        await prisma.occurrence.delete({ where: { id: req.params.id } });

        // Update stats if it was open
        if (!['RESOLVIDA', 'ARQUIVADA'].includes(occurrence.status)) {
            await prisma.condominium.update({
                where: { id: occurrence.condominiumId },
                data: {
                    openOccurrences: { decrement: 1 },
                    ...(occurrence.priority === 'URGENTE' ? { urgentOccurrences: { decrement: 1 } } : {})
                }
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Erro ao eliminar ocorrência' });
    }
});

export default router;
