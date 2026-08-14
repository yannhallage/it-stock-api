import { prisma } from '../../prisma/client';
import {
  AssetStatus,
  HistoryEventType,
  IncidentStatus,
  Prisma,
  RepairStatus,
} from '@prisma/client';
import { HttpError } from '../../errors/http-error';
import { StartRepairDto } from './dto/start-repair.dto';
import { CloseRepairDto } from './dto/close-repair.dto';
import { RepairFilterDto } from './dto/filter-repairs.dto';
import { assetSelect } from '../../prisma/asset-select';

const repairInclude = {
  asset: { select: assetSelect },
  incident: {
    include: {
      department: { select: { id: true, name: true } },
    },
  },
} as const;

export class WorkshopService {
  /**
   * Liste toutes les réparations (avec incident + matériel), y compris TERMINE.
   */
  async listRepairs(_params: RepairFilterDto) {
    const repairs = await prisma.repair.findMany({
      orderBy: { workshopEntryDate: 'desc' },
      include: repairInclude,
    });

    return repairs;
  }

  /**
   * Récupère une réparation par id avec incident et matériel.
   */
  async getRepairById(id: number) {
    if (!Number.isInteger(id) || id < 1) {
      throw new HttpError(
        400,
        "L'identifiant de la réparation doit être un entier strictement positif.",
        'INVALID_REPAIR_ID',
      );
    }

    const repair = await prisma.repair.findUnique({
      where: { id },
      include: repairInclude,
    });

    if (!repair) {
      return null;
    }

    return repair;
  }

  /**
   * Récupère les données nécessaires à l'impression de la fiche d'intervention atelier.
   */
  async getRepairPrintPayload(id: number) {
    if (!Number.isInteger(id) || id < 1) {
      throw new HttpError(
        400,
        "L'identifiant de la réparation doit être un entier strictement positif.",
        'INVALID_REPAIR_ID',
      );
    }

    const repair = await prisma.repair.findUnique({
      where: { id },
      include: repairInclude,
    });

    if (!repair) {
      return null;
    }

    const history = await prisma.historyEvent.findMany({
      where: {
        assetId: repair.assetId,
        type: {
          in: [HistoryEventType.REPAIR_STARTED, HistoryEventType.REPAIR_FINISHED],
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      repair,
      history,
    };
  }

  /**
   * Démarrer une réparation : incident ouvert → réparation EN_COURS, matériel EN_REPARATION.
   */
  async startRepair(data: StartRepairDto) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const incident = await tx.incident.findUnique({
          where: { id: data.incidentId },
          include: { asset: true },
        });

        if (!incident) {
          return null;
        }

        if (incident.status !== IncidentStatus.OUVERT) {
          throw new HttpError(
            400,
            "Seul un incident ouvert peut être envoyé en réparation.",
            'INCIDENT_NOT_OPEN',
          );
        }

        const existingEnCours = await tx.repair.findFirst({
          where: {
            incidentId: data.incidentId,
            status: RepairStatus.EN_COURS,
          },
        });

        if (existingEnCours) {
          throw new HttpError(
            400,
            'Une réparation est déjà en cours pour cet incident.',
            'REPAIR_ALREADY_IN_PROGRESS',
          );
        }

        const repair = await tx.repair.create({
          data: {
            assetId: incident.assetId,
            incidentId: data.incidentId,
            technicianName: data.technicianName ?? null,
            workshopEntryDate: data.workshopEntryDate,
            action: data.action ?? null,
            cost: data.cost != null ? new Prisma.Decimal(data.cost) : null,
            status: RepairStatus.EN_COURS,
          },
        });

        const previousAssetStatus = incident.asset.status;
        await tx.asset.update({
          where: { id: incident.assetId },
          data: { status: AssetStatus.EN_REPARATION },
        });

        await tx.historyEvent.create({
          data: {
            assetId: incident.assetId,
            type: HistoryEventType.REPAIR_STARTED,
            payload: {
              repairId: repair.id,
              incidentId: incident.id,
              workshopEntryDate: repair.workshopEntryDate.toISOString(),
              technicianName: repair.technicianName,
              action: repair.action,
              cost: repair.cost != null ? Number(repair.cost) : null,
              previousAssetStatus,
              newAssetStatus: AssetStatus.EN_REPARATION,
            },
          },
        });

        return { repair, incident, assetId: incident.assetId };
      });

      if (!result) {
        return null;
      }

      const repairWithRelations = await prisma.repair.findUnique({
        where: { id: result.repair.id },
        include: repairInclude,
      });

      return repairWithRelations;
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          400,
          "Les données fournies pour démarrer la réparation sont invalides.",
          'REPAIR_START_VALIDATION_ERROR',
        );
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new HttpError(404, 'Incident non trouvé.', 'INCIDENT_NOT_FOUND');
        }
        throw new HttpError(
          400,
          "Erreur lors du démarrage de la réparation.",
          'REPAIR_START_ERROR',
        );
      }
      throw error;
    }
  }

  /**
   * Clôturer une réparation : En service (matériel → EN_SERVICE) ou Hors service (→ HORS_SERVICE) ;
   * incident → CLOS, réparation → TERMINE.
   */
  async closeRepair(repairId: number, data: CloseRepairDto) {
    if (!Number.isInteger(repairId) || repairId < 1) {
      throw new HttpError(
        400,
        "L'identifiant de la réparation doit être un entier strictement positif.",
        'INVALID_REPAIR_ID',
      );
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const repair = await tx.repair.findUnique({
          where: { id: repairId },
          include: { incident: { include: { asset: true } }, asset: true },
        });

        if (!repair) {
          return null;
        }

        if (repair.status === RepairStatus.TERMINE) {
          throw new HttpError(
            400,
            'Cette réparation est déjà clôturée.',
            'REPAIR_ALREADY_CLOSED',
          );
        }

        const incident = repair.incident;
        const assetId = repair.assetId;
        const previousAssetStatus = repair.asset.status;
        const workshopExitDate = new Date();

        await tx.repair.update({
          where: { id: repairId },
          data: {
            status: RepairStatus.TERMINE,
            outcome: data.outcome,
            workshopExitDate,
          },
        });

        if (incident) {
          await tx.incident.update({
            where: { id: incident.id },
            data: { status: IncidentStatus.CLOS },
          });
        }

        await tx.asset.update({
          where: { id: assetId },
          data: { status: data.outcome },
        });

        await tx.historyEvent.create({
          data: {
            assetId,
            type: HistoryEventType.REPAIR_FINISHED,
            payload: {
              repairId,
              incidentId: incident?.id ?? null,
              outcome: data.outcome,
              workshopExitDate: workshopExitDate.toISOString(),
              previousAssetStatus,
              newAssetStatus: data.outcome,
            },
          },
        });

        return { repairId, incidentId: incident?.id ?? null, assetId, outcome: data.outcome };
      });

      if (!result) {
        return null;
      }

      const updated = await prisma.repair.findUnique({
        where: { id: repairId },
        include: repairInclude,
      });

      return updated;
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          400,
          "Les données fournies pour clôturer la réparation sont invalides.",
          'REPAIR_CLOSE_VALIDATION_ERROR',
        );
      }
      throw error;
    }
  }
}
