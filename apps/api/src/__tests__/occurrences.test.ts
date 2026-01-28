import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import occurrenceRoutes from '../routes/occurrences';

// Mock authentication
vi.mock('../middleware/auth', () => ({
    authenticate: (req: any, _res: any, next: any) => {
        req.user = { id: 'test-user', role: 'ADMIN' };
        next();
    }
}));

const app = express();
app.use(express.json());
app.use('/occurrences', occurrenceRoutes);

describe('Occurrences API', () => {
    it('should list occurrences with pagination and filters', async () => {
        const response = await request(app).get('/occurrences?status=ABERTA&page=1&pageSize=10');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(typeof response.body.total).toBe('number');
        expect(response.body.page).toBe(1);
        expect(response.body.pageSize).toBe(10);
    });
});

