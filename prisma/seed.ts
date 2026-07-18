import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_USER_EMAIL || 'admin@assnat.ci';
  const password = process.env.SEED_USER_PASSWORD || 'Admin@1234';
  const firstName = process.env.SEED_USER_FIRST_NAME || 'Admin';
  const lastName = process.env.SEED_USER_LAST_NAME || 'ASSNAT';

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
      firstName,
      lastName,
      password: hashedPassword,
    },
  });

  console.log('Utilisateur seed créé :', {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
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
