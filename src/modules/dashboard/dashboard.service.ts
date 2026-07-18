import { prisma } from '../../prisma/client';
import { logger } from '../../logger';
import { AssetStatus, Prisma } from '@prisma/client';

const STATUT_LIBELLES: Record<AssetStatus, string> = {
  AFFECTE: 'Affecté',
  EN_STOCK_NON_AFFECTE: 'En stock',
  EN_PRET: 'En prêt',
  EN_REPARATION: 'En réparation',
  EN_SERVICE: 'En service',
  EN_PANNE: 'En panne',
  HORS_SERVICE: 'Hors service',
};

export type StatsGranularity = 'week' | 'month' | 'year';

export interface SimpleData {
  totalMateriels: number;
  enStock: number;
  affectes: number;
  reparationsEnCours: number;
  enPanne: number;
  garantiesExpirees: number;
  aRenouveler: number;
}

export interface RepartitionEtat {
  etat: AssetStatus;
  libelle: string;
  count: number;
}

export interface TopDirectionPannes {
  direction: string;
  count: number;
}

export interface SyntheseEtat {
  etat: AssetStatus;
  libelle: string;
  count: number;
}

export interface MaterielParType {
  type: string;
  count: number;
}

export interface DashboardData {
  simple_data: SimpleData;
  repartition_par_etat: RepartitionEtat[];
  top_directions_pannes: TopDirectionPannes[];
  synthese_par_etat: SyntheseEtat[];
  materiels_par_type: MaterielParType[];
}

export interface MachinesStatsPoint {
  periodStart: Date;
  assetsCreated: number;
  assignmentsCreated: number;
  loansCreated: number;
  loansReturned: number;
  repairsStarted: number;
  repairsFinished: number;
  totalActivity: number;
}

