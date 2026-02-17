import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction): void {
  console.error(`❌ Error: ${err.message}`);

  // SQLite unique constraint
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    res.status(409).json({ error: 'A record with this value already exists.' });
    return;
  }

  // SQLite foreign key constraint
  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    res.status(400).json({ error: 'Referenced record does not exist.' });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
