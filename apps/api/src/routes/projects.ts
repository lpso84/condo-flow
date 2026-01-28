import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { parsePagination, createPaginatedResponse } from '../utils/helpers';
import { paginationSchema, projectSchema, projectUpdateSchema } from '@condoflow/shared';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
    try {
        const queryValidation = paginationSchema.safeParse(req.query);
        if (!queryValidation.success) {
            return res.status(400).json({ message: 'Parâmetros inválidos' });
        }

        const { condominiumId, status } = req.query;
        const pagination = parsePagination(queryValidation.data);

        const where: any = {};
        if (condominiumId) where.condominiumId = condominiumId as string;
        if (status) where.status = status as string;

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                include: { condominium: true, supplier: true },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.project.count({ where }),
        ]);

        res.json(createPaginatedResponse(projects, total, pagination));
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar obras' });
    }
});

router.get('/:id', authenticate, async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
            include: { condominium: true, supplier: true },
        });

        if (!project) {
            return res.status(404).json({ message: 'Obra não encontrada' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar obra' });
    }
});

router.post('/', authenticate, async (req, res) => {
    try {
        const validation = projectSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos', errors: validation.error.errors });
        }

        const project = await prisma.project.create({ data: validation.data });
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar obra' });
    }
});

router.put('/:id', authenticate, async (req, res) => {
    try {
        const validation = projectUpdateSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos' });
        }

        const project = await prisma.project.update({
            where: { id: req.params.id },
            data: validation.data,
        });

        res.json(project);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Obra não encontrada' });
        }
        res.status(500).json({ message: 'Erro ao atualizar obra' });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    try {
        await prisma.project.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Obra não encontrada' });
        }
        res.status(500).json({ message: 'Erro ao eliminar obra' });
    }
});

export default router;
