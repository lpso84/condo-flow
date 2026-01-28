import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { parsePagination, createPaginatedResponse } from '../utils/helpers';
import { paginationSchema, fractionSchema, fractionUpdateSchema } from '@condoflow/shared';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const fractionFilterSchema = paginationSchema.extend({
    condominiumId: z.string().uuid().optional(),
    paymentStatus: z.string().optional(),
    typology: z.string().optional(),
    occupation: z.string().optional(),
    isActive: z.coerce.boolean().optional(),
    isFollowUp: z.coerce.boolean().optional(),
    minDebt: z.coerce.number().optional(),
});

router.get('/', authenticate, async (req, res) => {
    try {
        const queryValidation = fractionFilterSchema.safeParse(req.query);
        if (!queryValidation.success) {
            return res.status(400).json({ message: 'Parâmetros inválidos', errors: queryValidation.error.errors });
        }

        const {
            condominiumId,
            paymentStatus,
            typology,
            occupation,
            isActive,
            isFollowUp,
            minDebt,
            search,
            sortBy,
            sortOrder
        } = queryValidation.data;

        const pagination = parsePagination(queryValidation.data);

        const where: any = {};
        if (condominiumId) where.condominiumId = condominiumId;
        if (paymentStatus) where.paymentStatus = paymentStatus;
        if (typology) where.typology = typology;
        if (occupation) where.occupation = occupation;
        if (isActive !== undefined) where.isActive = isActive;
        if (isFollowUp !== undefined) where.isFollowUp = isFollowUp;
        if (minDebt !== undefined) where.debtAmount = { gte: minDebt };

        if (search) {
            where.OR = [
                { number: { contains: search } },
                { ownerName: { contains: search } },
                { ownerEmail: { contains: search } },
                { tenantName: { contains: search } },
                { condominium: { name: { contains: search } } },
            ];
        }

        const orderBy: any = {};
        if (sortBy) {
            orderBy[sortBy] = sortOrder || 'asc';
        } else {
            orderBy.number = 'asc';
        }

        const [fractions, total] = await Promise.all([
            prisma.fraction.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                include: { condominium: true },
                orderBy,
            }),
            prisma.fraction.count({ where }),
        ]);

        res.json(createPaginatedResponse(fractions, total, pagination));
    } catch (error) {
        console.error('Get fractions error:', error);
        res.status(500).json({ message: 'Erro ao buscar frações' });
    }
});

router.get('/export', authenticate, async (req, res) => {
    try {
        const queryValidation = fractionFilterSchema.safeParse(req.query);
        if (!queryValidation.success) {
            return res.status(400).json({ message: 'Parâmetros inválidos' });
        }

        const { condominiumId, paymentStatus, typology, occupation, isActive, search } = queryValidation.data;

        const where: any = {};
        if (condominiumId) where.condominiumId = condominiumId;
        if (paymentStatus) where.paymentStatus = paymentStatus;
        if (typology) where.typology = typology;
        if (occupation) where.occupation = occupation;
        if (isActive !== undefined) where.isActive = isActive;

        if (search) {
            where.OR = [
                { number: { contains: search } },
                { ownerName: { contains: search } },
                { condominium: { name: { contains: search } } },
            ];
        }

        const fractions = await prisma.fraction.findMany({
            where,
            include: { condominium: true },
            orderBy: [{ condominium: { name: 'asc' } }, { number: 'asc' }],
        });

        const csvRows = [
            ['Condominio', 'Fracao', 'Piso', 'Tipologia', 'Permilagem', 'Proprietario', 'Email', 'Telefone', 'Divida', 'Estado'].join(','),
            ...fractions.map(f => [
                f.condominium.name,
                f.number,
                f.floor,
                f.typology,
                f.permillage,
                f.ownerName,
                f.ownerEmail || '',
                f.ownerPhone || '',
                f.debtAmount,
                f.paymentStatus
            ].join(','))
        ];

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=fracoes.csv');
        res.send(csvRows.join('\n'));
    } catch (error) {
        console.error('Export fractions error:', error);
        res.status(500).json({ message: 'Erro ao exportar frações' });
    }
});

router.get('/:id', authenticate, async (req, res) => {
    try {
        const fraction = await prisma.fraction.findUnique({
            where: { id: req.params.id },
            include: {
                condominium: true,
                transactions: { orderBy: { date: 'desc' }, take: 50 },
                occurrences: { orderBy: { createdAt: 'desc' }, take: 20 },
            },
        });

        if (!fraction) {
            return res.status(404).json({ message: 'Fração não encontrada' });
        }

        res.json(fraction);
    } catch (error) {
        console.error('Get fraction error:', error);
        res.status(500).json({ message: 'Erro ao buscar fração' });
    }
});

router.post('/', authenticate, async (req, res) => {
    try {
        const validation = fractionSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos', errors: validation.error.errors });
        }

        const fraction = await prisma.fraction.create({ data: validation.data });

        await prisma.condominium.update({
            where: { id: validation.data.condominiumId },
            data: { fractionsCount: { increment: 1 } },
        });

        res.status(201).json(fraction);
    } catch (error) {
        console.error('Create fraction error:', error);
        res.status(500).json({ message: 'Erro ao criar fração' });
    }
});

router.put('/:id', authenticate, async (req, res) => {
    try {
        const validation = fractionUpdateSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos', errors: validation.error.errors });
        }

        const fraction = await prisma.fraction.update({
            where: { id: req.params.id },
            data: validation.data,
        });

        res.json(fraction);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Fração não encontrada' });
        }
        res.status(500).json({ message: 'Erro ao atualizar fração' });
    }
});

router.post('/:id/payments', authenticate, async (req, res) => {
    try {
        const { amount, date, method, description, reference } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Montante inválido' });
        }

        const fraction = await prisma.fraction.findUnique({
            where: { id: req.params.id },
        });

        if (!fraction) {
            return res.status(404).json({ message: 'Fração não encontrada' });
        }

        const [transaction, updatedFraction] = await prisma.$transaction([
            prisma.transaction.create({
                data: {
                    condominiumId: fraction.condominiumId,
                    fractionId: fraction.id,
                    type: 'RECEITA',
                    category: 'QUOTA',
                    amount: Number(amount),
                    date: new Date(date || new Date()),
                    paymentMethod: method,
                    description: description || `Pagamento de quota - Fração ${fraction.number}`,
                    reference: reference,
                }
            }),
            prisma.fraction.update({
                where: { id: fraction.id },
                data: {
                    debtAmount: { decrement: Number(amount) },
                    paymentStatus: fraction.debtAmount - Number(amount) <= 0 ? 'EM_DIA' : 'ATRASO'
                }
            })
        ]);

        res.status(201).json({ transaction, fraction: updatedFraction });
    } catch (error) {
        console.error('Register payment error:', error);
        res.status(500).json({ message: 'Erro ao registar pagamento' });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    try {
        const fraction = await prisma.fraction.findUnique({ where: { id: req.params.id } });
        if (!fraction) {
            return res.status(404).json({ message: 'Fração não encontrada' });
        }

        await prisma.fraction.delete({ where: { id: req.params.id } });
        await prisma.condominium.update({
            where: { id: fraction.condominiumId },
            data: { fractionsCount: { decrement: 1 } },
        });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Erro ao eliminar fração' });
    }
});

export default router;
