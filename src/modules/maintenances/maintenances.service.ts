import { prisma } from '../../prisma/client';
import { logger } from '../../logger';
import { HistoryEventType, MaintenanceStatus, Prisma } from '@prisma/client';
import { HttpError } from '../../errors/http-error';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { MaintenanceFilterDto } from './dto/filter-maintenances.dto';
import { UpdateMaintenanceStatusDto } from './dto/update-maintenance-status.dto';

import { assetSelect } from '../../prisma/asset-select';

export class MaintenancesService {
  private buildWhere(filters: MaintenanceFilterDto): Prisma.MaintenanceWhereInput {
    const where: Prisma.MaintenanceWhereInput = {};

    if (typeof filters.assetId === 'number') {
      where.assetId = filters.assetId;
    }

    if (filters.status != null) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }

    return where;
  }

  async createMaintenance(data: CreateMaintenanceDto) {
    logger.info(
      { assetId: data.assetId, title: data.title },
      '[MaintenancesService] Création de maintenance demandée',
    );

    const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) {
      return null;
    }

    try {
      const maintenance = await prisma.$transaction(async (tx) => {
        const created = await tx.maintenance.create({
          data: {
            assetId: data.assetId,
            title: data.title,
            description: data.description,
            scheduledDate: data.scheduledDate,
            completedDate: data.completedDate,
            technician: data.technician,
            cost: data.cost,
          },
        });

        await tx.historyEvent.create({
          data: {
            assetId: data.assetId,
            type: HistoryEventType.MAINTENANCE_CREATED,
            payload: {
              maintenanceId: created.id,
              title: created.title,
              scheduledDate: created.scheduledDate.toISOString(),
              status: created.status,
            },
          },
        });

        return tx.maintenance.findUnique({
          where: { id: created.id },
          include: { asset: { select: assetSelect } },
        });
      });

      logger.info(
        { id: maintenance!.id, assetId: data.assetId },
        '[MaintenancesService] Maintenance créée avec succès',
      );

      return maintenance;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          400,
          'Les données fournies pour créer la maintenance sont invalides.',
          'MAINTENANCE_VALIDATION_ERROR',
        );
      }
      throw error;
    }
  }

  async listMaintenances(filters: MaintenanceFilterDto) {
    logger.debug({ filters }, '[MaintenancesService] Listing des maintenances');

    const maintenances = await prisma.maintenance.findMany({
      where: this.buildWhere(filters),
      orderBy: { scheduledDate: 'desc' },
      include: { asset: { select: assetSelect } },
    });

    logger.debug(
      { count: maintenances.length },
      '[MaintenancesService] Listing des maintenances terminé',
    );

    return maintenances;
  }

  async getMaintenanceById(id: number) {
    logger.debug({ id }, '[MaintenancesService] Récupération de la maintenance');

    const maintenance = await prisma.maintenance.findUnique({
      where: { id },
      include: { asset: { select: assetSelect } },
    });

    if (!maintenance) {
      logger.warn({ id }, '[MaintenancesService] Maintenance non trouvée');
    }

    return maintenance;
  }

  async updateMaintenance(id: number, data: UpdateMaintenanceDto) {
    logger.info({ id }, '[MaintenancesService] Mise à jour de maintenance demandée');

    const existing = await prisma.maintenance.findUnique({ where: { id } });

    if (!existing) {
      logger.warn({ id }, '[MaintenancesService] Mise à jour impossible: maintenance non trouvée');
      return null;
    }

    const maintenance = await prisma.maintenance.update({
      where: { id },
      data: {
        title: data.title ?? existing.title,
        description: data.description !== undefined ? data.description : existing.description,
        scheduledDate: data.scheduledDate ?? existing.scheduledDate,
        completedDate: data.completedDate !== undefined ? data.completedDate : existing.completedDate,
        technician: data.technician !== undefined ? data.technician : existing.technician,
        cost: data.cost !== undefined ? data.cost : existing.cost,
      },
      include: { asset: { select: assetSelect } },
    });

    logger.info({ id }, '[MaintenancesService] Maintenance mise à jour avec succès');

    return maintenance;
  }

  async updateMaintenanceStatus(id: number, data: UpdateMaintenanceStatusDto) {
    logger.info(
      { id, status: data.status },
      '[MaintenancesService] Mise à jour du statut de maintenance demandée',
    );

    const existing = await prisma.maintenance.findUnique({ where: { id } });

    if (!existing) {
      logger.warn({ id }, '[MaintenancesService] Maintenance non trouvée pour mise à jour du statut');
      return null;
    }

    const updateData: Prisma.MaintenanceUpdateInput = {
      status: data.status,
    };

    if (data.status === MaintenanceStatus.TERMINEE && !existing.completedDate) {
      updateData.completedDate = new Date();
    }

    const maintenance = await prisma.maintenance.update({
      where: { id },
      data: updateData,
      include: { asset: { select: assetSelect } },
    });

    logger.info(
      { id, status: data.status },
      '[MaintenancesService] Statut de maintenance mis à jour avec succès',
    );

    return maintenance;
  }

  async deleteMaintenance(id: number) {
    logger.info({ id }, '[MaintenancesService] Suppression de maintenance demandée');

    const existing = await prisma.maintenance.findUnique({ where: { id } });

    if (!existing) {
      logger.warn({ id }, '[MaintenancesService] Suppression impossible: maintenance non trouvée');
      return false;
    }

    await prisma.maintenance.delete({ where: { id } });

    logger.info({ id }, '[MaintenancesService] Maintenance supprimée avec succès');

    return true;
  }
}
