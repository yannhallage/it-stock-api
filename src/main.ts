import http from 'http';
import app from './app';
import { env } from './config/env';
import { logger } from './logger';

const server = http.createServer(app);

const start = async () => {
  try {
    server.listen(env.port, () => {
      logger.info(`Serveur lancé sur le port ${env.port} en mode ${env.nodeEnv}`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Erreur au démarrage du serveur: ${message}`);
    process.exit(1);
  }
};

start();
