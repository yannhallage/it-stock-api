import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import swaggerUi from 'swagger-ui-express';
import { authModule } from './modules/auth/auth.module';
import { logger } from './logger';

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

// Documentation Swagger disponible à /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware global de gestion des erreurs
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, '[IT-STOCK-API] Erreur non gérée');
  res.status(500).json({
    message: 'Erreur interne du serveur',
  });
});

export default app;
