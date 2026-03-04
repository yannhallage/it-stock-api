import http from 'http';
import app from './app';
import { env } from './config/env';
import { logger } from './logger';

const server = http.createServer(app);

const start = async () => {
  try {
    server.listen(env.port, () => {
      logger.info(
        `[IT-STOCK-API] Serveur lancé sur le port ${env.port} en mode ${env.nodeEnv}`,
      );
      logger.info('[IT-STOCK-API] Swagger disponible sur /docs');
    });
  } catch (error) {
    logger.error({ err: error }, '[IT-STOCK-API] Erreur au démarrage du serveur');
    process.exit(1);
  }
};

start();

