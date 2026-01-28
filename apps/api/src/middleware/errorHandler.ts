import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Erro de validação',
            errors: err.message,
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            message: 'Não autorizado',
        });
    }

    return res.status(500).json({
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
};
