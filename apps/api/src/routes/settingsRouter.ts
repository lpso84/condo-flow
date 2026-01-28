import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { z } from 'zod';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// --- GLOBAL SETTINGS ---

// Get Global Settings
router.get('/global', authenticate, authorize('ADMIN', 'GESTOR'), async (req: AuthRequest, res) => {
    try {
        const settings = await prisma.globalSettings.findUnique({
            where: { id: 'global' },
        });
        // Return defaults if not found (though seed creates it)
        res.json(settings || {});
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch global settings' });
    }
});

// Update Global Settings
router.put('/global', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
    try {
        const schema = z.object({
            companyName: z.string().min(1),
            companyLogo: z.string().optional(),
            emailFooter: z.string().optional(),
            defaultReserveFundPercentage: z.number().min(0),
            defaultIvaPercentage: z.number().min(0),
            currency: z.string(),
            notifyOnOccurrence: z.boolean(),
            notifyOnPaymentDelay: z.boolean(),
            notifyOnAssembly: z.boolean(),
        });

        const data = schema.parse(req.body);

        const settings = await prisma.globalSettings.upsert({
            where: { id: 'global' },
            update: data,
            create: { id: 'global', ...data },
        });

        // Log audit
        await prisma.auditLog.create({
            data: {
                entity: 'SETTINGS',
                entityId: 'global',
                action: 'UPDATE',
                details: JSON.stringify(data),
                performedBy: req.user?.id || 'system',
            },
        });

        res.json(settings);
    } catch (error) {
        res.status(400).json({ error: 'Invalid settings data' });
    }
});

// --- OCCURRENCE CATEGORIES ---

router.get('/categories/occurrences', authenticate, async (req, res) => {
    const categories = await prisma.occurrenceCategory.findMany({
        orderBy: { name: 'asc' },
    });
    res.json(categories);
});

router.post('/categories/occurrences', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
    try {
        const category = await prisma.occurrenceCategory.create({
            data: req.body,
        });

        await prisma.auditLog.create({
            data: {
                entity: 'OCCURRENCE_CATEGORY',
                entityId: category.id,
                action: 'CREATE',
                details: category.name,
                performedBy: req.user?.id || 'system',
            },
        });

        res.json(category);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create category' });
    }
});

router.put('/categories/occurrences/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
    try {
        const category = await prisma.occurrenceCategory.update({
            where: { id: req.params.id },
            data: req.body,
        });

        await prisma.auditLog.create({
            data: {
                entity: 'OCCURRENCE_CATEGORY',
                entityId: category.id,
                action: 'UPDATE',
                details: JSON.stringify(req.body),
                performedBy: req.user?.id || 'system',
            },
        });

        res.json(category);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update category' });
    }
});

router.delete('/categories/occurrences/:id', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        await prisma.occurrenceCategory.delete({
            where: { id: req.params.id },
        });
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete category' });
    }
});

// --- WORKFLOW STATES ---

router.get('/workflow/states', authenticate, async (req, res) => {
    const states = await prisma.workflowState.findMany({
        orderBy: { order: 'asc' },
    });
    res.json(states);
});

router.put('/workflow/states', authenticate, authorize('ADMIN'), async (req, res) => {
    // Bulk update for ordering
    const { states } = req.body; // Expects array of { id, order }

    try {
        for (const s of states) {
            await prisma.workflowState.update({
                where: { id: s.id },
                data: { order: s.order }
            });
        }
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Failed to reorder" });
    }
});

// --- AUDIT LOGS ---

router.get('/audit-logs', authenticate, authorize('ADMIN'), async (req, res) => {
    const limit = 50;
    const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit
    });
    res.json(logs);
});

// --- USERS MANAGEMENT (Simplified) ---

router.get('/users', authenticate, authorize('ADMIN'), async (req, res) => {
    const users = await prisma.user.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
    });
    res.json(users);
});

export default router;
