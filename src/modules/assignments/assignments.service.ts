import { prisma } from '../../prisma/client';
import { AssetStatus, HistoryEventType, Prisma } from '@prisma/client';
import { HttpError } from '../../errors/http-error';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { AssignmentFilterDto } from './dto/filter-assignments.dto';
import { assetSelect } from '../../prisma/asset-select';

const assignmentInclude = {
  employee: { select: { id: true, firstName: true, lastName: true, email: true } },
  department: { select: { id: true, name: true } },
  asset: { select: assetSelect },
} as const;

export class AssignmentsService {
  async listAssignments(params: AssignmentFilterDto) {
    const { assetId, activeOnly } = params;

    const where: Prisma.AssignmentWhereInput = {};

    if (typeof assetId === 'number') {
      where.assetId = assetId;
    }

    if (activeOnly === true) {
      where.endDate = null;
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: assignmentInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return assignments;
  }

  async createAssignment(assetId: number, data: CreateAssignmentDto) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const asset = await tx.asset.findUnique({
          where: { id: assetId },
        });

        if (!asset) {
          return null;
        }

        if (
          asset.status === AssetStatus.EN_PANNE ||
          asset.status === AssetStatus.EN_PRET ||
          asset.status === AssetStatus.EN_REPARATION ||
          asset.status === AssetStatus.HORS_SERVICE
        ) {
          throw new HttpError(
            400,
            "Ce matériel n'est pas assignable dans son état actuel.",
            'ASSET_NOT_ASSIGNABLE',
          );
        }

        const employee = await tx.employee.findFirst({
          where: { id: data.employeeId, deletedAt: null },
        });

        if (!employee) {
          throw new HttpError(
            400,
            "L'employé fourni est invalide ou a été supprimé.",
            'ASSIGNMENT_EMPLOYEE_INVALID',
          );
        }

        const activeAssignment = await tx.assignment.findFirst({
          where: {
            assetId,
            endDate: null,
          },
        });

        if (activeAssignment) {
          throw new HttpError(
            400,
            'Ce matériel est déjà affecté. Veuillez clôturer l\'affectation en cours avant d\'en créer une nouvelle.',
          );
        }

        const assignment = await tx.assignment.create({
          data: {
            assetId,
            employeeId: data.employeeId,
            departmentId: data.departmentId,
            startDate: data.startDate,
            note: data.note,
          },
        });

        const previousStatus = asset.status;

        const updatedAsset = await tx.asset.update({
          where: { id: assetId },
          data: {
            status: AssetStatus.AFFECTE,
          },
        });

        const eventCreated = await tx.historyEvent.create({
          data: {
            assetId,
            type: HistoryEventType.ASSIGNMENT_CREATED,
            payload: {
              assignmentId: assignment.id,
              employeeId: assignment.employeeId,
              departmentId: assignment.departmentId,
              startDate: assignment.startDate.toISOString?.() ?? assignment.startDate,
              note: assignment.note,
            },
          },
        });

        const historyEvents = [eventCreated];

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

        const assignmentWithRelations = await tx.assignment.findUnique({
          where: { id: assignment.id },
          include: assignmentInclude,
        });

        return { assignment: assignmentWithRelations!, historyEvents };
      });

      if (!result) {
        return null;
      }

      const { assignment, historyEvents } = result;

      return { assignment, historyEvents };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          400,
          "Les données fournies pour créer l'affectation sont invalides.",
          'ASSIGNMENT_VALIDATION_ERROR',
        );
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new HttpError(
          400,
          "L'employé ou le département fourni est invalide.",
          'ASSIGNMENT_REFERENCE_ERROR',
        );
      }

      if (error instanceof HttpError) {
        throw error;
      }

      throw error;
    }
  }

  async listAssignmentsForPrint() {
    const assignments = await prisma.assignment.findMany({
      orderBy: [{ assetId: 'asc' }, { startDate: 'asc' }],
      include: assignmentInclude,
    });

    return assignments;
  }

  async getAssignmentForPrintById(assignmentId: number) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: assignmentInclude,
    });

    if (!assignment) {
      return null;
    }

    return assignment;
  }

  async endAssignment(assignmentId: number) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const assignment = await tx.assignment.findUnique({
          where: { id: assignmentId },
          include: { asset: true },
        });

        if (!assignment) {
          return null;
        }

        if (assignment.endDate != null) {
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
            status: AssetStatus.EN_STOCK_NON_AFFECTE,
          },
        });

        const eventEnded = await tx.historyEvent.create({
          data: {
            assetId: assignment.assetId,
            type: HistoryEventType.ASSIGNMENT_ENDED,
            payload: {
              assignmentId: assignment.id,
              employeeId: assignment.employeeId,
              departmentId: assignment.departmentId,
              startDate: assignment.startDate.toISOString?.() ?? assignment.startDate,
              endDate: endedAt.toISOString(),
            },
          },
        });

        const historyEvents = [eventEnded];

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

        const assignmentWithRelations = await tx.assignment.findUnique({
          where: { id: updatedAssignment.id },
          include: assignmentInclude,
        });

        return { assignment: assignmentWithRelations!, historyEvents };
      });

      if (!result) {
        return null;
      }

      const { assignment, historyEvents } = result;

      return { assignment, historyEvents };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          400,
          "L'identifiant fourni pour clôturer l'affectation est invalide.",
          'ASSIGNMENT_ID_VALIDATION_ERROR',
        );
      }

      if (error instanceof HttpError) {
        throw error;
      }

      throw error;
    }
  }
}
