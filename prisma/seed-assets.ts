import 'dotenv/config';
import { AssetStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type AssetSeed = {
  inventoryNumber: string;
  serialNumber: string;
  category: string;
  materialType: string;
  brand: string;
  model: string;
  entryDate: Date;
  supplier: string;
  location: string;
  status: AssetStatus;
};

const ASSETS: AssetSeed[] = [
  { inventoryNumber: 'INV-2026-0001', serialNumber: 'SN-DL-001', category: 'Informatique', materialType: 'Laptop', brand: 'Dell', model: 'Latitude 5420', entryDate: new Date('2026-01-05'), supplier: 'TechDistrib CI', location: 'Stock principal', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0002', serialNumber: 'SN-HP-002', category: 'Informatique', materialType: 'Laptop', brand: 'HP', model: 'ProBook 450 G9', entryDate: new Date('2026-01-06'), supplier: 'Ivoire Informatique Services', location: 'Stock principal', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0003', serialNumber: 'SN-LN-003', category: 'Informatique', materialType: 'Laptop', brand: 'Lenovo', model: 'ThinkPad E14', entryDate: new Date('2026-01-07'), supplier: 'Global Hardware Afrique', location: 'Stock principal', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0004', serialNumber: 'SN-AS-004', category: 'Informatique', materialType: 'Desktop', brand: 'Asus', model: 'ExpertCenter D7', entryDate: new Date('2026-01-08'), supplier: 'Digital Pro Supply', location: 'Stock principal', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0005', serialNumber: 'SN-AP-005', category: 'Informatique', materialType: 'Desktop', brand: 'Acer', model: 'Veriton M4', entryDate: new Date('2026-01-09'), supplier: 'NeoTech Fournitures', location: 'Stock principal', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0006', serialNumber: 'SN-CT-006', category: 'Périphériques', materialType: 'Printer', brand: 'Canon', model: 'i-SENSYS LBP226dw', entryDate: new Date('2026-01-10'), supplier: 'Centrale IT Distribution', location: 'Stock principal', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0007', serialNumber: 'SN-EP-007', category: 'Périphériques', materialType: 'Printer', brand: 'Epson', model: 'EcoTank L6490', entryDate: new Date('2026-01-11'), supplier: 'NetPlus Equipements', location: 'Stock principal', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0008', serialNumber: 'SN-BR-008', category: 'Périphériques', materialType: 'Scanner', brand: 'Brother', model: 'ADS-4900W', entryDate: new Date('2026-01-12'), supplier: 'Sigma Solutions Pro', location: 'Stock principal', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0009', serialNumber: 'SN-CS-009', category: 'Périphériques', materialType: 'Monitor', brand: 'Samsung', model: 'S24R350', entryDate: new Date('2026-01-13'), supplier: 'Afrique Data Fournisseur', location: 'Stock principal', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0010', serialNumber: 'SN-CL-010', category: 'Périphériques', materialType: 'Monitor', brand: 'LG', model: '24MP400', entryDate: new Date('2026-01-14'), supplier: 'Elite Computer Market', location: 'Stock principal', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0011', serialNumber: 'SN-DA-011', category: 'Audiovisuel', materialType: 'Projector', brand: 'BenQ', model: 'MW550', entryDate: new Date('2026-01-15'), supplier: 'Orion Tech Trade', location: 'Salle réunion A', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0012', serialNumber: 'SN-DV-012', category: 'Audiovisuel', materialType: 'Projector', brand: 'ViewSonic', model: 'PA503S', entryDate: new Date('2026-01-16'), supplier: 'Nova Materiel Bureau', location: 'Salle réunion A', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0013', serialNumber: 'SN-HK-013', category: 'Périphériques', materialType: 'Keyboard', brand: 'Logitech', model: 'K120', entryDate: new Date('2026-01-17'), supplier: 'Phoenix Equipement IT', location: 'Stock principal', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0014', serialNumber: 'SN-HM-014', category: 'Périphériques', materialType: 'Mouse', brand: 'Logitech', model: 'M185', entryDate: new Date('2026-01-18'), supplier: 'Prestige Info Supply', location: 'Stock principal', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0015', serialNumber: 'SN-NR-015', category: 'Réseau', materialType: 'Router', brand: 'MikroTik', model: 'hAP ac3', entryDate: new Date('2026-01-19'), supplier: 'Urban Digital Hub', location: 'Salle serveur', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0016', serialNumber: 'SN-NS-016', category: 'Réseau', materialType: 'Switch', brand: 'Cisco', model: 'CBS250-24T-4G', entryDate: new Date('2026-01-20'), supplier: 'Smart Office Providers', location: 'Salle serveur', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0017', serialNumber: 'SN-PT-017', category: 'Réseau', materialType: 'UPS', brand: 'APC', model: 'BVX1200LI', entryDate: new Date('2026-01-21'), supplier: 'West Africa IT Parts', location: 'Salle serveur', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0018', serialNumber: 'SN-QR-018', category: 'Réseau', materialType: 'NAS', brand: 'Synology', model: 'DS223', entryDate: new Date('2026-01-22'), supplier: 'Prime Network Store', location: 'Salle serveur', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0019', serialNumber: 'SN-RS-019', category: 'Mobilité', materialType: 'Tablet', brand: 'Samsung', model: 'Galaxy Tab A9', entryDate: new Date('2026-01-23'), supplier: 'Hexa Tech Supplies', location: 'Stock principal', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0020', serialNumber: 'SN-ST-020', category: 'Mobilité', materialType: 'Smartphone', brand: 'Xiaomi', model: 'Redmi Note 13', entryDate: new Date('2026-01-24'), supplier: 'Zenith Distribution Group', location: 'Stock principal', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0021', serialNumber: 'SN-TV-021', category: 'Informatique', materialType: 'Server', brand: 'Dell', model: 'PowerEdge T150', entryDate: new Date('2026-01-25'), supplier: 'Proxima Informatique', location: 'Salle serveur', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0022', serialNumber: 'SN-UV-022', category: 'Informatique', materialType: 'Server', brand: 'HP', model: 'ProLiant ML30 Gen10', entryDate: new Date('2026-01-26'), supplier: 'Omni Bureau Equipements', location: 'Salle serveur', status: AssetStatus.EN_STOCK_NON_AFFECTE },
  { inventoryNumber: 'INV-2026-0023', serialNumber: 'SN-WX-023', category: 'Périphériques', materialType: 'Webcam', brand: 'Logitech', model: 'C920', entryDate: new Date('2026-01-27'), supplier: 'Delta Tech Logistics', location: 'Stock principal', status: AssetStatus.EN_STOCK_NON_AFFECTE },
];

async function upsertByName<T extends { id: number }>(
  find: () => Promise<T | null>,
  create: () => Promise<T>,
): Promise<T> {
  const existing = await find();
  if (existing) return existing;
  return create();
}

async function main() {
  const categoryNames = [...new Set(ASSETS.map((a) => a.category))];
  const materialTypeNames = [...new Set(ASSETS.map((a) => a.materialType))];
  const brandNames = [...new Set(ASSETS.map((a) => a.brand))];
  const supplierNames = [...new Set(ASSETS.map((a) => a.supplier))];
  const locationNames = [...new Set(ASSETS.map((a) => a.location))];

  const categories = new Map<string, number>();
  for (const name of categoryNames) {
    const row = await upsertByName(
      () => prisma.category.findUnique({ where: { name } }),
      () => prisma.category.create({ data: { name } }),
    );
    categories.set(name, row.id);
  }

  const materialTypes = new Map<string, number>();
  for (const name of materialTypeNames) {
    const row = await upsertByName(
      () => prisma.materialType.findUnique({ where: { name } }),
      () => prisma.materialType.create({ data: { name, description: name } }),
    );
    materialTypes.set(name, row.id);
  }

  const brands = new Map<string, number>();
  for (const name of brandNames) {
    const row = await upsertByName(
      () => prisma.brand.findUnique({ where: { name } }),
      () => prisma.brand.create({ data: { name } }),
    );
    brands.set(name, row.id);
  }

  const suppliers = new Map<string, number>();
  for (const name of supplierNames) {
    const row = await upsertByName(
      () => prisma.supplier.findUnique({ where: { name } }),
      () => prisma.supplier.create({ data: { name } }),
    );
    suppliers.set(name, row.id);
  }

  const locations = new Map<string, number>();
  for (const name of locationNames) {
    const row = await upsertByName(
      () => prisma.location.findUnique({ where: { name } }),
      () => prisma.location.create({ data: { name } }),
    );
    locations.set(name, row.id);
  }

  const inventoryNumbers = ASSETS.map((asset) => asset.inventoryNumber);
  const existingAssets = await prisma.asset.findMany({
    where: { inventoryNumber: { in: inventoryNumbers } },
    select: { inventoryNumber: true },
  });
  const existingNumbers = new Set(existingAssets.map((a) => a.inventoryNumber));
  const assetsToCreate = ASSETS.filter((a) => !existingNumbers.has(a.inventoryNumber));

  if (assetsToCreate.length === 0) {
    console.log('Les assets existent déjà. Aucune insertion effectuée.');
    return;
  }

  const created = await prisma.$transaction(
    assetsToCreate.map((asset) =>
      prisma.asset.create({
        data: {
          inventoryNumber: asset.inventoryNumber,
          serialNumber: asset.serialNumber,
          model: asset.model,
          categoryId: categories.get(asset.category)!,
          materialTypeId: materialTypes.get(asset.materialType)!,
          brandId: brands.get(asset.brand)!,
          supplierId: suppliers.get(asset.supplier)!,
          locationId: locations.get(asset.location)!,
          entryDate: asset.entryDate,
          status: asset.status,
        },
      }),
    ),
  );

  console.log(`${created.length} asset(s) créé(s).`);
  console.log('Inventory numbers ajoutés :', created.map((a) => a.inventoryNumber));
}

main()
  .catch((error) => {
    console.error('Erreur pendant le seed des assets :', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
