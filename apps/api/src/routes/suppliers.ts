import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { parsePagination, createPaginatedResponse } from '../utils/helpers';
import { supplierSchema, supplierUpdateSchema, supplierQuerySchema } from '@condoflow/shared';

const router = Router();
const prisma = new PrismaClient();

// GET /suppliers - List with advanced filters
router.get('/', authenticate, async (req, res) => {
    try {
        const queryValidation = supplierQuerySchema.safeParse(req.query);
        if (!queryValidation.success) {
            return res.status(400).json({ message: 'Parâmetros inválidos', errors: queryValidation.error.errors });
        }

        const { search, categories, favorite, active, hasEmail } = queryValidation.data;
        const pagination = parsePagination(queryValidation.data);

        const where: any = {};

        if (active !== undefined) where.active = active;
        if (favorite !== undefined) where.favorite = favorite;

        if (hasEmail === true) where.email = { not: null };
        if (hasEmail === false) where.email = null;

        if (categories) {
            const categoryList = categories.split(',');
            where.AND = categoryList.map(cat => ({
                categories: { contains: cat }
            }));
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { nif: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
                { tags: { contains: search } },
                { contactPerson: { contains: search } },
            ];
        }

        const [suppliers, total] = await Promise.all([
            prisma.supplier.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: {
                            occurrences: true,
                            projects: true,
                            transactions: true
                        }
                    }
                }
            }),
            prisma.supplier.count({ where }),
        ]);

        res.json(createPaginatedResponse(suppliers, total, pagination));
    } catch (error) {
        console.error('Get suppliers error:', error);
        res.status(500).json({ message: 'Erro ao buscar fornecedores' });
    }
});

// GET /suppliers/export - CSV Export
router.get('/export', authenticate, async (req, res) => {
    try {
        const suppliers = await prisma.supplier.findMany({
            orderBy: { name: 'asc' },
        });

        const csvRows = [
            ['Nome', 'Categorias', 'Email', 'Telefone', 'NIF', 'Morada', 'Contacto', 'Favorito', 'Estado', 'Tags'].join(','),
            ...suppliers.map(s => [
                `"${s.name}"`,
                `"${s.categories}"`,
                `"${s.email || ''}"`,
                `"${s.phone || ''}"`,
                `"${s.nif}"`,
                `"${(s.address || '').replace(/"/g, '""')}"`,
                `"${s.contactPerson || ''}"`,
                s.favorite ? 'Sim' : 'Não',
                s.active ? 'Ativo' : 'Inativo',
                `"${s.tags || ''}"`
            ].join(','))
        ];

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=fornecedores.csv');
        res.send(csvRows.join('\n'));
    } catch (error) {
        res.status(500).json({ message: 'Erro ao exportar dados' });
    }
});

// GET /suppliers/:id - Full detail
router.get('/:id', authenticate, async (req, res) => {
    try {
        const supplier = await prisma.supplier.findUnique({
            where: { id: req.params.id },
            include: {
                occurrences: {
                    take: 20,
                    orderBy: { reportedAt: 'desc' },
                    include: { condominium: true }
                },
                projects: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: { condominium: true }
                },
                transactions: {
                    take: 20,
                    orderBy: { date: 'desc' },
                    include: { condominium: true }
                },
                documents: {
                    take: 20,
                    orderBy: { createdAt: 'desc' }
                }
            },
        });

        if (!supplier) {
            return res.status(404).json({ message: 'Fornecedor não encontrado' });
        }

        res.json(supplier);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar fornecedor' });
    }
});

// POST /suppliers
router.post('/', authenticate, async (req, res) => {
    try {
        const validation = supplierSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos', errors: validation.error.errors });
        }

        const supplier = await prisma.supplier.create({ data: validation.data });
        res.status(201).json(supplier);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'NIF já existe' });
        }
        res.status(500).json({ message: 'Erro ao criar fornecedor' });
    }
});

// PUT /suppliers/:id
router.put('/:id', authenticate, async (req, res) => {
    try {
        const validation = supplierUpdateSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos', errors: validation.error.errors });
        }

        const supplier = await prisma.supplier.update({
            where: { id: req.params.id },
            data: validation.data,
        });

        res.json(supplier);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Fornecedor não encontrado' });
        }
        res.status(500).json({ message: 'Erro ao atualizar fornecedor' });
    }
});

// DELETE /suppliers/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        // We could do a soft delete by setting active=false, but user asked for delete too.
        // Let's check for relations first to avoid Prisma foreign key errors (though we use SetNull in some places)
        await prisma.supplier.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Fornecedor não encontrado' });
        }
        // If there are transactions or occurrences, the DB might block it if we didn't specify onDelete.
        // Our schema says SetNull for occurrences and projects, so it should work.
        res.status(500).json({ message: 'Erro ao eliminar fornecedor. Verifique se existem registos vinculados.' });
    }
});

export default router;
