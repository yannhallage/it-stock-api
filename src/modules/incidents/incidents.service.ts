import { prisma } from '../../prisma/client';
import { logger } from '../../logger';
import { AssetStatus, HistoryEventType, IncidentStatus, Prisma } from '@prisma/client';
import { HttpError } from '../../errors/http-error';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentFilterDto } from './dto/filter-incidents.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';

export class IncidentsService {
  async listIncidents(params: IncidentFilterDto) {
    const { assetId, status } = params;

    const where: Prisma.IncidentWhereInput = {};

    if (typeof assetId === 'number') {
      where.assetId = assetId;
    }

    if (status != null) {
      where.status = status;
    }

    logger.debug(
      { assetId, status },
      '[IncidentsService] Listing des incidents',
    );

    const incidents = await prisma.incident.findMany({
      where,
      orderBy: { reportedAt: 'desc' },
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
    });

    logger.debug(
      { count: incidents.length },
      '[IncidentsService] Listing des incidents terminé',
    );

    return incidents;
  }

  async getById(id: number) {
    if (!Number.isInteger(id) || id < 1) {
      throw new HttpError(
        400,
        "L'identifiant de l'incident doit être un entier strictement positif.",
        'INVALID_INCIDENT_ID',
      );
    }

    const incident = await prisma.incident.findUnique({
      where: { id },
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
    });

    if (!incident) {
      logger.warn({ id }, '[IncidentsService] Incident non trouvé');
      return null;
    }

    return incident;
  }

  async createForAsset(assetId: number, data: CreateIncidentDto) {
    logger.info(
      { assetId, department: data.department },
      '[IncidentsService] Création d’un incident demandée',
    );

    if (!Number.isInteger(assetId) || assetId < 1) {
      throw new HttpError(
        400,
        "L'identifiant du matériel doit être un entier strictement positif.",
        'INVALID_ASSET_ID',
      );
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const asset = await tx.asset.findUnique({
          where: { id: assetId },
        });

        if (!asset) {
          logger.warn({ assetId }, '[IncidentsService] Matériel non trouvé pour incident');
          return null;
        }

        const incident = await tx.incident.create({
          data: {
            assetId,
            description: data.description,
            reportedAt: data.reportedAt,
            department: data.department,
            status: IncidentStatus.OUVERT,
          },
        });

        const previousStatus = asset.status;
        const newStatus = AssetStatus.EN_PANNE;

        const updatedAsset = await tx.asset.update({
          where: { id: assetId },
          data: { status: newStatus },
        });

        // Historique : incident signalé
        const eventIncident = await tx.historyEvent.create({
          data: {
            assetId,
            type: HistoryEventType.INCIDENT_REPORTED,
            payload: {
              incidentId: incident.id,
              description: incident.description,
              reportedAt: incident.reportedAt.toISOString(),
              department: incident.department,
              status: incident.status,
            },
          },
        });

        const historyEvents = [eventIncident];

        // Historique : changement de statut du matériel si nécessaire
        if (previousStatus !== updatedAsset.status) {
          const eventStatus = await tx.historyEvent.create({
            data: {
              assetId,
              type: HistoryEventType.STATUS_CHANGED,
              payload: {
                from: previousStatus,
                to: updatedAsset.status,
                reason: 'incident_reported',
                incidentId: incident.id,
              },
            },
          });
          historyEvents.push(eventStatus);
        }

        return { incident, historyEvents };
      });

      if (!result) {
        return null;
      }

      const { incident, historyEvents } = result;

      logger.info(
        { incidentId: incident.id, assetId },
        '[IncidentsService] Incident créé avec succès',
      );

      return { incident, historyEvents };
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        logger.warn(
          { assetId, error },
          '[IncidentsService] Données invalides lors de la création de l’incident',
        );
        throw new HttpError(
          400,
          "Les données fournies pour créer l'incident sont invalides.",
          'INCIDENT_VALIDATION_ERROR',
        );
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          logger.warn({ assetId, error }, '[IncidentsService] Matériel inexistant (FK)');
          throw new HttpError(
            404,
            'Matériel non trouvé.',
            'ASSET_NOT_FOUND',
          );
        }
        logger.warn({ assetId, code: error.code, error }, '[IncidentsService] Erreur Prisma connue');
        throw new HttpError(
          400,
          "Erreur lors de la création de l'incident.",
          'INCIDENT_CREATE_ERROR',
        );
      }

      if (error instanceof HttpError) {
        throw error;
      }

      logger.error(
        { error, assetId },
        '[IncidentsService] Erreur inattendue lors de la création de l’incident',
      );
      throw error;
    }
  }

  async updateStatus(id: number, data: UpdateIncidentDto) {
    logger.info(
      { id, status: data.status },
      '[IncidentsService] Mise à jour du statut d’un incident demandée',
    );

    if (!Number.isInteger(id) || id < 1) {
      throw new HttpError(
        400,
        "L'identifiant de l'incident doit être un entier strictement positif.",
        'INVALID_INCIDENT_ID',
      );
    }

    try {
      const incident = await prisma.incident.findUnique({
        where: { id },
        include: { asset: true },
      });

      if (!incident) {
        logger.warn({ id }, '[IncidentsService] Incident non trouvé pour mise à jour');
        return null;
      }

      if (incident.status === data.status) {
        throw new HttpError(
          400,
          `L'incident a déjà le statut "${data.status}".`,
          'INCIDENT_STATUS_UNCHANGED',
        );
      }

      const updated = await prisma.incident.update({
        where: { id },
        data: { status: data.status },
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
      });

      logger.info(
        { incidentId: id, newStatus: data.status },
        '[IncidentsService] Statut de l’incident mis à jour avec succès',
      );

      return updated;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        logger.warn(
          { id, error },
          '[IncidentsService] Données invalides pour la mise à jour du statut',
        );
        throw new HttpError(
          400,
          "Les données fournies pour mettre à jour l'incident sont invalides.",
          'INCIDENT_UPDATE_VALIDATION_ERROR',
        );
      }

      if (error instanceof HttpError) {
        throw error;
      }

      logger.error(
        { error, id },
        '[IncidentsService] Erreur inattendue lors de la mise à jour du statut',
      );
      throw error;
    }
  }
}
