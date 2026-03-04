import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { logger } from '../../logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(
      { path: req.path },
      '[AuthMiddleware] Requête sans header Authorization ou format invalide',
    );
    return res.status(401).json({ message: 'Token manquant ou invalide.' });
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string; email: string };

    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    logger.debug(
      { userId: payload.sub, email: payload.email, path: req.path },
      '[AuthMiddleware] Authentification réussie',
    );

    return next();
  } catch (error) {
    logger.warn({ path: req.path, err: error }, '[AuthMiddleware] Token invalide ou expiré');
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};

