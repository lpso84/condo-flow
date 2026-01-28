import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { parsePagination, createPaginatedResponse } from '../utils/helpers';
import { transactionQuerySchema, transactionSchema } from '@condoflow/shared';

const router = Router();
const prisma = new PrismaClient();

// GET /transactions - list with advanced filters
router.get('/', authenticate, async (req, res) => {
    try {
        const queryValidation = transactionQuerySchema.safeParse(req.query);
        if (!queryValidation.success) {
            return res.status(400).json({ message: 'Parâmetros inválidos', errors: queryValidation.error.errors });
        }

        const {
            condominiumId, fractionId, supplierId,
            type, category, status, paymentMethod,
            from, to, search
        } = queryValidation.data;

        const pagination = parsePagination(queryValidation.data);

        const where: any = {};
        if (condominiumId) where.condominiumId = condominiumId;
        if (fractionId) where.fractionId = fractionId;
        if (supplierId) where.supplierId = supplierId;
        if (type) where.type = type;
        if (category) where.category = category;
        if (status) where.status = status;
        if (paymentMethod) where.paymentMethod = paymentMethod;

        if (from || to) {
            where.date = {};
            if (from) where.date.gte = new Date(from);
            if (to) where.date.lte = new Date(to);
        }

        if (search) {
            where.OR = [
                { description: { contains: search } },
                { reference: { contains: search } },
                { condominium: { name: { contains: search } } },
                { fraction: { number: { contains: search } } },
                { supplier: { name: { contains: search } } },
            ];
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                include: {
                    condominium: true,
                    fraction: true,
                    supplier: true,
                    documents: true
                },
                orderBy: { date: 'desc' },
            }),
            prisma.transaction.count({ where }),
        ]);

        res.json(createPaginatedResponse(transactions, total, pagination));
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: 'Erro ao buscar movimentos' });
    }
});

