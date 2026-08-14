import { prisma } from '../../prisma/client';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetFilterDto } from './dto/filter-assets.dto';
import { AssetStatus, HistoryEventType, Prisma } from '@prisma/client';
import { HttpError } from '../../errors/http-error';
const assetDetailInclude = {
  category: { select: { id: true, name: true } },
  materialType: { select: { id: true, name: true } },
  brand: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
  location: { select: { id: true, name: true } },
  assignments: {
    orderBy: { startDate: 'desc' as const },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, email: true } },
      department: { select: { id: true, name: true } },
    },
  },
  history: {
    orderBy: { createdAt: 'desc' as const },
  },
  incidents: {
    include: {
      department: { select: { id: true, name: true } },
      repairs: true,
    },
    orderBy: { reportedAt: 'desc' as const },
  },
} as const;

export class StocksService {
  async createAsset(data: CreateAssetDto) {
    const inventoryNumber =
      data.inventoryNumber && data.inventoryNumber.trim().length > 0
        ? data.inventoryNumber.trim()
        : `INV-${Date.now()}`;

    try {
      const asset = await prisma.asset.create({
        data: {
          inventoryNumber,
          serialNumber: data.serialNumber,
          categoryId: data.categoryId,
          materialTypeId: data.materialTypeId,
          brandId: data.brandId,
          supplierId: data.supplierId,
          locationId: data.locationId,
          model: data.model,
          entryDate: data.entryDate,
          purchasePrice:
            data.purchasePrice != null ? new Prisma.Decimal(data.purchasePrice) : undefined,
          warrantyStartDate: data.warrantyStartDate,
          warrantyEndDate: data.warrantyEndDate,
          status: data.status ?? AssetStatus.EN_STOCK_NON_AFFECTE,
        },
        include: {
          category: { select: { id: true, name: true } },
          materialType: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      });

      try {
        await prisma.historyEvent.create({
          data: {
            assetId: asset.id,
            type: HistoryEventType.ASSET_CREATED,
            payload: {
              inventoryNumber: asset.inventoryNumber,
              categoryId: asset.categoryId,
              category: asset.category.name,
              materialTypeId: asset.materialTypeId,
              materialType: asset.materialType.name,
              brandId: asset.brandId,
              brand: asset.brand.name,
              supplierId: asset.supplierId,
              supplier: asset.supplier?.name ?? null,
              model: asset.model,
              status: asset.status,
              entryDate: asset.entryDate.toISOString?.() ?? asset.entryDate,
              warrantyStartDate: asset.warrantyStartDate?.toISOString?.() ?? asset.warrantyStartDate,
              warrantyEndDate: asset.warrantyEndDate?.toISOString?.() ?? asset.warrantyEndDate,
            },
          },
        });
      } catch {
        // L'historique n'est pas bloquant pour la création du matériel.
      }

      return asset;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpError(
            409,
            "Un matériel avec ce numéro d'inventaire existe déjà.",
            'ASSET_INVENTORY_NUMBER_CONFLICT',
          );
        }

        if (error.code === 'P2003') {
          throw new HttpError(
            400,
            'Une référence fournie (catégorie, type, marque, fournisseur ou localisation) est invalide.',
            'ASSET_REFERENCE_ERROR',
          );
        }
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          400,
          'Les données fournies pour créer le matériel sont invalides.',
          'ASSET_VALIDATION_ERROR',
        );
      }

      throw error;
    }
  }

  async updateAsset(id: number, data: UpdateAssetDto) {
    const existing = await prisma.asset.findUnique({
      where: { id },
    });

    if (!existing) {
      return null;
    }

    const mergedStart =
      data.warrantyStartDate !== undefined ? data.warrantyStartDate : existing.warrantyStartDate;
    const mergedEnd =
      data.warrantyEndDate !== undefined ? data.warrantyEndDate : existing.warrantyEndDate;

    if (mergedStart && mergedEnd && mergedEnd.getTime() < mergedStart.getTime()) {
      throw new HttpError(
        400,
        'La date de fin de garantie ne peut pas être antérieure à la date de début.',
        'ASSET_WARRANTY_RANGE_INVALID',
      );
    }

    try {
      const asset = await prisma.asset.update({
        where: { id },
        data: {
          inventoryNumber: data.inventoryNumber,
          serialNumber: data.serialNumber,
          categoryId: data.categoryId,
          materialTypeId: data.materialTypeId,
          brandId: data.brandId,
          supplierId: data.supplierId,
          locationId: data.locationId,
          model: data.model,
          entryDate: data.entryDate,
          purchasePrice:
            data.purchasePrice !== undefined
              ? data.purchasePrice != null
                ? new Prisma.Decimal(data.purchasePrice)
                : null
              : undefined,
          warrantyStartDate: data.warrantyStartDate,
          warrantyEndDate: data.warrantyEndDate,
          status: data.status,
        },
        include: {
          category: { select: { id: true, name: true } },
          materialType: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
          location: { select: { id: true, name: true } },
        },
      });

      return asset;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new HttpError(
          400,
          'Une référence fournie (catégorie, type, marque, fournisseur ou localisation) est invalide.',
          'ASSET_REFERENCE_ERROR',
        );
      }

      throw error;
    }
  }

  private buildAssetWhere(filters: AssetFilterDto): Prisma.AssetWhereInput {
    const where: Prisma.AssetWhereInput = {};
    const andConditions: Prisma.AssetWhereInput[] = [];

    if (filters.search) {
      const search = filters.search;
      andConditions.push({
        OR: [
          { inventoryNumber: { contains: search, mode: 'insensitive' } },
          { serialNumber: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { brand: { name: { contains: search, mode: 'insensitive' } } },
          { materialType: { name: { contains: search, mode: 'insensitive' } } },
          { supplier: { name: { contains: search, mode: 'insensitive' } } },
          {
            assignments: {
              some: {
                endDate: null,
                OR: [
                  { employee: { firstName: { contains: search, mode: 'insensitive' } } },
                  { employee: { lastName: { contains: search, mode: 'insensitive' } } },
                  { department: { name: { contains: search, mode: 'insensitive' } } },
                ],
              },
            },
          },
        ],
      });
    }

    if (filters.departmentId) {
      andConditions.push({
        assignments: {
          some: {
            departmentId: filters.departmentId,
            endDate: null,
          },
        },
      });
    }

    if (filters.employeeId) {
      andConditions.push({
        assignments: {
          some: {
            employeeId: filters.employeeId,
            endDate: null,
          },
        },
      });
    }

    if (filters.computer) {
      const computer = filters.computer;
      andConditions.push({
        OR: [
          { inventoryNumber: { contains: computer, mode: 'insensitive' } },
          { model: { contains: computer, mode: 'insensitive' } },
          { serialNumber: { contains: computer, mode: 'insensitive' } },
        ],
      });
    }

    const typeIds = [
      ...(filters.materialTypeIds ?? []),
      ...(filters.materialTypeId != null ? [filters.materialTypeId] : []),
    ];
    const uniqueTypeIds = [...new Set(typeIds)];
    if (uniqueTypeIds.length === 1) {
      where.materialTypeId = uniqueTypeIds[0];
    } else if (uniqueTypeIds.length > 1) {
      where.materialTypeId = { in: uniqueTypeIds };
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.brandId) {
      where.brandId = filters.brandId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.entryDateFrom || filters.entryDateTo) {
      where.entryDate = {
        ...(filters.entryDateFrom ? { gte: filters.entryDateFrom } : {}),
        ...(filters.entryDateTo ? { lte: filters.entryDateTo } : {}),
      };
    }

    if (filters.warrantyExpired) {
      andConditions.push({
        warrantyEndDate: { lt: new Date() },
      });
    }

    if (filters.minAgeYears != null) {
      const threshold = new Date();
      threshold.setFullYear(threshold.getFullYear() - filters.minAgeYears);
      andConditions.push({
        entryDate: { lte: threshold },
      });
    }

    if (filters.physicalInventoryPending) {
      andConditions.push({
        lastPhysicalInventoryAt: null,
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return where;
  }

  private mapAssetWithCurrentAssignment<
    T extends {
      assignments?: Array<{
        endDate: Date | null;
        employee: { id: string; firstName: string; lastName: string; email: string | null };
        department: { id: number; name: string };
      }>;
    },
  >(asset: T) {
    const { assignments, ...rest } = asset;
    const currentAssignment =
      assignments?.find((assignment) => assignment.endDate === null) ?? null;
    return {
      ...rest,
      currentAssignment,
    };
  }

  async getAssets(filters: AssetFilterDto) {
    const where = this.buildAssetWhere(filters);

    try {
      const assets = await prisma.asset.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          materialType: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
          location: { select: { id: true, name: true } },
          assignments: {
            where: { endDate: null },
            take: 1,
            orderBy: { startDate: 'desc' },
            include: {
              employee: { select: { id: true, firstName: true, lastName: true, email: true } },
              department: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return assets.map((asset) => this.mapAssetWithCurrentAssignment(asset));
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          400,
          'Les filtres fournis pour lister les matériels sont invalides.',
          'ASSET_FILTER_VALIDATION_ERROR',
        );
      }

      throw error;
    }
  }

  async getInventorySummary(filters: AssetFilterDto = {}) {
    const where = this.buildAssetWhere(filters);

    const [total, byStatusRows, warrantyExpired, toRenew] = await Promise.all([
      prisma.asset.count({ where }),
      prisma.asset.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
      prisma.asset.count({
        where: {
          AND: [where, { warrantyEndDate: { lt: new Date() } }],
        },
      }),
      prisma.asset.count({
        where: {
          AND: [
            where,
            {
              OR: [
                { warrantyEndDate: { lt: new Date() } },
                {
                  entryDate: {
                    lte: (() => {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() - 4);
                      return d;
                    })(),
                  },
                },
              ],
            },
          ],
        },
      }),
    ]);

    const byStatus = Object.fromEntries(
      byStatusRows.map((row) => [row.status, row._count.id]),
    ) as Partial<Record<AssetStatus, number>>;

    return {
      total,
      byStatus,
      assigned: byStatus.AFFECTE ?? 0,
      inStock: byStatus.EN_STOCK_NON_AFFECTE ?? 0,
      inRepair: byStatus.EN_REPARATION ?? 0,
      broken: byStatus.EN_PANNE ?? 0,
      outOfService: byStatus.HORS_SERVICE ?? 0,
      inLoan: byStatus.EN_PRET ?? 0,
      inService: byStatus.EN_SERVICE ?? 0,
      warrantyExpired,
      toRenew,
    };
  }

  async markPhysicalInventory(
    id: number,
    data: { note?: string | null; inventoriedAt?: Date },
  ) {
    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) return null;

    return prisma.asset.update({
      where: { id },
      data: {
        lastPhysicalInventoryAt: data.inventoriedAt ?? new Date(),
        physicalInventoryNote: data.note ?? null,
      },
      include: {
        category: { select: { id: true, name: true } },
        materialType: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } },
      },
    });
  }

  async getAssetById(id: number) {
    try {
      const asset = await prisma.asset.findUnique({
        where: { id },
        include: assetDetailInclude,
      });

      if (!asset) {
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
        throw new HttpError(
          400,
          "L'identifiant fourni pour récupérer le matériel est invalide.",
          'ASSET_ID_VALIDATION_ERROR',
        );
      }

      throw error;
    }
  }

  async getAssetByInventoryNumber(inventoryNumber: string) {
    const normalizedInventoryNumber = inventoryNumber.trim();

    if (!normalizedInventoryNumber) {
      throw new HttpError(
        400,
        "Le numero d'inventaire du materiel est obligatoire.",
        'ASSET_INVENTORY_NUMBER_REQUIRED',
      );
    }

    try {
      const asset = await prisma.asset.findUnique({
        where: { inventoryNumber: normalizedInventoryNumber },
        include: {
          ...assetDetailInclude,
          incidents: {
            include: {
              department: { select: { id: true, name: true } },
              repairs: {
                orderBy: { workshopEntryDate: 'desc' },
              },
            },
            orderBy: { reportedAt: 'desc' },
          },
        },
      });

      if (!asset) {
        return null;
      }

      const now = new Date();
      const currentAssignment =
        asset.assignments.find((assignment) => !assignment.endDate || assignment.endDate >= now) ??
        null;

      const { assignments: _assignments, incidents: _incidents, ...assetData } = asset;

      return {
        ...assetData,
        currentAssignment,
        history: asset.history,
        incidentsWithRepairs: asset.incidents,
        currentStatus: asset.status,
      };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          400,
          "Le numero d'inventaire fourni pour recuperer le materiel est invalide.",
          'ASSET_INVENTORY_NUMBER_VALIDATION_ERROR',
        );
      }

      throw error;
    }
  }

  async deleteAsset(id: number) {
    try {
      const existing = await prisma.asset.findUnique({
        where: { id },
      });

      if (!existing) {
        return false;
      }

      await prisma.asset.delete({
        where: { id },
      });

      return true;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          400,
          "L'identifiant fourni pour supprimer le matériel est invalide.",
          'ASSET_ID_VALIDATION_ERROR',
        );
      }

      throw error;
    }
  }
}
