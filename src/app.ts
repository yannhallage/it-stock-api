import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import swaggerUi from 'swagger-ui-express';
import { authModule } from './modules/auth/auth.module';
import { stocksModule } from './modules/stocks/stocks.module';
import { suppliersModule } from './modules/suppliers/suppliers.module';
import { materialTypesModule } from './modules/material-types/material-types.module';
import { logger } from './logger';
import { HttpError } from './errors/http-error';

const app: Application = express();

// Middleware CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Toujours autoriser si pas d'origine (requêtes same-origin ou outils de test)
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        env.corsOrigin,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
      ];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Origine non autorisée par CORS'), false);
      }
    },
    credentials: true,
  })
);

// Middleware pour parser le JSON
app.use(express.json());

// Endpoint de vérification de santé
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routing du module d'authentification
app.use('/api/auth', authModule.router);

// Routing du module de gestion des stocks (matériels)
app.use('/api/assets', stocksModule.router);

// Routing du module de gestion des fournisseurs
app.use('/api/suppliers', suppliersModule.router);

// Routing du module de gestion des types de matériel
app.use('/api/material-types', materialTypesModule.router);

// Documentation Swagger disponible à /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware global de gestion des erreurs
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const isHttpError = err instanceof HttpError || (typeof err.status === 'number' && err.status >= 400 && err.status < 600);
  const status: number = isHttpError ? err.status ?? 400 : 500;

  if (status >= 500) {
    logger.error({ err }, '[IT-STOCK-API] Erreur non gérée');
  } else {
    logger.warn({ err }, '[IT-STOCK-API] Erreur applicative');
  }

  res.status(status).json({
    message: err.message || 'Erreur interne du serveur',
    code: err.code,
  });
});

export default app;