// GET /transactions/summary - financial insights
router.get('/summary', authenticate, async (req, res) => {
    try {
        const { condominiumId, from, to } = req.query;
        const where: any = { status: { not: 'ANULADO' } };

        if (condominiumId) where.condominiumId = condominiumId as string;
        if (from || to) {
            where.date = {};
            if (from) where.date.gte = new Date(from as string);
            if (to) where.date.lte = new Date(to as string);
        }

        const transactions = await prisma.transaction.findMany({ where });

        const summary = transactions.reduce((acc, t) => {
            if (t.type === 'RECEITA') {
                acc.totalRevenue += t.amount;
            } else {
                acc.totalExpenses += t.amount;
            }
            return acc;
        }, { totalRevenue: 0, totalExpenses: 0, count: transactions.length });

        res.json({
            ...summary,
            balance: summary.totalRevenue - summary.totalExpenses
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao calcular resumo' });
    }
});

// GET /transactions/export - export to CSV
router.get('/export', authenticate, async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            include: { condominium: true, fraction: true, supplier: true },
            orderBy: { date: 'desc' }
        });

        let csv = 'Data,Tipo,Condomínio,Descrição,Categoria,Entidade,Valor,Estado\n';

        transactions.forEach(t => {
            const date = t.date.toISOString().split('T')[0];
            const entity = t.fraction ? `Fração ${t.fraction.number}` : (t.supplier ? t.supplier.name : '-');
            csv += `${date},${t.type},"${t.condominium.name}","${t.description}",${t.category},"${entity}",${t.amount},${t.status}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=movimentos.csv');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao exportar movimentos' });
    }
});

router.get('/:id', authenticate, async (req, res) => {
    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: req.params.id },
            include: {
                condominium: true,
                fraction: true,
                supplier: true,
                documents: true
            },
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Movimento não encontrado' });
        }

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar movimento' });
    }
});

router.post('/', authenticate, async (req, res) => {
    try {
        const validation = transactionSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos', errors: validation.error.errors });
        }

        const transaction = await prisma.transaction.create({
            data: {
                ...validation.data,
                date: new Date(validation.data.date)
            }
        });

        // Update condominium balance
        if (transaction.status !== 'PENDENTE') {
            const balanceChange = transaction.type === 'RECEITA' ? transaction.amount : -transaction.amount;
            await prisma.condominium.update({
                where: { id: transaction.condominiumId },
                data: { balance: { increment: balanceChange } },
            });
        }

        // Update fraction debt if payment
        if (transaction.category === 'QUOTA' && transaction.fractionId && transaction.type === 'RECEITA') {
            const fraction = await prisma.fraction.findUnique({ where: { id: transaction.fractionId } });
            if (fraction) {
                const newDebt = Math.max(0, fraction.debtAmount - transaction.amount);
                await prisma.fraction.update({
                    where: { id: transaction.fractionId },
                    data: {
                        debtAmount: newDebt,
                        paymentStatus: newDebt === 0 ? 'EM_DIA' : 'ATRASO',
                    },
                });
            }
        }

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ message: 'Erro ao criar movimento' });
    }
});

// POST /transactions/:id/cancel - Annul transaction
router.post('/:id/cancel', authenticate, async (req, res) => {
    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: req.params.id }
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Movimento não encontrado' });
        }

        if (transaction.status === 'ANULADO') {
            return res.status(400).json({ message: 'Movimento já se encontra anulado' });
        }

        // Update transaction status
        const updated = await prisma.transaction.update({
            where: { id: req.params.id },
            data: { status: 'ANULADO' }
        });

        // Reverse balance if it was not pending
        if (transaction.status !== 'PENDENTE') {
            const balanceReverse = transaction.type === 'RECEITA' ? -transaction.amount : transaction.amount;
            await prisma.condominium.update({
                where: { id: transaction.condominiumId },
                data: { balance: { increment: balanceReverse } }
            });
        }

        // Reverse fraction debt if it was a quota payment
        if (transaction.category === 'QUOTA' && transaction.fractionId && transaction.type === 'RECEITA') {
            await prisma.fraction.update({
                where: { id: transaction.fractionId },
                data: {
                    debtAmount: { increment: transaction.amount },
                    paymentStatus: 'ATRASO'
                }
            });
        }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao anular movimento' });
    }
});

// PUT /transactions/:id - Update transaction
router.put('/:id', authenticate, async (req, res) => {
    try {
        const validation = transactionSchema.partial().safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos', errors: validation.error.errors });
        }

        const oldTransaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });
        if (!oldTransaction) return res.status(404).json({ message: 'Movimento não encontrado' });

        const transaction = await prisma.transaction.update({
            where: { id: req.params.id },
            data: {
                ...validation.data,
                date: validation.data.date ? new Date(validation.data.date) : undefined
            }
        });

        // Simple balance correction (could be more complex if amount or type changed)
        // For this MVP, we assume amount/type edits are rare or handled by canceling and re-creating
        // But let's do a basic amount change if both are NORMAL
        if (oldTransaction.status === 'NORMAL' && transaction.status === 'NORMAL' && oldTransaction.amount !== transaction.amount) {
            const diff = transaction.amount - oldTransaction.amount;
            const balanceChange = transaction.type === 'RECEITA' ? diff : -diff;
            await prisma.condominium.update({
                where: { id: transaction.condominiumId },
                data: { balance: { increment: balanceChange } }
            });
        }

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar movimento' });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    try {
        // Instead of hard delete, we recommend cancel. But if requested, we delete.
        const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });
        if (!transaction) return res.status(404).json({ message: 'Movimento não encontrado' });

        // Reverse balance before delete if not already canceled/pending
        if (transaction.status !== 'ANULADO' && transaction.status !== 'PENDENTE') {
            const balanceReverse = transaction.type === 'RECEITA' ? -transaction.amount : transaction.amount;
            await prisma.condominium.update({
                where: { id: transaction.condominiumId },
                data: { balance: { increment: balanceReverse } }
            });
        }

        await prisma.transaction.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao eliminar movimento' });
    }
});

export default router;
