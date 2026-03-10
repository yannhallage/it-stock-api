import { prisma } from '../../prisma/client';
import { logger } from '../../logger';
import { AssetStatus } from '@prisma/client';

const STATUT_LIBELLES: Record<AssetStatus, string> = {
  AFFECTE: 'Affecté',
  EN_STOCK: 'En stock',
  EN_REPARATION: 'En réparation',
  EN_SERVICE: 'En service',
  EN_PANNE: 'En panne',
  HORS_SERVICE: 'Hors service',
};

export interface SimpleData {
  totalMateriels: number;
  enStock: number;
  affectes: number;
  reparationsEnCours: number;
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

export class DashboardService {
  async getDashboard(): Promise<DashboardData> {
    logger.debug('[DashboardService] Calcul des indicateurs du tableau de bord');

    const [totalMateriels, repartitionByStatus, reparationsEnCours, topDirectionsPannes, materielsParType] =
      await Promise.all([
        prisma.asset.count(),
        prisma.asset.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        prisma.repair.count({ where: { status: 'EN_COURS' } }),
        prisma.incident.groupBy({
          by: ['department'],
          _count: { id: true },
        }),
        prisma.asset.groupBy({
          by: ['type'],
          _count: { id: true },
        }),
      ]);

    const statusCounts = Object.fromEntries(
      repartitionByStatus.map((r) => [r.status, r._count.id]),
    ) as Partial<Record<AssetStatus, number>>;

    const enStock = statusCounts.EN_STOCK ?? 0;
    const affectes = statusCounts.AFFECTE ?? 0;

    const simple_data: SimpleData = {
      totalMateriels,
      enStock,
      affectes,
      reparationsEnCours,
    };

    const etatsOrdre: AssetStatus[] = [
      'AFFECTE',
      'EN_STOCK',
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
        direction: r.department,
        count: r._count.id,
      }))
      .sort((a, b) => b.count - a.count);

    const synthese_par_etat: SyntheseEtat[] = etatsOrdre.map((etat) => ({
      etat,
      libelle: STATUT_LIBELLES[etat],
      count: statusCounts[etat] ?? 0,
    }));

    const materiels_par_type: MaterielParType[] = materielsParType.map((r) => ({
      type: r.type,
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
}
