import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import transactionRoutes from '../routes/transactions';

// Mock authentication
vi.mock('../middleware/auth', () => ({
    authenticate: (req: any, res: any, next: any) => {
        req.user = { id: 'test-user', role: 'ADMIN' };
        next();
    }
}));

const app = express();
app.use(express.json());
app.use('/transactions', transactionRoutes);

describe('Transactions API', () => {
    it('should list transactions with filters', async () => {
        const response = await request(app).get('/transactions?type=RECEITA');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return financial summary', async () => {
        const response = await request(app).get('/transactions/summary');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('totalRevenue');
        expect(response.body).toHaveProperty('totalExpenses');
        expect(response.body).toHaveProperty('balance');
    });
});
