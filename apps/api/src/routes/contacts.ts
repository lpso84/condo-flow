import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { parsePagination, createPaginatedResponse } from '../utils/helpers';
import { paginationSchema, contactSchema, contactUpdateSchema } from '@condoflow/shared';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
    try {
        const queryValidation = paginationSchema.safeParse(req.query);
        if (!queryValidation.success) {
            return res.status(400).json({ message: 'Parâmetros inválidos' });
        }

        const { condominiumId } = req.query;
        const { search } = queryValidation.data;
        const pagination = parsePagination(queryValidation.data);

        const where: any = {};
        if (condominiumId) where.condominiumId = condominiumId as string;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { role: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [contacts, total] = await Promise.all([
            prisma.contact.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { name: 'asc' },
            }),
            prisma.contact.count({ where }),
        ]);

        res.json(createPaginatedResponse(contacts, total, pagination));
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar contactos' });
    }
});

router.post('/', authenticate, async (req, res) => {
    try {
        const validation = contactSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos', errors: validation.error.errors });
        }

        const contact = await prisma.contact.create({ data: validation.data });
        res.status(201).json(contact);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar contacto' });
    }
});

router.put('/:id', authenticate, async (req, res) => {
    try {
        const validation = contactUpdateSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos' });
        }

        const contact = await prisma.contact.update({
            where: { id: req.params.id },
            data: validation.data,
        });

        res.json(contact);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Contacto não encontrado' });
        }
        res.status(500).json({ message: 'Erro ao atualizar contacto' });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    try {
        await prisma.contact.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Contacto não encontrado' });
        }
        res.status(500).json({ message: 'Erro ao eliminar contacto' });
    }
});

export default router;