export class DashboardService {
  async getDashboard(): Promise<DashboardData> {
    logger.debug('[DashboardService] Calcul des indicateurs du tableau de bord');

    const renewThreshold = new Date();
    renewThreshold.setFullYear(renewThreshold.getFullYear() - 4);
    const now = new Date();

    const [
      totalMateriels,
      repartitionByStatus,
      reparationsEnCours,
      topDirectionsPannes,
      materielsParMaterialTypeId,
      garantiesExpirees,
      aRenouveler,
    ] =
      await Promise.all([
        prisma.asset.count(),
        prisma.asset.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        prisma.repair.count({ where: { status: 'EN_COURS' } }),
        prisma.incident.groupBy({
          by: ['departmentId'],
          _count: { id: true },
        }),
        prisma.asset.groupBy({
          by: ['materialTypeId'],
          _count: { id: true },
        }),
        prisma.asset.count({
          where: { warrantyEndDate: { lt: now } },
        }),
        prisma.asset.count({
          where: {
            OR: [
              { warrantyEndDate: { lt: now } },
              { entryDate: { lte: renewThreshold } },
            ],
          },
        }),
      ]);

    const departmentIds = topDirectionsPannes.map((row) => row.departmentId);
    const materialTypeIds = materielsParMaterialTypeId.map((row) => row.materialTypeId);

    const [departments, materialTypes] = await Promise.all([
      departmentIds.length > 0
        ? prisma.department.findMany({
            where: { id: { in: departmentIds } },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
      materialTypeIds.length > 0
        ? prisma.materialType.findMany({
            where: { id: { in: materialTypeIds } },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
    ]);

    const departmentNames = new Map(departments.map((d) => [d.id, d.name]));
    const materialTypeNames = new Map(materialTypes.map((t) => [t.id, t.name]));

    const statusCounts = Object.fromEntries(
      repartitionByStatus.map((r) => [r.status, r._count.id]),
    ) as Partial<Record<AssetStatus, number>>;

    const enStock = statusCounts.EN_STOCK_NON_AFFECTE ?? 0;
    const affectes = statusCounts.AFFECTE ?? 0;
    const enPanne = statusCounts.EN_PANNE ?? 0;

    const simple_data: SimpleData = {
      totalMateriels,
      enStock,
      affectes,
      reparationsEnCours,
      enPanne,
      garantiesExpirees,
      aRenouveler,
    };

    const etatsOrdre: AssetStatus[] = [
      'AFFECTE',
      'EN_STOCK_NON_AFFECTE',
      'EN_PRET',
      'EN_REPARATION',
      'EN_SERVICE',
      'EN_PANNE',
      'HORS_SERVICE',
    ];

    const repartition_par_etat: RepartitionEtat[] = etatsOrdre.map((etat) => ({
      etat,
      libelle: STATUT_LIBELLES[etat],
      count: statusCounts[etat] ?? 0,
    }));

    const top_directions_pannes: TopDirectionPannes[] = topDirectionsPannes
      .map((r) => ({
        direction: departmentNames.get(r.departmentId) ?? `Département #${r.departmentId}`,
        count: r._count.id,
      }))
      .sort((a, b) => b.count - a.count);

    const synthese_par_etat: SyntheseEtat[] = etatsOrdre.map((etat) => ({
      etat,
      libelle: STATUT_LIBELLES[etat],
      count: statusCounts[etat] ?? 0,
    }));

    const materiels_par_type: MaterielParType[] = materielsParMaterialTypeId.map((r) => ({
      type: materialTypeNames.get(r.materialTypeId) ?? `Type #${r.materialTypeId}`,
      count: r._count.id,
    }));

    const data: DashboardData = {
      simple_data,
      repartition_par_etat,
      top_directions_pannes,
      synthese_par_etat,
      materiels_par_type,
    };

    logger.debug(
      {
        totalMateriels,
        enStock,
        affectes,
        reparationsEnCours,
      },
      '[DashboardService] Tableau de bord calculé',
    );

    return data;
  }

  async getMachinesStats(granularity: StatsGranularity): Promise<MachinesStatsPoint[]> {
    logger.debug({ granularity }, '[DashboardService] Calcul des statistiques machines');

    type CountRow = { period_start: Date; count: bigint };

    const [
      assetsRows,
      assignmentsRows,
      loansCreatedRows,
      loansReturnedRows,
      repairsStartedRows,
      repairsFinishedRows,
    ] = await Promise.all([
      prisma.$queryRaw<Array<{ period_start: Date; count: bigint }>>(Prisma.sql`
        SELECT
          date_trunc(${granularity}, a."entryDate") AS period_start,
          COUNT(*)::bigint AS count
        FROM "Asset" a
        GROUP BY 1
        ORDER BY 1 ASC
      `),
      prisma.$queryRaw<CountRow[]>(Prisma.sql`
        SELECT
          date_trunc(${granularity}, a."startDate") AS period_start,
          COUNT(*)::bigint AS count
        FROM "Assignment" a
        GROUP BY 1
        ORDER BY 1 ASC
      `),
      prisma.$queryRaw<CountRow[]>(Prisma.sql`
        SELECT
          date_trunc(${granularity}, sl."loanDate") AS period_start,
          COUNT(*)::bigint AS count
        FROM "ScreenLoan" sl
        GROUP BY 1
        ORDER BY 1 ASC
      `),
      prisma.$queryRaw<CountRow[]>(Prisma.sql`
        SELECT
          date_trunc(${granularity}, sl."returnedAt") AS period_start,
          COUNT(*)::bigint AS count
        FROM "ScreenLoan" sl
        WHERE sl."returnedAt" IS NOT NULL
        GROUP BY 1
        ORDER BY 1 ASC
      `),
      prisma.$queryRaw<CountRow[]>(Prisma.sql`
        SELECT
          date_trunc(${granularity}, r."workshopEntryDate") AS period_start,
          COUNT(*)::bigint AS count
        FROM "Repair" r
        GROUP BY 1
        ORDER BY 1 ASC
      `),
      prisma.$queryRaw<CountRow[]>(Prisma.sql`
        SELECT
          date_trunc(${granularity}, r."workshopExitDate") AS period_start,
          COUNT(*)::bigint AS count
        FROM "Repair" r
        WHERE r."workshopExitDate" IS NOT NULL
        GROUP BY 1
        ORDER BY 1 ASC
      `),
    ]);

    const points = new Map<string, Omit<MachinesStatsPoint, 'totalActivity'>>();

    const ensurePoint = (periodStart: Date) => {
      const key = periodStart.toISOString();
      const existing = points.get(key);
      if (existing) return existing;
      const point: Omit<MachinesStatsPoint, 'totalActivity'> = {
        periodStart,
        assetsCreated: 0,
        assignmentsCreated: 0,
        loansCreated: 0,
        loansReturned: 0,
        repairsStarted: 0,
        repairsFinished: 0,
      };
      points.set(key, point);
      return point;
    };

    const applyRows = (
      rows: CountRow[],
      field: keyof Omit<MachinesStatsPoint, 'periodStart' | 'totalActivity'>,
    ) => {
      for (const row of rows) {
        const point = ensurePoint(row.period_start);
        point[field] = Number(row.count);
      }
    };

    applyRows(assetsRows, 'assetsCreated');
    applyRows(assignmentsRows, 'assignmentsCreated');
    applyRows(loansCreatedRows, 'loansCreated');
    applyRows(loansReturnedRows, 'loansReturned');
    applyRows(repairsStartedRows, 'repairsStarted');
    applyRows(repairsFinishedRows, 'repairsFinished');

    const data = Array.from(points.values()).map((point) => {
      const totalActivity =
        point.assetsCreated +
        point.assignmentsCreated +
        point.loansCreated +
        point.loansReturned +
        point.repairsStarted +
        point.repairsFinished;
      return { ...point, totalActivity };
    }).sort(
      (a, b) => a.periodStart.getTime() - b.periodStart.getTime(),
    );

    logger.debug({ points: data.length }, '[DashboardService] Statistiques machines calculées');
    return data;
  }
}
