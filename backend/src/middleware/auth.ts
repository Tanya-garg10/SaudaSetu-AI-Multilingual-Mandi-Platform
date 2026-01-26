import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token.'
    });
  }
};