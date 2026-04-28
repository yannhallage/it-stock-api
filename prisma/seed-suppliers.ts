import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SupplierSeed = {
  name: string;
  contact: string;
  address: string;
};

const SUPPLIERS: SupplierSeed[] = [
  { name: 'TechDistrib CI', contact: '+225 0701010101', address: 'Cocody, Abidjan' },
  { name: 'Ivoire Informatique Services', contact: '+225 0702020202', address: 'Plateau, Abidjan' },
  { name: 'Global Hardware Afrique', contact: '+225 0703030303', address: 'Marcory, Abidjan' },
  { name: 'Digital Pro Supply', contact: '+225 0704040404', address: 'Treichville, Abidjan' },
  { name: 'NeoTech Fournitures', contact: '+225 0705050505', address: 'Yopougon, Abidjan' },
  { name: 'Centrale IT Distribution', contact: '+225 0706060606', address: 'Koumassi, Abidjan' },
  { name: 'NetPlus Equipements', contact: '+225 0707070707', address: 'Port-Bouet, Abidjan' },
  { name: 'Sigma Solutions Pro', contact: '+225 0708080808', address: 'Bingerville, Abidjan' },
  { name: 'Afrique Data Fournisseur', contact: '+225 0709090909', address: 'Abobo, Abidjan' },
  { name: 'Elite Computer Market', contact: '+225 0710101010', address: 'Adjamé, Abidjan' },
  { name: 'Orion Tech Trade', contact: '+225 0711111111', address: 'Riviera, Abidjan' },
  { name: 'Nova Materiel Bureau', contact: '+225 0712121212', address: 'Deux Plateaux, Abidjan' },
  { name: 'Phoenix Equipement IT', contact: '+225 0713131313', address: 'Attécoubé, Abidjan' },
  { name: 'Prestige Info Supply', contact: '+225 0714141414', address: 'Anyama, Abidjan' },
  { name: 'Urban Digital Hub', contact: '+225 0715151515', address: 'Songon, Abidjan' },
  { name: 'Smart Office Providers', contact: '+225 0716161616', address: 'Grand-Bassam' },
  { name: 'West Africa IT Parts', contact: '+225 0717171717', address: 'San-Pédro' },
  { name: 'Prime Network Store', contact: '+225 0718181818', address: 'Yamoussoukro' },
  { name: 'Hexa Tech Supplies', contact: '+225 0719191919', address: 'Bouaké' },
  { name: 'Zenith Distribution Group', contact: '+225 0720202020', address: 'Daloa' },
  { name: 'Proxima Informatique', contact: '+225 0721212121', address: 'Korhogo' },
  { name: 'Omni Bureau Equipements', contact: '+225 0722222222', address: 'Man' },
  { name: 'Delta Tech Logistics', contact: '+225 0723232323', address: 'Gagnoa' },
];

async function main() {
  const supplierNames = SUPPLIERS.map((supplier) => supplier.name);

  const existingSuppliers = await prisma.supplier.findMany({
    where: {
      name: {
        in: supplierNames,
      },
      deletedAt: null,
    },
    select: {
      name: true,
    },
  });

  const existingNames = new Set(existingSuppliers.map((supplier) => supplier.name));
  const suppliersToCreate = SUPPLIERS.filter((supplier) => !existingNames.has(supplier.name));

  if (suppliersToCreate.length === 0) {
    console.log('Les 23 fournisseurs existent déjà. Aucune insertion effectuée.');
    return;
  }

  const created = await prisma.$transaction(
    suppliersToCreate.map((supplier) =>
      prisma.supplier.create({
        data: supplier,
      }),
    ),
  );

  console.log(`${created.length} fournisseur(s) créé(s).`);
  console.log('Noms ajoutés :', created.map((supplier) => supplier.name));
}

main()
  .catch((error) => {
    console.error('Erreur pendant le seed des fournisseurs :', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
