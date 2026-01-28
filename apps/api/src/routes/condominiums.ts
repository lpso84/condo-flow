import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { parsePagination, createPaginatedResponse } from '../utils/helpers';
import { paginationSchema, condominiumSchema, condominiumUpdateSchema } from '@condoflow/shared';

const router = Router();
const prisma = new PrismaClient();

// Get all condominiums with pagination and filters
router.get('/', authenticate, async (req, res) => {
    try {
        const queryValidation = paginationSchema.safeParse(req.query);

        if (!queryValidation.success) {
            return res.status(400).json({
                message: 'Parâmetros de query inválidos',
                errors: queryValidation.error.errors,
            });
        }

        const { search, sortBy, sortOrder } = queryValidation.data;
        const pagination = parsePagination(queryValidation.data);

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
                { nif: { contains: search } },
            ];
        }

        const orderBy: any = {};
        if (sortBy) {
            orderBy[sortBy] = sortOrder || 'asc';
        } else {
            orderBy.name = 'asc';
        }

        const [condominiums, total] = await Promise.all([
            prisma.condominium.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                orderBy,
            }),
            prisma.condominium.count({ where }),
        ]);

        res.json(createPaginatedResponse(condominiums, total, pagination));
    } catch (error) {
        console.error('Get condominiums error:', error);
        res.status(500).json({ message: 'Erro ao buscar condomínios' });
    }
});

// Get single condominium
router.get('/:id', authenticate, async (req, res) => {
    try {
        const condominium = await prisma.condominium.findUnique({
            where: { id: req.params.id },
            include: {
                fractions: true,
                occurrences: {
                    where: {
                        status: {
                            notIn: ['ARQUIVADA'],
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10,
                },
                assemblies: {
                    orderBy: {
                        date: 'desc',
                    },
                    take: 5,
                },
                _count: {
                    select: {
                        fractions: true,
                        occurrences: true,
                        transactions: true,
                        projects: true,
                        assemblies: true,
                        documents: true,
                    },
                },
            },
        });

        if (!condominium) {
            return res.status(404).json({ message: 'Condomínio não encontrado' });
        }

        res.json(condominium);
    } catch (error) {
        console.error('Get condominium error:', error);
        res.status(500).json({ message: 'Erro ao buscar condomínio' });
    }
});

// Create condominium
router.post('/', authenticate, async (req, res) => {
    try {
        const validation = condominiumSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                message: 'Dados inválidos',
                errors: validation.error.errors,
            });
        }

        const condominium = await prisma.condominium.create({
            data: validation.data,
        });

        res.status(201).json(condominium);
    } catch (error: any) {
        console.error('Create condominium error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'NIF já existe' });
        }
        res.status(500).json({ message: 'Erro ao criar condomínio' });
    }
});

// Update condominium
router.put('/:id', authenticate, async (req, res) => {
    try {
        const validation = condominiumUpdateSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                message: 'Dados inválidos',
                errors: validation.error.errors,
            });
        }

        const condominium = await prisma.condominium.update({
            where: { id: req.params.id },
            data: validation.data,
        });

        res.json(condominium);
    } catch (error: any) {
        console.error('Update condominium error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Condomínio não encontrado' });
        }
        res.status(500).json({ message: 'Erro ao atualizar condomínio' });
    }
});

// Delete condominium
router.delete('/:id', authenticate, async (req, res) => {
    try {
        await prisma.condominium.delete({
            where: { id: req.params.id },
        });

        res.status(204).send();
    } catch (error: any) {
        console.error('Delete condominium error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Condomínio não encontrado' });
        }
        res.status(500).json({ message: 'Erro ao eliminar condomínio' });
    }
});

// Get condominium activity feed
router.get('/:id/activity', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const limit = 20;

        const [occurrences, transactions, documents, assemblies] = await Promise.all([
            prisma.occurrence.findMany({
                where: { condominiumId: id },
                orderBy: { createdAt: 'desc' },
                take: limit,
                include: { fraction: true }
            }),
            prisma.transaction.findMany({
                where: { condominiumId: id },
                orderBy: { date: 'desc' },
                take: limit,
                include: { fraction: true, supplier: true }
            }),
            prisma.document.findMany({
                where: { condominiumId: id },
                orderBy: { createdAt: 'desc' },
                take: limit
            }),
            prisma.assembly.findMany({
                where: { condominiumId: id },
                orderBy: { createdAt: 'desc' },
                take: limit
            })
        ]);

        // Combine and sort by date
        const activity = [
            ...occurrences.map(o => ({ id: o.id, type: 'OCCURRENCE', date: o.createdAt, data: o })),
            ...transactions.map(t => ({ id: t.id, type: 'TRANSACTION', date: t.date, data: t })),
            ...documents.map(d => ({ id: d.id, type: 'DOCUMENT', date: d.createdAt, data: d })),
            ...assemblies.map(a => ({ id: a.id, type: 'ASSEMBLY', date: a.createdAt, data: a }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, limit);

        res.json(activity);
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({ message: 'Erro ao buscar atividade' });
    }
});

export default router;
