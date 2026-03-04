## IT Stock API - Backend Express TypeScript

Backend Express en TypeScript avec Prisma (v5.10.0, pas la dernière), documentation Swagger et une structure modulaire prête pour de futurs modules.

### Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Langage**: TypeScript
- **ORM**: Prisma (5.10.0)
- **Auth**: JWT + bcrypt
- **Doc API**: Swagger (swagger-jsdoc + swagger-ui-express)

### Structure de répertoire

- **`src/config`**: configuration (env, swagger, etc.)
- **`src/prisma`**: client Prisma
- **`src/modules`**: tous les modules métiers
  - **`auth`**: premier module
    - `auth.controller.ts`
    - `auth.service.ts`
    - `auth.middleware.ts`
    - `auth.module.ts`
    - `dto/` (DTO de ce module)
- **`prisma`**: schéma Prisma

Rappel: **module = controller + service + dto + module (fichier qui assemble)**.

### Installation

Depuis le dossier du projet:

```bash
npm install
```

Configurer vos variables d'environnement:

```bash
cp .env.example .env
# puis modifier .env avec vos vraies valeurs
```

### Base de données & Prisma

1. Assurez-vous que votre base PostgreSQL est accessible et que `DATABASE_URL` dans `.env` est correct.
2. Appliquez le schéma à la base:

```bash
npx prisma db push
```

3. Générez le client Prisma:

```bash
npx prisma generate
```

### Scripts NPM

- **`npm run dev`**: démarre le serveur en mode développement (ts-node-dev).
- **`npm run build`**: compile TypeScript vers `dist`.
- **`npm start`**: démarre le serveur en production (`dist/main.js`).

### Endpoints principaux

- **Healthcheck**: `GET /health`
- **Swagger UI**: `GET /docs`
- **Auth**:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me` (protégé par Bearer token)

### Étapes pour démarrer

1. `npm install`
2. Copier et adapter `.env` depuis `.env.example`
3. `npx prisma db push && npx prisma generate`
4. `npm run dev`
5. Ouvrir `http://localhost:3000/docs` pour voir la documentation Swagger.

