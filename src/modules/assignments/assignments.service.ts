import { prisma } from '../../prisma/client';
import { logger } from '../../logger';
import { AssetStatus, HistoryEventType, Prisma } from '@prisma/client';
import { HttpError } from '../../errors/http-error';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { AssignmentFilterDto } from './dto/filter-assignments.dto';

export class AssignmentsService {
  async listAssignments(params: AssignmentFilterDto) {
    const { assetId, activeOnly } = params;

    const where: any = {};

    if (typeof assetId === 'number') {
      where.assetId = assetId;
    }

    if (activeOnly === true) {
      where.endDate = null;
    }

    logger.debug(
      { assetId, activeOnly },
      '[AssignmentsService] Listing des affectations',
    );

    const assignments = await prisma.assignment.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    logger.debug(
      { count: assignments.length },
      '[AssignmentsService] Listing des affectations terminé',
    );

    return assignments;
  }

  async createAssignment(assetId: number, data: CreateAssignmentDto) {
    logger.info(
      // { assetId, department: data.department },
      '[AssignmentsService] Création dune affectation demandée',
    );

    try {
      const result = await prisma.$transaction(async (tx) => {
        const asset = await tx.asset.findUnique({
          where: { id: assetId },
        });

        if (!asset) {
          logger.warn({ assetId }, '[AssignmentsService] Matériel non trouvé pour affectation');
          return null;
        }

        if (
          asset.status === AssetStatus.EN_PANNE ||
          asset.status === AssetStatus.EN_REPARATION ||
          asset.status === AssetStatus.HORS_SERVICE
        ) {
          logger.warn(
            // { assetId, status: asset.status },
            "[AssignmentsService] Matériel non assignable en raison de son statut",
          );
          throw new HttpError(
            400,
            "Ce matériel n'est pas assignable dans son état actuel.",
            'ASSET_NOT_ASSIGNABLE',
          );
        }

        // Vérifier que le matériel n'est pas déjà affecté
        const activeAssignment = await tx.assignment.findFirst({
          where: {
            assetId,
            endDate: null,
          },
        });

        if (activeAssignment) {
          logger.warn(
            { assetId, assignmentId: activeAssignment.id },
            '[AssignmentsService] Matériel déjà affecté',
          );
          throw new HttpError(
            400,
            'Ce matériel est déjà affecté. Veuillez clôturer l\'affectation en cours avant d\'en créer une nouvelle.',
            // 'ASSET_ALREADY_ASSIGNED',
          );
        }

        const assignment = await tx.assignment.create({
          data: {
            assetId,
            department: data.department,
            user: data.user,
            startDate: data.startDate,
          },
        });

        const previousStatus = asset.status;

        const updatedAsset = await tx.asset.update({
          where: { id: assetId },
          data: {
            status: AssetStatus.AFFECTE,
          },
        });

        // Historique : création de l'affectation
        const eventCreated = await tx.historyEvent.create({
          data: {
            assetId,
            type: HistoryEventType.ASSIGNMENT_CREATED,
            payload: {
              assignmentId: assignment.id,
              department: assignment.department,
              user: assignment.user,
              startDate: assignment.startDate.toISOString?.() ?? assignment.startDate,
            },
          },
        });

        const historyEvents = [eventCreated];

        // Historique : changement de statut si nécessaire
        if (previousStatus !== updatedAsset.status) {
          const eventStatus = await tx.historyEvent.create({
            data: {
              assetId,
              type: HistoryEventType.STATUS_CHANGED,
              payload: {
                from: previousStatus,
                to: updatedAsset.status,
              },
            },
          });
          historyEvents.push(eventStatus);
        }

        return { assignment, historyEvents };
      });

      if (!result) {
        return null;
      }

      const { assignment, historyEvents } = result;

      logger.info(
        // { assignmentId: assignment.id, assetId },
        '[AssignmentsService] Affectation créée avec succès',
      );

      return { assignment, historyEvents };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        logger.warn(
          // { assetId, error },
          '[AssignmentsService] Données invalides lors de la création de laffectation',
        );

        throw new HttpError(
          400,
          "Les données fournies pour créer l'affectation sont invalides.",
          'ASSIGNMENT_VALIDATION_ERROR',
        );
      }

      if (error instanceof HttpError) {
        throw error;
      }

      logger.error(
        // { error, assetId },
        '[AssignmentsService] Erreur inattendue lors de la création de laffectation',
      );

      throw error;
    }
  }

  async listAssignmentsForPrint() {
    logger.debug('[AssignmentsService] Listing des affectations (impression)');

    const assignments = await prisma.assignment.findMany({
      orderBy: [{ assetId: 'asc' }, { startDate: 'asc' }],
      include: {
        asset: {
          select: {
            id: true,
            inventoryNumber: true,
            serial_number: true,
            type: true,
            brand: true,
            model: true,
            status: true,
          },
        },
      },
    });

    logger.debug(
      { count: assignments.length },
      '[AssignmentsService] Listing des affectations (impression) terminé',
    );

    return assignments;
  }

  async getAssignmentForPrintById(assignmentId: number) {
    logger.debug(
      { assignmentId },
      '[AssignmentsService] Chargement de l affectation (impression) par identifiant',
    );

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        asset: {
          select: {
            id: true,
            inventoryNumber: true,
            serial_number: true,
            type: true,
            brand: true,
            model: true,
            status: true,
          },
        },
      },
    });

    if (!assignment) {
      logger.warn(
        { assignmentId },
        '[AssignmentsService] Affectation introuvable pour impression',
      );
      return null;
    }

    return assignment;
  }

  async endAssignment(assignmentId: number) {
    logger.info(
      { assignmentId },
      '[AssignmentsService] Clôture dune affectation demandée',
    );

    try {
      const result = await prisma.$transaction(async (tx) => {
        const assignment = await tx.assignment.findUnique({
          where: { id: assignmentId },
          include: { asset: true },
        });

        if (!assignment) {
          logger.warn(
            { assignmentId },
            '[AssignmentsService] Affectation non trouvée pour clôture',
          );
          return null;
        }

        if (assignment.endDate != null) {
          logger.warn(
            { assignmentId },
            '[AssignmentsService] Affectation déjà clôturée',
          );
          throw new HttpError(
            400,
            "Cette affectation est déjà clôturée.",
            'ASSIGNMENT_ALREADY_ENDED',
          );
        }

        const endedAt = new Date();

        const updatedAssignment = await tx.assignment.update({
          where: { id: assignmentId },
          data: {
            endDate: endedAt,
          },
        });

        const previousStatus = assignment.asset.status;

        const updatedAsset = await tx.asset.update({
          where: { id: assignment.assetId },
          data: {
            status: AssetStatus.EN_STOCK,
          },
        });

        // Historique : fin de l'affectation
        const eventEnded = await tx.historyEvent.create({
          data: {
            assetId: assignment.assetId,
            type: HistoryEventType.ASSIGNMENT_ENDED,
            payload: {
              assignmentId: assignment.id,
              department: assignment.department,
              user: assignment.user,
              startDate: assignment.startDate.toISOString?.() ?? assignment.startDate,
              endDate: endedAt.toISOString(),
            },
          },
        });

        const historyEvents = [eventEnded];

        // Historique : changement de statut si nécessaire
        if (previousStatus !== updatedAsset.status) {
          const eventStatus = await tx.historyEvent.create({
            data: {
              assetId: assignment.assetId,
              type: HistoryEventType.STATUS_CHANGED,
              payload: {
                from: previousStatus,
                to: updatedAsset.status,
              },
            },
          });
          historyEvents.push(eventStatus);
        }

        return { assignment: updatedAssignment, historyEvents };
      });

      if (!result) {
        return null;
      }

      const { assignment, historyEvents } = result;

      logger.info(
        { assignmentId: assignment.id },
        '[AssignmentsService] Affectation clôturée avec succès',
      );

      return { assignment, historyEvents };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        logger.warn(
          { assignmentId, error },
          '[AssignmentsService] Identifiant invalide lors de la clôture de laffectation',
        );

        throw new HttpError(
          400,
          "L'identifiant fourni pour clôturer l'affectation est invalide.",
          'ASSIGNMENT_ID_VALIDATION_ERROR',
        );
      }

      if (error instanceof HttpError) {
        throw error;
      }

      logger.error(
        { error, assignmentId },
        '[AssignmentsService] Erreur inattendue lors de la clôture de laffectation',
      );

      throw error;
    }
  }
}

