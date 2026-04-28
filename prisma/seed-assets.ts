import 'dotenv/config';
import { AssetStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type AssetSeed = {
  inventoryNumber: string;
  serial_number: string;
  type: string;
  brand: string;
  model: string;
  entryDate: Date;
  supplier: string;
  status: AssetStatus;
};

const ASSETS: AssetSeed[] = [
  { inventoryNumber: 'INV-2026-0001', serial_number: 'SN-DL-001', type: 'Laptop', brand: 'Dell', model: 'Latitude 5420', entryDate: new Date('2026-01-05'), supplier: 'TechDistrib CI', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0002', serial_number: 'SN-HP-002', type: 'Laptop', brand: 'HP', model: 'ProBook 450 G9', entryDate: new Date('2026-01-06'), supplier: 'Ivoire Informatique Services', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0003', serial_number: 'SN-LN-003', type: 'Laptop', brand: 'Lenovo', model: 'ThinkPad E14', entryDate: new Date('2026-01-07'), supplier: 'Global Hardware Afrique', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0004', serial_number: 'SN-AS-004', type: 'Desktop', brand: 'Asus', model: 'ExpertCenter D7', entryDate: new Date('2026-01-08'), supplier: 'Digital Pro Supply', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0005', serial_number: 'SN-AP-005', type: 'Desktop', brand: 'Acer', model: 'Veriton M4', entryDate: new Date('2026-01-09'), supplier: 'NeoTech Fournitures', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0006', serial_number: 'SN-CT-006', type: 'Printer', brand: 'Canon', model: 'i-SENSYS LBP226dw', entryDate: new Date('2026-01-10'), supplier: 'Centrale IT Distribution', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0007', serial_number: 'SN-EP-007', type: 'Printer', brand: 'Epson', model: 'EcoTank L6490', entryDate: new Date('2026-01-11'), supplier: 'NetPlus Equipements', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0008', serial_number: 'SN-BR-008', type: 'Scanner', brand: 'Brother', model: 'ADS-4900W', entryDate: new Date('2026-01-12'), supplier: 'Sigma Solutions Pro', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0009', serial_number: 'SN-CS-009', type: 'Monitor', brand: 'Samsung', model: 'S24R350', entryDate: new Date('2026-01-13'), supplier: 'Afrique Data Fournisseur', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0010', serial_number: 'SN-CL-010', type: 'Monitor', brand: 'LG', model: '24MP400', entryDate: new Date('2026-01-14'), supplier: 'Elite Computer Market', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0011', serial_number: 'SN-DA-011', type: 'Projector', brand: 'BenQ', model: 'MW550', entryDate: new Date('2026-01-15'), supplier: 'Orion Tech Trade', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0012', serial_number: 'SN-DV-012', type: 'Projector', brand: 'ViewSonic', model: 'PA503S', entryDate: new Date('2026-01-16'), supplier: 'Nova Materiel Bureau', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0013', serial_number: 'SN-HK-013', type: 'Keyboard', brand: 'Logitech', model: 'K120', entryDate: new Date('2026-01-17'), supplier: 'Phoenix Equipement IT', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0014', serial_number: 'SN-HM-014', type: 'Mouse', brand: 'Logitech', model: 'M185', entryDate: new Date('2026-01-18'), supplier: 'Prestige Info Supply', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0015', serial_number: 'SN-NR-015', type: 'Router', brand: 'MikroTik', model: 'hAP ac3', entryDate: new Date('2026-01-19'), supplier: 'Urban Digital Hub', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0016', serial_number: 'SN-NS-016', type: 'Switch', brand: 'Cisco', model: 'CBS250-24T-4G', entryDate: new Date('2026-01-20'), supplier: 'Smart Office Providers', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0017', serial_number: 'SN-PT-017', type: 'UPS', brand: 'APC', model: 'BVX1200LI', entryDate: new Date('2026-01-21'), supplier: 'West Africa IT Parts', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0018', serial_number: 'SN-QR-018', type: 'NAS', brand: 'Synology', model: 'DS223', entryDate: new Date('2026-01-22'), supplier: 'Prime Network Store', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0019', serial_number: 'SN-RS-019', type: 'Tablet', brand: 'Samsung', model: 'Galaxy Tab A9', entryDate: new Date('2026-01-23'), supplier: 'Hexa Tech Supplies', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0020', serial_number: 'SN-ST-020', type: 'Smartphone', brand: 'Xiaomi', model: 'Redmi Note 13', entryDate: new Date('2026-01-24'), supplier: 'Zenith Distribution Group', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0021', serial_number: 'SN-TV-021', type: 'Server', brand: 'Dell', model: 'PowerEdge T150', entryDate: new Date('2026-01-25'), supplier: 'Proxima Informatique', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0022', serial_number: 'SN-UV-022', type: 'Server', brand: 'HP', model: 'ProLiant ML30 Gen10', entryDate: new Date('2026-01-26'), supplier: 'Omni Bureau Equipements', status: AssetStatus.EN_STOCK },
  { inventoryNumber: 'INV-2026-0023', serial_number: 'SN-WX-023', type: 'Webcam', brand: 'Logitech', model: 'C920', entryDate: new Date('2026-01-27'), supplier: 'Delta Tech Logistics', status: AssetStatus.EN_STOCK },
];

async function main() {
  const inventoryNumbers = ASSETS.map((asset) => asset.inventoryNumber);

  const existingAssets = await prisma.asset.findMany({
    where: {
      inventoryNumber: {
        in: inventoryNumbers,
      },
    },
    select: {
      inventoryNumber: true,
    },
  });

  const existingNumbers = new Set(existingAssets.map((asset) => asset.inventoryNumber));
  const assetsToCreate = ASSETS.filter((asset) => !existingNumbers.has(asset.inventoryNumber));

  if (assetsToCreate.length === 0) {
    console.log('Les 23 assets existent déjà. Aucune insertion effectuée.');
    return;
  }

  const created = await prisma.$transaction(
    assetsToCreate.map((asset) =>
      prisma.asset.create({
        data: asset,
      }),
    ),
  );

  console.log(`${created.length} asset(s) créé(s).`);
  console.log('Inventory numbers ajoutés :', created.map((asset) => asset.inventoryNumber));
}

main()
  .catch((error) => {
    console.error('Erreur pendant le seed des assets :', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
