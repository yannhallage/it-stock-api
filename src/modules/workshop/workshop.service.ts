import { prisma } from '../../prisma/client';
import { logger } from '../../logger';
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

export class WorkshopService {
  /**
   * Liste les réparations (avec incident + matériel), optionnellement filtrées par statut.
   */
  async listRepairs(params: RepairFilterDto) {
    const { status } = params;

    const where: Prisma.RepairWhereInput = {};
    if (status != null) {
      where.status = status;
    }

    logger.debug(
      { status },
      '[WorkshopService] Listing des réparations',
    );

    const repairs = await prisma.repair.findMany({
      where,
      orderBy: { workshopEntryDate: 'desc' },
      include: {
        incident: {
          include: {
            asset: {
              select: {
                id: true,
                inventoryNumber: true,
                type: true,
                brand: true,
                model: true,
                status: true,
              },
            },
          },
        },
      },
    });

    logger.debug(
      { count: repairs.length },
      '[WorkshopService] Listing des réparations terminé',
    );

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

    logger.debug({ id }, '[WorkshopService] Récupération réparation par id');

    const repair = await prisma.repair.findUnique({
      where: { id },
      include: {
        incident: {
          include: {
            asset: {
              select: {
                id: true,
                inventoryNumber: true,
                type: true,
                brand: true,
                model: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!repair) {
      logger.warn({ id }, '[WorkshopService] Réparation non trouvée');
      return null;
    }

    return repair;
  }

  /**
   * Démarrer une réparation : incident ouvert → réparation EN_COURS, matériel EN_REPARATION.
   */
  async startRepair(data: StartRepairDto) {
    logger.info(
      { incidentId: data.incidentId, workshopEntryDate: data.workshopEntryDate },
      '[WorkshopService] Démarrage d\'une réparation demandé',
    );

    try {
      const result = await prisma.$transaction(async (tx) => {
        const incident = await tx.incident.findUnique({
          where: { id: data.incidentId },
          include: { asset: true },
        });

        if (!incident) {
          logger.warn(
            { incidentId: data.incidentId },
            '[WorkshopService] Incident non trouvé pour démarrage réparation',
          );
          return null;
        }

        if (incident.status !== IncidentStatus.OUVERT) {
          logger.warn(
            { incidentId: data.incidentId, status: incident.status },
            '[WorkshopService] L\'incident n\'est pas ouvert',
          );
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
          logger.warn(
            { incidentId: data.incidentId, repairId: existingEnCours.id },
            '[WorkshopService] Une réparation est déjà en cours pour cet incident',
          );
          throw new HttpError(
            400,
            'Une réparation est déjà en cours pour cet incident.',
            'REPAIR_ALREADY_IN_PROGRESS',
          );
        }

        const repair = await tx.repair.create({
          data: {
            incidentId: data.incidentId,
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

      logger.info(
        { repairId: result.repair.id, incidentId: data.incidentId, assetId: result.assetId },
        '[WorkshopService] Réparation démarrée avec succès',
      );

      const repairWithRelations = await prisma.repair.findUnique({
        where: { id: result.repair.id },
        include: {
          incident: {
            include: {
              asset: {
                select: {
                  id: true,
                  inventoryNumber: true,
                  type: true,
                  brand: true,
                  model: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      return repairWithRelations;
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientValidationError) {
        logger.warn(
          { incidentId: data.incidentId, error },
          '[WorkshopService] Données invalides lors du démarrage de la réparation',
        );
        throw new HttpError(
          400,
          "Les données fournies pour démarrer la réparation sont invalides.",
          'REPAIR_START_VALIDATION_ERROR',
        );
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          logger.warn(
            { incidentId: data.incidentId, error },
            '[WorkshopService] Incident inexistant (FK)',
          );
          throw new HttpError(404, 'Incident non trouvé.', 'INCIDENT_NOT_FOUND');
        }
        logger.warn(
          { incidentId: data.incidentId, code: error.code, error },
          '[WorkshopService] Erreur Prisma connue',
        );
        throw new HttpError(
          400,
          "Erreur lors du démarrage de la réparation.",
          'REPAIR_START_ERROR',
        );
      }
      logger.error(
        { error, incidentId: data.incidentId },
        '[WorkshopService] Erreur inattendue lors du démarrage de la réparation',
      );
      throw error;
    }
  }

  /**
   * Clôturer une réparation : En service (matériel → EN_SERVICE) ou Hors service (→ HORS_SERVICE) ;
   * incident → CLOS, réparation → TERMINE.
   */
  async closeRepair(repairId: number, data: CloseRepairDto) {
    logger.info(
      { repairId, outcome: data.outcome },
      '[WorkshopService] Clôture d\'une réparation demandée',
    );

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
          include: { incident: { include: { asset: true } } },
        });

        if (!repair) {
          logger.warn({ repairId }, '[WorkshopService] Réparation non trouvée pour clôture');
          return null;
        }

        if (repair.status === RepairStatus.TERMINE) {
          logger.warn(
            { repairId },
            '[WorkshopService] Réparation déjà clôturée',
          );
          throw new HttpError(
            400,
            'Cette réparation est déjà clôturée.',
            'REPAIR_ALREADY_CLOSED',
          );
        }

        const incident = repair.incident;
        const assetId = incident.assetId;
        const previousAssetStatus = incident.asset.status;

        await tx.repair.update({
          where: { id: repairId },
          data: {
            status: RepairStatus.TERMINE,
            outcome: data.outcome,
          },
        });

        await tx.incident.update({
          where: { id: incident.id },
          data: { status: IncidentStatus.CLOS },
        });

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
              incidentId: incident.id,
              outcome: data.outcome,
              previousAssetStatus,
              newAssetStatus: data.outcome,
            },
          },
        });

        return { repairId, incidentId: incident.id, assetId, outcome: data.outcome };
      });

      if (!result) {
        return null;
      }

      logger.info(
        {
          repairId: result.repairId,
          incidentId: result.incidentId,
          assetId: result.assetId,
          outcome: result.outcome,
        },
        '[WorkshopService] Réparation clôturée avec succès',
      );

      const updated = await prisma.repair.findUnique({
        where: { id: repairId },
        include: {
          incident: {
            include: {
              asset: {
                select: {
                  id: true,
                  inventoryNumber: true,
                  type: true,
                  brand: true,
                  model: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      return updated;
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientValidationError) {
        logger.warn(
          { repairId, error },
          '[WorkshopService] Données invalides lors de la clôture de la réparation',
        );
        throw new HttpError(
          400,
          "Les données fournies pour clôturer la réparation sont invalides.",
          'REPAIR_CLOSE_VALIDATION_ERROR',
        );
      }
      logger.error(
        { error, repairId },
        '[WorkshopService] Erreur inattendue lors de la clôture de la réparation',
      );
      throw error;
    }
  }
}
