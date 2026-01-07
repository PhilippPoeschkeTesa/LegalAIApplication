import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Prefer compiled JS files (dist) but also include TS source files as a fallback.
// This ensures swagger-jsdoc finds JSDoc comments both in development and in the
// production build where only compiled JS files exist.
const jsApis = [
  path.join(__dirname, '..', 'routes', '*.js'),
  path.join(__dirname, '..', 'controllers', '*.js'),
  path.join(__dirname, '..', 'auth.js'),
];

const tsApis = [
  path.join(process.cwd(), 'src', 'routes', '*.ts'),
  path.join(process.cwd(), 'src', 'controllers', '*.ts'),
  path.join(process.cwd(), 'src', 'auth.ts'),
];

// Give priority to JS files (they will exist in production dist). If JS files are
// missing, swagger-jsdoc will still try the TS patterns.
const apis = [...jsApis, ...tsApis];

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LegalAI API',
      version: '1.0.0',
      description: 'API documentation for LegalAI backend',
    },
  },
  apis,
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };