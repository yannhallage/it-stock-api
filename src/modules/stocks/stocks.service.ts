import { prisma } from '../../prisma/client';
import { logger } from '../../logger';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetFilterDto } from './dto/filter-assets.dto';
import { Prisma, HistoryEventType } from '@prisma/client';
import { HttpError } from '../../errors/http-error';

export class StocksService {
  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  async createAsset(data: CreateAssetDto) {
    const inventoryNumber =
      data.inventoryNumber && data.inventoryNumber.trim().length > 0
        ? data.inventoryNumber.trim()
        : `INV-${Date.now()}`;

    logger.info(
      { inventoryNumber, type: data.type, brand: data.brand, model: data.model },
      '[StocksService] Création de matériel demandée',
    );

    try {
      const hasWarrantyInput =
        data.warrantyStartDate !== undefined ||
        data.warrantyEndDate !== undefined ||
        data.warrantyMonths !== undefined;
      const warrantyStartDate = hasWarrantyInput ? data.warrantyStartDate ?? data.entryDate : undefined;
      const warrantyEndDate = hasWarrantyInput
        ? data.warrantyEndDate ??
          (data.warrantyMonths !== undefined
            ? this.addMonths(warrantyStartDate!, data.warrantyMonths)
            : undefined)
        : undefined;

      const asset = await prisma.asset.create({
        data: {
          inventoryNumber,
          serial_number: data.serial_number,
          type: data.type,
          brand: data.brand,
          model: data.model,
          entryDate: data.entryDate,
          supplier: data.supplier,
          warrantyStartDate,
          warrantyEndDate,
          status: (data.status as any) ?? undefined,
        },
      });

      logger.info(
        { id: asset.id, inventoryNumber: asset.inventoryNumber },
        '[StocksService] Matériel créé avec succès',
      );

      try {
        await prisma.historyEvent.create({
          data: {
            assetId: asset.id,
            type: HistoryEventType.ASSET_CREATED,
            payload: {
              inventoryNumber: asset.inventoryNumber,
              type: asset.type,
              brand: asset.brand,
              model: asset.model,
              supplier: asset.supplier,
              status: asset.status,
              entryDate: asset.entryDate.toISOString?.() ?? asset.entryDate,
              warrantyStartDate: asset.warrantyStartDate?.toISOString?.() ?? asset.warrantyStartDate,
              warrantyEndDate: asset.warrantyEndDate?.toISOString?.() ?? asset.warrantyEndDate,
            },
          },
        });

        logger.debug(
          { assetId: asset.id },
          '[StocksService] Événement historique de création de matériel enregistré',
        );
      } catch (historyError) {
        logger.error(
          { historyError, assetId: asset.id },
          '[StocksService] Erreur lors de la création de lévénement historique de création de matériel',
        );
      }

      return asset;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          logger.warn(
            { inventoryNumber, error },
            "[StocksService] Conflit sur le numéro d'inventaire (doublon)",
          );

          throw new HttpError(
            409,
            "Un matériel avec ce numéro d'inventaire existe déjà.",
            'ASSET_INVENTORY_NUMBER_CONFLICT',
          );
        }
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        logger.warn(
          { inventoryNumber, error },
          '[StocksService] Données invalides lors de la création du matériel',
        );

        throw new HttpError(
          400,
          'Les données fournies pour créer le matériel sont invalides.',
          'ASSET_VALIDATION_ERROR',
        );
      }

      logger.error(
        { error, inventoryNumber, type: data.type, brand: data.brand, model: data.model },
        '[StocksService] Erreur inattendue lors de la création du matériel',
      );

      throw error;
    }
  }

  async updateAsset(id: number, data: UpdateAssetDto) {
    logger.info({ id }, '[StocksService] Mise à jour de matériel demandée');

    const existing = await prisma.asset.findUnique({
      where: { id },
    });

    if (!existing) {
      logger.warn({ id }, '[StocksService] Mise à jour impossible: matériel non trouvé');
      return null;
    }

    const mergedStart =
      data.warrantyStartDate !== undefined ? data.warrantyStartDate : existing.warrantyStartDate;
    const startForMonths =
      data.warrantyStartDate !== undefined
        ? data.warrantyStartDate
        : existing.warrantyStartDate ?? existing.entryDate;
    const computedEndFromMonths =
      data.warrantyMonths !== undefined && startForMonths
        ? this.addMonths(startForMonths, data.warrantyMonths)
        : undefined;
    const mergedEnd =
      data.warrantyEndDate !== undefined
        ? data.warrantyEndDate
        : computedEndFromMonths ?? existing.warrantyEndDate;

    if (mergedStart && mergedEnd && mergedEnd.getTime() < mergedStart.getTime()) {
      throw new HttpError(
        400,
        'La date de fin de garantie ne peut pas être antérieure à la date de début.',
        'ASSET_WARRANTY_RANGE_INVALID',
      );
    }

    const { warrantyMonths, ...dataWithoutWarrantyMonths } = data;

    const asset = await prisma.asset.update({
      where: { id },
      data: {
        ...dataWithoutWarrantyMonths,
        warrantyStartDate: data.warrantyStartDate !== undefined ? data.warrantyStartDate : undefined,
        warrantyEndDate:
          data.warrantyEndDate !== undefined ? data.warrantyEndDate : computedEndFromMonths,
        status: data.status as any,
      },
    });

    logger.info({ id }, '[StocksService] Matériel mis à jour avec succès');

    return asset;
  }

  async getAssets(filters: AssetFilterDto) {
    logger.debug({ filters }, '[StocksService] Listing des matériels');

    const where: any = {};

    if (filters.search) {
      const search = filters.search;
      where.OR = [
        { inventoryNumber: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { supplier: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (filters.type) {
      where.type = { equals: filters.type };
    }

    if (filters.status) {
      where.status = filters.status as any;
    }

    try {
      const assets = await prisma.asset.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });

      logger.debug({ count: assets.length }, '[StocksService] Listing des matériels terminé');

      return assets;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        logger.warn(
          { filters, error },
          '[StocksService] Données de filtre invalides lors du listing des matériels',
        );

        throw new HttpError(
          400,
          'Les filtres fournis pour lister les matériels sont invalides.',
          'ASSET_FILTER_VALIDATION_ERROR',
        );
      }

      logger.error(
        { error, filters },
        '[StocksService] Erreur inattendue lors du listing des matériels',
      );

      throw error;
    }
  }

  async getAssetById(id: number) {
    logger.debug('[StocksService] Récupération du matériel');

    try {
      const asset = await prisma.asset.findUnique({
        where: { id },
        include: {
          assignments: {
            orderBy: { startDate: 'desc' },
          },
          history: {
            orderBy: { createdAt: 'desc' },
          },
          incidents: {
            include: { repairs: true },
            orderBy: { reportedAt: 'desc' },
          },
        },
      });

      if (!asset) {
        logger.warn('[StocksService] Matériel non trouvé');
        return null;
      }

      const now = new Date();
      const currentAssignment = asset.assignments.find(
        (a) => !a.endDate || a.endDate >= now,
      ) ?? null;

      const { assignments: _a, incidents: _i, ...assetData } = asset;
      return {
        ...assetData,
        currentAssignment,
        history: asset.history,
        incidentsWithRepairs: asset.incidents,
        currentStatus: asset.status,
      };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        logger.warn(
          { id, error },
          '[StocksService] Identifiant invalide lors de la récupération du matériel',
        );

        throw new HttpError(
          400,
          "L'identifiant fourni pour récupérer le matériel est invalide.",
          'ASSET_ID_VALIDATION_ERROR',
        );
      }

      logger.error(
        { error, id },
        '[StocksService] Erreur inattendue lors de la récupération du matériel',
      );

      throw error;
    }
  }

  async deleteAsset(id: number) {
    logger.info({ id }, '[StocksService] Suppression de matériel demandée');

    try {
      const existing = await prisma.asset.findUnique({
        where: { id },
      });

      if (!existing) {
        logger.warn({ id }, '[StocksService] Suppression impossible: matériel non trouvé');
        return false;
      }

      await prisma.asset.delete({
        where: { id },
      });

      logger.info({ id }, '[StocksService] Matériel supprimé avec succès');

      return true;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        logger.warn(
          { id, error },
          '[StocksService] Identifiant invalide lors de la suppression du matériel',
        );

        throw new HttpError(
          400,
          "L'identifiant fourni pour supprimer le matériel est invalide.",
          'ASSET_ID_VALIDATION_ERROR',
        );
      }

      logger.error(
        { error, id },
        '[StocksService] Erreur inattendue lors de la suppression du matériel',
      );

      throw error;
    }
  }
}

