import 'dotenv/config';
import { AssetStatus, HistoryEventType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type AssignmentSeed = {
  inventoryNumber: string;
  department: string;
  employeeEmail: string;
  firstName: string;
  lastName: string;
  startDate: Date;
  endDate: Date | null;
  note?: string;
};

const ASSIGNMENTS: AssignmentSeed[] = [
  {
    inventoryNumber: 'INV-2026-0001',
    department: 'Direction des Systemes d Information',
    employeeEmail: 'awa.kouassi@assnat.ci',
    firstName: 'Awa',
    lastName: 'Kouassi',
    startDate: new Date('2026-02-03T08:30:00.000Z'),
    endDate: null,
  },
  {
    inventoryNumber: 'INV-2026-0002',
    department: 'Direction Financiere',
    employeeEmail: 'jean.yao@assnat.ci',
    firstName: 'Jean',
    lastName: 'Yao',
    startDate: new Date('2026-02-04T09:00:00.000Z'),
    endDate: null,
  },
  {
    inventoryNumber: 'INV-2026-0003',
    department: 'Ressources Humaines',
    employeeEmail: 'ruth.amani@assnat.ci',
    firstName: 'Ruth',
    lastName: 'Amani',
    startDate: new Date('2026-02-05T09:15:00.000Z'),
    endDate: null,
  },
  {
    inventoryNumber: 'INV-2026-0004',
    department: 'Secretariat General',
    employeeEmail: 'eric.konan@assnat.ci',
    firstName: 'Eric',
    lastName: 'Konan',
    startDate: new Date('2026-02-06T10:00:00.000Z'),
    endDate: null,
  },
  {
    inventoryNumber: 'INV-2026-0005',
    department: 'Direction de la Communication',
    employeeEmail: 'marie.nguessan@assnat.ci',
    firstName: 'Marie',
    lastName: "N'Guessan",
    startDate: new Date('2026-02-10T11:00:00.000Z'),
    endDate: null,
  },
  {
    inventoryNumber: 'INV-2026-0010',
    department: 'Audit Interne',
    employeeEmail: 'idriss.bamba@assnat.ci',
    firstName: 'Idriss',
    lastName: 'Bamba',
    startDate: new Date('2026-01-20T08:00:00.000Z'),
    endDate: new Date('2026-03-15T16:30:00.000Z'),
  },
  {
    inventoryNumber: 'INV-2026-0012',
    department: 'Direction des Affaires Juridiques',
    employeeEmail: 'sonia.diarra@assnat.ci',
    firstName: 'Sonia',
    lastName: 'Diarra',
    startDate: new Date('2026-01-18T08:30:00.000Z'),
    endDate: new Date('2026-02-28T17:00:00.000Z'),
  },
  {
    inventoryNumber: 'INV-2026-0016',
    department: 'Direction des Marches Publics',
    employeeEmail: 'nadia.koffi@assnat.ci',
    firstName: 'Nadia',
    lastName: 'Koffi',
    startDate: new Date('2026-02-12T07:45:00.000Z'),
    endDate: null,
  },
];

async function main() {
  const departmentNames = [...new Set(ASSIGNMENTS.map((a) => a.department))];
  const departments = new Map<string, number>();

  for (const name of departmentNames) {
    const dept = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    departments.set(name, dept.id);
  }

  const employees = new Map<string, string>();
  for (const assignment of ASSIGNMENTS) {
    if (employees.has(assignment.employeeEmail)) continue;

    const existing = await prisma.employee.findUnique({
      where: { email: assignment.employeeEmail },
    });

    if (existing) {
      const updated = await prisma.employee.update({
        where: { id: existing.id },
        data: {
          firstName: assignment.firstName,
          lastName: assignment.lastName,
          deletedAt: null,
        },
      });
      employees.set(assignment.employeeEmail, updated.id);
      continue;
    }

    const employee = await prisma.employee.create({
      data: {
        email: assignment.employeeEmail,
        firstName: assignment.firstName,
        lastName: assignment.lastName,
      },
    });
    employees.set(assignment.employeeEmail, employee.id);
  }

  const inventoryNumbers = ASSIGNMENTS.map((a) => a.inventoryNumber);
  const assets = await prisma.asset.findMany({
    where: { inventoryNumber: { in: inventoryNumbers } },
    select: { id: true, inventoryNumber: true },
  });
  const assetByInventory = new Map(assets.map((a) => [a.inventoryNumber, a]));

  let createdCount = 0;
  const createdAssignmentIds: number[] = [];
  const touchedAssetIds = new Set<number>();

  for (const assignment of ASSIGNMENTS) {
    const asset = assetByInventory.get(assignment.inventoryNumber);
    if (!asset) continue;

    touchedAssetIds.add(asset.id);
    const employeeId = employees.get(assignment.employeeEmail)!;
    const departmentId = departments.get(assignment.department)!;

    const existing = await prisma.assignment.findFirst({
      where: {
        assetId: asset.id,
        employeeId,
        departmentId,
        startDate: assignment.startDate,
      },
      select: { id: true },
    });

    if (existing) continue;

    const created = await prisma.assignment.create({
      data: {
        assetId: asset.id,
        employeeId,
        departmentId,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        note: assignment.note,
      },
      select: { id: true },
    });

    await prisma.historyEvent.create({
      data: {
        assetId: asset.id,
        type: HistoryEventType.ASSIGNMENT_CREATED,
        payload: {
          assignmentId: created.id,
          departmentId,
          employeeId,
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
      where: { assetId: { in: touchedIds }, endDate: null },
      select: { assetId: true },
    });
    const activeAssetIds = new Set(activeAssignments.map((item) => item.assetId));
    const freeAssetIds = touchedIds.filter((id) => !activeAssetIds.has(id));

    if (activeAssetIds.size > 0) {
      await prisma.asset.updateMany({
        where: { id: { in: Array.from(activeAssetIds) } },
        data: { status: AssetStatus.AFFECTE },
      });
    }

    if (freeAssetIds.length > 0) {
      await prisma.asset.updateMany({
        where: { id: { in: freeAssetIds } },
        data: { status: AssetStatus.EN_STOCK_NON_AFFECTE },
      });
    }
  }

  if (createdCount === 0) {
    console.log('Les affectations seed existent déjà. Aucune insertion effectuée.');
    return;
  }

  console.log(`${createdCount} affectation(s) créée(s).`);
  console.log('IDs ajoutés :', createdAssignmentIds);
}

main()
  .catch((error) => {
    console.error('Erreur pendant le seed des affectations :', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
