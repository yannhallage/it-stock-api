import { prisma } from '../../prisma/client';
import { HistoryEventType, Prisma } from '@prisma/client';
import { HttpError } from '../../errors/http-error';
import { CreateMovementDto } from './dto/create-movement.dto';
import { MovementFilterDto } from './dto/filter-movements.dto';

const movementInclude = {
  asset: {
    select: {
      id: true,
      inventoryNumber: true,
      model: true,
      status: true,
      brand: { select: { name: true } },
      materialType: { select: { name: true } },
    },
  },
  fromLocation: true,
  toLocation: true,
} as const;

export class MovementsService {
  async createMovement(data: CreateMovementDto) {
    const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) {
      return null;
    }

    try {
      const movement = await prisma.$transaction(async (tx) => {
        const created = await tx.assetMovement.create({
          data: {
            assetId: data.assetId,
            fromLocationId: data.fromLocationId,
            toLocationId: data.toLocationId,
            movementType: data.movementType,
            movedAt: data.movedAt,
            note: data.note,
          },
        });

        if (data.toLocationId != null) {
          await tx.asset.update({
            where: { id: data.assetId },
            data: { locationId: data.toLocationId },
          });
        }

        await tx.historyEvent.create({
          data: {
            assetId: data.assetId,
            type: HistoryEventType.LOCATION_CHANGED,
            payload: {
              movementId: created.id,
              fromLocationId: data.fromLocationId ?? null,
              toLocationId: data.toLocationId ?? null,
              movementType: data.movementType,
            },
          },
        });

        return tx.assetMovement.findUnique({
          where: { id: created.id },
          include: movementInclude,
        });
      });

      return movement;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          400,
          'Les données fournies pour créer le mouvement sont invalides.',
          'MOVEMENT_VALIDATION_ERROR',
        );
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new HttpError(
          404,
          'Matériel ou localisation non trouvé(e).',
          'MOVEMENT_REFERENCE_NOT_FOUND',
        );
      }
      throw error;
    }
  }

  async listMovements(filters: MovementFilterDto) {
    const where: Prisma.AssetMovementWhereInput = {};

    if (typeof filters.assetId === 'number') {
      where.assetId = filters.assetId;
    }

    const movements = await prisma.assetMovement.findMany({
      where,
      orderBy: { movedAt: 'desc' },
      include: movementInclude,
    });

    return movements;
  }

  async getMovementById(id: number) {
    const movement = await prisma.assetMovement.findUnique({
      where: { id },
      include: movementInclude,
    });

    return movement;
  }
}
