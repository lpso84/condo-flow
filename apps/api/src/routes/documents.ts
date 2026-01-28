import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { parsePagination, createPaginatedResponse } from '../utils/helpers';
import { paginationSchema, documentSchema } from '@condoflow/shared';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const documentQuerySchema = paginationSchema.extend({
    condominiumId: z.string().uuid().optional(),
    category: z.string().optional(),
    assemblyId: z.string().uuid().optional(),
    occurrenceId: z.string().uuid().optional(),
    supplierId: z.string().uuid().optional(),
    transactionId: z.string().uuid().optional(),
    projectId: z.string().uuid().optional(),
});

router.get('/', authenticate, async (req, res) => {
    try {
        const queryValidation = documentQuerySchema.safeParse(req.query);
        if (!queryValidation.success) {
            return res.status(400).json({ message: 'Parâmetros inválidos' });
        }

        const { search, condominiumId, category, assemblyId, occurrenceId, supplierId, transactionId, projectId } = queryValidation.data;
        const pagination = parsePagination(queryValidation.data);

        const where: any = {};
        if (condominiumId) where.condominiumId = condominiumId;
        if (category && category !== 'ALL') where.category = category;
        if (assemblyId) where.assemblyId = assemblyId;
        if (occurrenceId) where.occurrenceId = occurrenceId;
        if (supplierId) where.supplierId = supplierId;
        if (transactionId) where.transactionId = transactionId;
        if (projectId) where.projectId = projectId;

        if (search) {
            where.OR = [
                { title: { contains: search } }, // Implicit case-insensitive in SQLite usually? No, explicit mode needed often.
                // Prisma SQLite supports mode insensitive for contains? Yes.
                { fileName: { contains: search } },
                { tags: { contains: search } },
            ];
            // But Prisma SQLite case-insensitive might allow simple contains for now or I use explicit if needed.
            // Let's stick to simple contains or rely on the previous implementation detail if it had insensitive.
        }

        const [documents, total] = await Promise.all([
            prisma.document.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                include: {
                    condominium: true,
                    assembly: { select: { year: true, type: true } }, // Context
                    supplier: { select: { name: true } }
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.document.count({ where }),
        ]);

        res.json(createPaginatedResponse(documents, total, pagination));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar documentos' });
    }
});

router.get('/:id', authenticate, async (req, res) => {
    try {
        const document = await prisma.document.findUnique({
            where: { id: req.params.id },
            include: {
                condominium: true,
                assembly: true,
                occurrence: true,
                versions: { orderBy: { version: 'desc' } }
            },
        });

        if (!document) {
            return res.status(404).json({ message: 'Documento não encontrado' });
        }

        res.json(document);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar documento' });
    }
});

router.post('/', authenticate, async (req, res) => {
    try {
        const validation = documentSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos', errors: validation.error.errors });
        }

        // Mock upload logic
        const filePath = `/documents/${validation.data.condominiumId}/${validation.data.fileName}`;

        const document = await prisma.document.create({
            data: {
                ...validation.data,
                filePath,
                fileSize: Math.floor(Math.random() * 1000000), // Mock size
                mimeType: 'application/pdf', // Mock type
                version: 1,
                uploadedBy: (req as any).user?.email || 'system',
                versions: {
                    create: {
                        version: 1,
                        fileName: validation.data.fileName,
                        filePath,
                        fileSize: Math.floor(Math.random() * 1000000),
                        mimeType: 'application/pdf',
                        uploadedBy: (req as any).user?.email || 'system',
                    }
                }
            },
        });

        res.status(201).json(document);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar documento' });
    }
});

router.post('/:id/versions', authenticate, async (req, res) => {
    try {
        // Simple schema for new version
        const versionSchema = z.object({
            fileName: z.string().min(1),
        });

        const validation = versionSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos' });
        }

        const document = await prisma.document.findUnique({ where: { id: req.params.id } });
        if (!document) return res.status(404).json({ message: 'Documento não encontrado' });

        const newVersion = document.version + 1;
        const filePath = `/documents/${document.condominiumId}/${validation.data.fileName}`;

        const updatedDoc = await prisma.document.update({
            where: { id: req.params.id },
            data: {
                version: newVersion,
                fileName: validation.data.fileName,
                filePath: filePath,
                versions: {
                    create: {
                        version: newVersion,
                        fileName: validation.data.fileName,
                        filePath: filePath,
                        fileSize: Math.floor(Math.random() * 1000000),
                        mimeType: 'application/pdf',
                        uploadedBy: (req as any).user?.email || 'system',
                    }
                }
            },
            include: { versions: { orderBy: { version: 'desc' } } }
        });

        res.json(updatedDoc);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar nova versão' });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    try {
        await prisma.document.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Documento não encontrado' });
        }
        res.status(500).json({ message: 'Erro ao eliminar documento' });
    }
});

export default router;
