import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/stats', authenticate, async (req, res) => {
    try {
        const [
            condominiums,
            totalDebt,
            occurrences,
            urgentOccurrences,
            pendingAssemblies,
            condominiumsAtRisk,
        ] = await Promise.all([
            prisma.condominium.findMany(),
            prisma.fraction.aggregate({ _sum: { debtAmount: true } }),
            prisma.occurrence.count({
                where: { status: { notIn: ['RESOLVIDA', 'ARQUIVADA'] } },
            }),
            prisma.occurrence.count({
                where: {
                    priority: 'URGENTE',
                    status: { notIn: ['RESOLVIDA', 'ARQUIVADA'] },
                },
            }),
            prisma.assembly.count({
                where: { status: { in: ['NAO_AGENDADA', 'AGENDADA'] } },
            }),
            prisma.condominium.count({
                where: { riskLevel: { in: ['HIGH', 'CRITICAL'] } },
            }),
        ]);

        const globalBalance = condominiums.reduce((sum, c) => sum + c.balance, 0);

        res.json({
            globalBalance,
            totalDebt: totalDebt._sum.debtAmount || 0,
            openOccurrences: occurrences,
            urgentOccurrences,
            pendingAssemblies,
            condominiumsAtRisk,
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Erro ao buscar estatísticas' });
    }
});

router.get('/priorities', authenticate, async (req, res) => {
    try {
        const now = new Date();
        const priorities = [];

        // Urgent occurrences with SLA expiring soon
        const urgentOccurrences = await prisma.occurrence.findMany({
            where: {
                priority: 'URGENTE',
                status: { notIn: ['RESOLVIDA', 'ARQUIVADA'] },
                slaDeadline: { lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) },
            },
            include: { condominium: true },
            orderBy: { slaDeadline: 'asc' },
            take: 5,
        });

        for (const occ of urgentOccurrences) {
            priorities.push({
                id: occ.id,
                type: 'sla',
                title: `SLA a expirar: ${occ.title}`,
                description: occ.description,
                dueDate: occ.slaDeadline,
                urgency: 'high',
                condominiumId: occ.condominiumId,
                condominiumName: occ.condominium.name,
            });
        }

        // Fractions with high debt
        const highDebtFractions = await prisma.fraction.findMany({
            where: {
                debtAmount: { gt: 500 },
                paymentStatus: 'ATRASO',
            },
            include: { condominium: true },
            orderBy: { debtAmount: 'desc' },
            take: 5,
        });

        for (const fraction of highDebtFractions) {
            priorities.push({
                id: fraction.id,
                type: 'payment',
                title: `Fração ${fraction.number} em dívida`,
                description: `Dívida de €${fraction.debtAmount.toFixed(2)} - ${fraction.ownerName}`,
                dueDate: null,
                urgency: fraction.debtAmount > 1000 ? 'high' : 'medium',
                condominiumId: fraction.condominiumId,
                condominiumName: fraction.condominium.name,
            });
        }

        // Upcoming assemblies
        const upcomingAssemblies = await prisma.assembly.findMany({
            where: {
                status: 'AGENDADA',
                date: {
                    gte: now,
                    lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
                },
            },
            include: { condominium: true },
            orderBy: { date: 'asc' },
            take: 5,
        });

        for (const assembly of upcomingAssemblies) {
            priorities.push({
                id: assembly.id,
                type: 'assembly',
                title: `Assembleia agendada`,
                description: assembly.location || 'Assembleia Geral',
                dueDate: assembly.date,
                urgency: 'medium',
                condominiumId: assembly.condominiumId,
                condominiumName: assembly.condominium.name,
            });
        }

        // Sort by urgency and date
        priorities.sort((a, b) => {
            if (a.urgency !== b.urgency) {
                const urgencyOrder = { high: 0, medium: 1, low: 2 };
                return urgencyOrder[a.urgency as keyof typeof urgencyOrder] - urgencyOrder[b.urgency as keyof typeof urgencyOrder];
            }
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            return 0;
        });

        res.json(priorities.slice(0, 10));
    } catch (error) {
        console.error('Dashboard priorities error:', error);
        res.status(500).json({ message: 'Erro ao buscar prioridades' });
    }
});

router.get('/at-risk', authenticate, async (req, res) => {
    try {
        const condominiums = await prisma.condominium.findMany({
            where: {
                OR: [
                    { riskLevel: { in: ['HIGH', 'CRITICAL'] } },
                    { debtTotal: { gt: 2000 } },
                    { urgentOccurrences: { gt: 0 } },
                ],
            },
            orderBy: [{ urgentOccurrences: 'desc' }, { debtTotal: 'desc' }],
            take: 10,
        });

        const atRisk = await Promise.all(
            condominiums.map(async (condo) => {
                const lastPayment = await prisma.transaction.findFirst({
                    where: {
                        condominiumId: condo.id,
                        type: 'RECEITA',
                    },
                    orderBy: { date: 'desc' },
                });

                return {
                    id: condo.id,
                    name: condo.name,
                    riskLevel: condo.riskLevel,
                    debtTotal: condo.debtTotal,
                    urgentOccurrences: condo.urgentOccurrences,
                    openOccurrences: condo.openOccurrences,
                    lastPaymentDate: lastPayment?.date || null,
                };
            })
        );

        res.json(atRisk);
    } catch (error) {
        console.error('Dashboard at-risk error:', error);
        res.status(500).json({ message: 'Erro ao buscar condomínios em risco' });
    }
});

export default router;
