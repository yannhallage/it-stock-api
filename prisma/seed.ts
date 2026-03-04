import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_USER_EMAIL || 'admin@assnat.ci';
  const password = process.env.SEED_USER_PASSWORD || 'Admin@1234';
  const name = process.env.SEED_USER_NAME || 'Admin';

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`Utilisateur avec l'email ${email} existe déjà, seed ignoré.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  console.log('Utilisateur seed créé :', {
    id: user.id,
    email: user.email,
    name: user.name,
  });
}

main()
  .catch((err) => {
    console.error('Erreur pendant le seed Prisma :', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

