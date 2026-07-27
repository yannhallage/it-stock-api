import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import swaggerUi from 'swagger-ui-express';
import { authModule } from './modules/auth/auth.module';
import { authenticate } from './modules/auth/auth.middleware';
import { stocksModule } from './modules/stocks/stocks.module';
import { suppliersModule } from './modules/suppliers/suppliers.module';
import { materialTypesModule } from './modules/material-types/material-types.module';
import { departmentsModule } from './modules/departments/departments.module';
import { categoriesModule } from './modules/categories/categories.module';
import { brandsModule } from './modules/brands/brands.module';
import { employeesModule } from './modules/employees/employees.module';
import { locationsModule } from './modules/locations/locations.module';
import { maintenancesModule } from './modules/maintenances/maintenances.module';
import { attachmentsModule } from './modules/attachments/attachments.module';
import { movementsModule } from './modules/movements/movements.module';
import { assignmentsModule } from './modules/assignments/assignments.module';
import { incidentsModule } from './modules/incidents/incidents.module';
import { workshopModule } from './modules/workshop/workshop.module';
import { dashboardModule } from './modules/dashboard/dashboard.module';
import { impressionModule } from './modules/impression/impression.module';
import { screenLoansModule } from './modules/screen-loans/screen-loans.module';
import { logger } from './logger';
import { HttpError } from './errors/http-error';

const app: Application = express();

// Middleware CORS
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // Toujours autoriser si pas d'origine (requêtes same-origin ou outils de test)..
//       if (!origin) return callback(null, true);
//       const allowedOrigins = [
//         env.corsOrigin,
//         'http://localhost:5173',
//         'http://127.0.0.1:5173',
//         'https://assnat-stock.vercel.app',
//         'https://assnat-control.vercel.app',
//         'https://api-control-chi.vercel.app',
//         "http://localhost:3000",
//         "http://81.0.220.161:8080",
//         "http://localhost:8080"
//       ];
//       if (allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       } else {
//         return callback(new Error('Origine non autorisée par CORS'), false);
//       }
//     },
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        env.corsOrigin,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://assnat-stock.vercel.app',
        'https://assnat-control.vercel.app',
        'https://asset-it-control.vercel.app',
        'https://api-control-chi.vercel.app',
        'http://localhost:3000',
        'http://81.0.220.161:8080',
        'http://localhost:8080'
      ];
      console.log(`[CORS] Vérification de l'origine: ${origin}`);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Origine non autorisée par CORS'), false);
      }
    },
    credentials: true,
  })
);
app.options('*', cors());
app.options('*', cors());
// Middleware pour parser le JSON
app.use(express.json());

// Documentation Swagger disponible à /docs (token stocké après Authorize)
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);
// Endpoint de vérification de santé
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routing du module d'authentification (public : login, register)
app.use('/api/auth', authModule.router);

// Routes protégées par authentification JWT
app.use('/api/assets', authenticate, stocksModule.router);
app.use('/api', authenticate, assignmentsModule.router);
app.use('/api', authenticate, incidentsModule.router);
app.use('/api', authenticate, workshopModule.router);
app.use('/api/impression', authenticate, impressionModule.router);
app.use('/api/dashboard', authenticate, dashboardModule.router);
app.use('/api/screen-loans', authenticate, screenLoansModule.router);
app.use('/api/suppliers', authenticate, suppliersModule.router);
app.use('/api/material-types', authenticate, materialTypesModule.router);
app.use('/api/departments', authenticate, departmentsModule.router);
app.use('/api/categories', authenticate, categoriesModule.router);
app.use('/api/brands', authenticate, brandsModule.router);
app.use('/api/employees', authenticate, employeesModule.router);
app.use('/api/locations', authenticate, locationsModule.router);
app.use('/api/maintenances', authenticate, maintenancesModule.router);
app.use('/api/attachments', authenticate, attachmentsModule.router);
app.use('/api/movements', authenticate, movementsModule.router);



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
