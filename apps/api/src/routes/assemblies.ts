import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { parsePagination, createPaginatedResponse } from '../utils/helpers';
import { paginationSchema, assemblySchema, assemblyUpdateSchema } from '@condoflow/shared';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const assemblyQuerySchema = paginationSchema.extend({
    condominiumId: z.string().uuid().optional(),
    status: z.string().optional(),
    year: z.coerce.number().optional(),
    type: z.string().optional(),
});

router.get('/', authenticate, async (req, res) => {
    try {
        const queryValidation = assemblyQuerySchema.safeParse(req.query);
        if (!queryValidation.success) {
            return res.status(400).json({ message: 'Parâmetros inválidos' });
        }

        const { condominiumId, status, year, type } = queryValidation.data;
        const pagination = parsePagination(queryValidation.data);

        const where: any = {};
        if (condominiumId) where.condominiumId = condominiumId;
        if (status && status !== 'ALL') where.status = status;
        if (year) where.year = year;
        if (type && type !== 'ALL') where.type = type;

        const [assemblies, total] = await Promise.all([
            prisma.assembly.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                include: { condominium: true, _count: { select: { documents: true } } },
                orderBy: { date: 'desc' },
            }),
            prisma.assembly.count({ where }),
        ]);

        res.json(createPaginatedResponse(assemblies, total, pagination));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar assembleias' });
    }
});

router.get('/:id', authenticate, async (req, res) => {
    try {
        const assembly = await prisma.assembly.findUnique({
            where: { id: req.params.id },
            include: {
                condominium: true,
                documents: true,
                agendaItems: { orderBy: { order: 'asc' } },
                decisions: true,
                minutes: true
            },
        });

        if (!assembly) {
            return res.status(404).json({ message: 'Assembleia não encontrada' });
        }

        res.json(assembly);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar assembleia' });
    }
});

router.post('/', authenticate, async (req, res) => {
    try {
        const validation = assemblySchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos', errors: validation.error.errors });
        }

        const { agendaItems, ...data } = validation.data;

        const assembly = await prisma.assembly.create({
            data: {
                ...data,
                agendaItems: agendaItems ? {
                    create: agendaItems
                } : undefined
            },
            include: { agendaItems: true }
        });
        res.status(201).json(assembly);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar assembleia' });
    }
});

router.put('/:id', authenticate, async (req, res) => {
    try {
        const validation = assemblyUpdateSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos' });
        }

        const { agendaItems, decisions, minutes, ...data } = validation.data;

        // Perform transactional update
        const assembly = await prisma.$transaction(async (tx) => {
            // Update basic info
            const updated = await tx.assembly.update({
                where: { id: req.params.id },
                data: data,
            });

            // Update agenda items if provided
            if (agendaItems) {
                await tx.agendaItem.deleteMany({ where: { assemblyId: req.params.id } });
                if (agendaItems.length > 0) {
                    await tx.agendaItem.createMany({
                        data: agendaItems.map(item => ({ ...item, assemblyId: req.params.id }))
                    });
                }
            }

            // Update decisions if provided
            if (decisions) {
                await tx.decision.deleteMany({ where: { assemblyId: req.params.id } });
                if (decisions.length > 0) {
                    await tx.decision.createMany({
                        data: decisions.map(item => ({ ...item, assemblyId: req.params.id }))
                    });
                }
            }

            // Update minutes if provided
            if (minutes) {
                await tx.minutes.upsert({
                    where: { assemblyId: req.params.id },
                    create: { ...minutes, assemblyId: req.params.id },
                    update: minutes
                });
            } else if (minutes === null) {
                // Explicit null means delete? Or usually just ignore. 
                // If the partial schema has minutes: null, we might want to delete.
                // But upsert is safer.
            }

            return tx.assembly.findUnique({
                where: { id: req.params.id },
                include: {
                    condominium: true,
                    documents: true,
                    agendaItems: { orderBy: { order: 'asc' } },
                    decisions: true,
                    minutes: true
                }
            });
        });

        res.json(assembly);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Assembleia não encontrada' });
        }
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar assembleia' });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    try {
        await prisma.assembly.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Assembleia não encontrada' });
        }
        res.status(500).json({ message: 'Erro ao eliminar assembleia' });
    }
});

export default router;
