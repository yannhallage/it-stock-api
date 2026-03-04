import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IT Stock API',
      version: '1.0.0',
      description: 'API de base pour IT Stock avec module Auth.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./src/modules/**/*.controller.ts', './dist/modules/**/*.controller.js'],
};

export const swaggerSpec = swaggerJsdoc(options);

