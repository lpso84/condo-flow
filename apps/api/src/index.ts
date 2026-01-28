import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import condominiumRoutes from './routes/condominiums';
import fractionRoutes from './routes/fractions';
import occurrenceRoutes from './routes/occurrences';
import transactionRoutes from './routes/transactions';
import supplierRoutes from './routes/suppliers';
import projectRoutes from './routes/projects';
import assemblyRoutes from './routes/assemblies';
import documentRoutes from './routes/documents';
import contactRoutes from './routes/contacts';
import dashboardRoutes from './routes/dashboard';
import settingsRoutes from './routes/settingsRouter';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/condominiums', condominiumRoutes);
app.use('/api/fractions', fractionRoutes);
app.use('/api/occurrences', occurrenceRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/assemblies', assemblyRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 API server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
