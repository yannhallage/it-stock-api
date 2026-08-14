import { prisma } from '../../prisma/client';
import { AssetStatus, HistoryEventType, IncidentStatus, Prisma } from '@prisma/client';
import { HttpError } from '../../errors/http-error';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentFilterDto } from './dto/filter-incidents.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { assetSelect } from '../../prisma/asset-select';

const incidentInclude = {
  department: { select: { id: true, name: true } },
  asset: { select: assetSelect },
} as const;

export class IncidentsService {
  private buildIncidentWhere(params: IncidentFilterDto): Prisma.IncidentWhereInput {
    const { assetId, status, departmentId } = params;
    const where: Prisma.IncidentWhereInput = {};

    if (typeof assetId === 'number') {
      where.assetId = assetId;
    }

    if (status != null) {
      where.status = status;
    }

    if (typeof departmentId === 'number') {
      where.departmentId = departmentId;
    }

    return where;
  }

  async listIncidents(params: IncidentFilterDto) {
    const where = this.buildIncidentWhere(params);

    const incidents = await prisma.incident.findMany({
      where,
      orderBy: { reportedAt: 'desc' },
      include: incidentInclude,
    });

    return incidents;
  }

  /** Données enrichies pour le PDF liste des pannes (bénéficiaire = affectation active du matériel). */
  async listIncidentsForPdf(params: IncidentFilterDto) {
    const where = this.buildIncidentWhere(params);

    const incidents = await prisma.incident.findMany({
      where,
      orderBy: { reportedAt: 'desc' },
      include: {
        department: { select: { id: true, name: true } },
        asset: {
          select: {
            ...assetSelect,
            assignments: {
              where: { endDate: null },
              orderBy: { startDate: 'desc' },
              take: 1,
              select: {
                employee: { select: { firstName: true, lastName: true, email: true } },
              },
            },
          },
        },
      },
    });

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
      include: incidentInclude,
    });

    if (!incident) {
      return null;
    }

    return incident;
  }

  async createForAsset(assetId: number, data: CreateIncidentDto) {
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
          return null;
        }

        const incident = await tx.incident.create({
          data: {
            assetId,
            description: data.description,
            reportedAt: data.reportedAt,
            departmentId: data.departmentId,
            status: IncidentStatus.OUVERT,
          },
        });

        const previousStatus = asset.status;
        const newStatus = AssetStatus.EN_PANNE;

        const updatedAsset = await tx.asset.update({
          where: { id: assetId },
          data: { status: newStatus },
        });

        const eventIncident = await tx.historyEvent.create({
          data: {
            assetId,
            type: HistoryEventType.INCIDENT_REPORTED,
            payload: {
              incidentId: incident.id,
              description: incident.description,
              reportedAt: incident.reportedAt.toISOString(),
              departmentId: incident.departmentId,
              status: incident.status,
            },
          },
        });

        const historyEvents = [eventIncident];

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

        const incidentWithRelations = await tx.incident.findUnique({
          where: { id: incident.id },
          include: incidentInclude,
        });

        return { incident: incidentWithRelations!, historyEvents };
      });

      if (!result) {
        return null;
      }

      const { incident, historyEvents } = result;

      return { incident, historyEvents };
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          400,
          "Les données fournies pour créer l'incident sont invalides.",
          'INCIDENT_VALIDATION_ERROR',
        );
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new HttpError(
            404,
            'Matériel ou département non trouvé.',
            'ASSET_OR_DEPARTMENT_NOT_FOUND',
          );
        }
        throw new HttpError(
          400,
          "Erreur lors de la création de l'incident.",
          'INCIDENT_CREATE_ERROR',
        );
      }

      if (error instanceof HttpError) {
        throw error;
      }

      throw error;
    }
  }

  async updateStatus(id: number, data: UpdateIncidentDto) {
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
        include: incidentInclude,
      });

      return updated;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          400,
          "Les données fournies pour mettre à jour l'incident sont invalides.",
          'INCIDENT_UPDATE_VALIDATION_ERROR',
        );
      }

      if (error instanceof HttpError) {
        throw error;
      }

      throw error;
    }
  }
}
