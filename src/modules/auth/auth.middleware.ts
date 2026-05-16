import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
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

  if (!authHeader) {
    logger.warn(
      { path: req.path },
      '[AuthMiddleware] Requête sans header Authorization',
    );
    return res.status(401).json({ message: 'Token manquant ou invalide.' });
  }

  const [scheme, token] = authHeader.trim().split(/\s+/);

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    logger.warn({ path: req.path }, '[AuthMiddleware] Format Authorization invalide');
    return res.status(401).json({ message: 'Token manquant ou invalide.' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);

    if (!isAuthPayload(payload)) {
      logger.warn({ path: req.path }, '[AuthMiddleware] Payload JWT invalide');
      return res.status(401).json({ message: 'Token invalide ou expiré.' });
    }

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

const isAuthPayload = (payload: string | JwtPayload): payload is JwtPayload & { sub: string; email: string } => {
  return (
    typeof payload === 'object' &&
    typeof payload.sub === 'string' &&
    typeof payload.email === 'string'
  );
};
