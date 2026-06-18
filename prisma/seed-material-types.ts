import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type MaterialTypeSeed = {
  name: string;
  description: string;
};

const MATERIAL_TYPES: MaterialTypeSeed[] = [
  { name: 'Laptop', description: 'Ordinateur portable' },
  { name: 'Desktop', description: 'Ordinateur de bureau (unité centrale)' },
  { name: 'Monitor', description: 'Écran / moniteur' },
  { name: 'Printer', description: 'Imprimante' },
  { name: 'Scanner', description: 'Scanner de documents' },
  { name: 'Projector', description: 'Vidéoprojecteur' },
  { name: 'Keyboard', description: 'Clavier' },
  { name: 'Mouse', description: 'Souris' },
  { name: 'Router', description: 'Routeur réseau' },
  { name: 'Switch', description: 'Commutateur réseau' },
  { name: 'UPS', description: 'Onduleur (alimentation sans interruption)' },
  { name: 'NAS', description: 'Serveur de stockage en réseau' },
  { name: 'Tablet', description: 'Tablette tactile' },
  { name: 'Smartphone', description: 'Téléphone intelligent' },
  { name: 'Server', description: 'Serveur informatique' },
  { name: 'Webcam', description: 'Caméra web' },
  { name: 'Phone', description: 'Téléphone fixe / IP' },
  { name: 'Access Point', description: "Point d'accès Wi-Fi" },
  { name: 'Firewall', description: 'Pare-feu réseau' },
  { name: 'External Drive', description: 'Disque dur externe' },
  { name: 'Docking Station', description: 'Station d’accueil' },
  { name: 'Headset', description: 'Casque audio' },
  { name: 'Other', description: 'Autre type de matériel' },
];

async function main() {
  const typeNames = MATERIAL_TYPES.map((type) => type.name);

  const existingTypes = await prisma.materialType.findMany({
    where: {
      name: {
        in: typeNames,
      },
      deletedAt: null,
    },
    select: {
      name: true,
    },
  });

  const existingNames = new Set(existingTypes.map((type) => type.name));
  const typesToCreate = MATERIAL_TYPES.filter((type) => !existingNames.has(type.name));

  if (typesToCreate.length === 0) {
    console.log(`Les ${MATERIAL_TYPES.length} types de matériels existent déjà. Aucune insertion effectuée.`);
    return;
  }

  const created = await prisma.$transaction(
    typesToCreate.map((type) =>
      prisma.materialType.create({
        data: type,
      }),
    ),
  );

  console.log(`${created.length} type(s) de matériel créé(s).`);
  console.log('Noms ajoutés :', created.map((type) => type.name));
}

main()
  .catch((error) => {
    console.error('Erreur pendant le seed des types de matériels :', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
