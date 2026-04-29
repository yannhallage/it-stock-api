import 'dotenv/config';
import { AssetStatus, HistoryEventType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type AssignmentSeed = {
  inventoryNumber: string;
  department: string;
  user: {
    names: string[];
    poste: string;
    service: string;
  };
  startDate: Date;
  endDate: Date | null;
};

const ASSIGNMENTS: AssignmentSeed[] = [
  {
    inventoryNumber: 'INV-2026-0001',
    department: 'Direction des Systemes d Information',
    user: { names: ['Awa', 'Kouassi'], poste: 'Administrateur Systeme', service: 'DSI' },
    startDate: new Date('2026-02-03T08:30:00.000Z'),
    endDate: null,
  },
  {
    inventoryNumber: 'INV-2026-0002',
    department: 'Direction Financiere',
    user: { names: ['Jean', 'Yao'], poste: 'Comptable', service: 'Finance' },
    startDate: new Date('2026-02-04T09:00:00.000Z'),
    endDate: null,
  },
  {
    inventoryNumber: 'INV-2026-0003',
    department: 'Ressources Humaines',
    user: { names: ['Ruth', 'Amani'], poste: 'Charge RH', service: 'RH' },
    startDate: new Date('2026-02-05T09:15:00.000Z'),
    endDate: null,
  },
  {
    inventoryNumber: 'INV-2026-0004',
    department: 'Secretariat General',
    user: { names: ['Eric', 'Konan'], poste: 'Assistant Administratif', service: 'SG' },
    startDate: new Date('2026-02-06T10:00:00.000Z'),
    endDate: null,
  },
  {
    inventoryNumber: 'INV-2026-0005',
    department: 'Direction de la Communication',
    user: { names: ['Marie', 'N Guessan'], poste: 'Charge Communication', service: 'Com' },
    startDate: new Date('2026-02-10T11:00:00.000Z'),
    endDate: null,
  },
  {
    inventoryNumber: 'INV-2026-0010',
    department: 'Audit Interne',
    user: { names: ['Idriss', 'Bamba'], poste: 'Auditeur', service: 'Audit' },
    startDate: new Date('2026-01-20T08:00:00.000Z'),
    endDate: new Date('2026-03-15T16:30:00.000Z'),
  },
  {
    inventoryNumber: 'INV-2026-0012',
    department: 'Direction des Affaires Juridiques',
    user: { names: ['Sonia', 'Diarra'], poste: 'Juriste', service: 'Juridique' },
    startDate: new Date('2026-01-18T08:30:00.000Z'),
    endDate: new Date('2026-02-28T17:00:00.000Z'),
  },
  {
    inventoryNumber: 'INV-2026-0016',
    department: 'Direction des Marches Publics',
    user: { names: ['Nadia', 'Koffi'], poste: 'Gestionnaire Marches', service: 'DMP' },
    startDate: new Date('2026-02-12T07:45:00.000Z'),
    endDate: null,
  },
];

async function main() {
  const inventoryNumbers = ASSIGNMENTS.map((assignment) => assignment.inventoryNumber);

  const assets = await prisma.asset.findMany({
    where: {
      inventoryNumber: {
        in: inventoryNumbers,
      },
    },
    select: {
      id: true,
      inventoryNumber: true,
    },
  });

  const assetByInventory = new Map(assets.map((asset) => [asset.inventoryNumber, asset]));
  const missingAssets = inventoryNumbers.filter((number) => !assetByInventory.has(number));

  if (missingAssets.length > 0) {
    console.warn(
      `Assets introuvables pour certaines affectations (${missingAssets.length}) :`,
      missingAssets,
    );
  }

  let createdCount = 0;
  const createdAssignmentIds: number[] = [];
  const touchedAssetIds = new Set<number>();

  for (const assignment of ASSIGNMENTS) {
    const asset = assetByInventory.get(assignment.inventoryNumber);
    if (!asset) continue;

    touchedAssetIds.add(asset.id);

    const existing = await prisma.assignment.findFirst({
      where: {
        assetId: asset.id,
        department: assignment.department,
        startDate: assignment.startDate,
      },
      select: { id: true },
    });

    if (existing) {
      continue;
    }

    const created = await prisma.assignment.create({
      data: {
        assetId: asset.id,
        department: assignment.department,
        user: assignment.user,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
      },
      select: { id: true },
    });

    // Historique : creation de l'affectation
    await prisma.historyEvent.create({
      data: {
        assetId: asset.id,
        type: HistoryEventType.ASSIGNMENT_CREATED,
        payload: {
          assignmentId: created.id,
          department: assignment.department,
          user: assignment.user,
          startDate: assignment.startDate.toISOString(),
          endDate: assignment.endDate?.toISOString() ?? null,
        },
      },
    });

    createdCount += 1;
    createdAssignmentIds.push(created.id);
  }

  if (touchedAssetIds.size > 0) {
    const touchedIds = Array.from(touchedAssetIds);
    const activeAssignments = await prisma.assignment.findMany({
      where: {
        assetId: { in: touchedIds },
        endDate: null,
      },
      select: { assetId: true },
    });

    const activeAssetIds = new Set(activeAssignments.map((item) => item.assetId));
    const freeAssetIds = touchedIds.filter((id) => !activeAssetIds.has(id));

    if (activeAssetIds.size > 0) {
      await prisma.asset.updateMany({
        where: {
          id: { in: Array.from(activeAssetIds) },
        },
        data: {
          status: AssetStatus.AFFECTE,
        },
      });
    }

    if (freeAssetIds.length > 0) {
      await prisma.asset.updateMany({
        where: {
          id: { in: freeAssetIds },
        },
        data: {
          status: AssetStatus.EN_STOCK_NON_AFFECTE,
        },
      });
    }
  }

  if (createdCount === 0) {
    console.log('Les affectations seed existent deja. Aucune insertion effectuee.');
    return;
  }

  console.log(`${createdCount} affectation(s) creee(s).`);
  console.log('IDs ajoutes :', createdAssignmentIds);
}

main()
  .catch((error) => {
    console.error('Erreur pendant le seed des affectations :', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
