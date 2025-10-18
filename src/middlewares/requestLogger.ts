import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  console.log(` ${req.method} ${req.path} - ${new Date().toISOString()}`);
  
  // Log response time when request is finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(` ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};
