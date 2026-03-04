import { prisma } from '../../prisma/client';
import { logger } from '../../logger';
import { CreateMaterialTypeDto } from './dto/create-material-type.dto';
import { UpdateMaterialTypeDto } from './dto/update-material-type.dto';
import { MaterialTypeFilterDto } from './dto/filter-material-types.dto';

export class MaterialTypesService {
  async createMaterialType(data: CreateMaterialTypeDto) {
    logger.info({ name: data.name }, '[MaterialTypesService] Création de type de matériel demandée');

    const materialType = await prisma.materialType.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    logger.info(
      { id: materialType.id, name: materialType.name },
      '[MaterialTypesService] Type de matériel créé avec succès',
    );

    return materialType;
  }

  async listMaterialTypes(filters: MaterialTypeFilterDto) {
    logger.debug({ filters }, '[MaterialTypesService] Listing des types de matériel');

    const where: any = {};

    if (filters.search) {
      const search = filters.search;
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const materialTypes = await prisma.materialType.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    logger.debug(
      { count: materialTypes.length },
      '[MaterialTypesService] Listing des types de matériel terminé',
    );

    return materialTypes;
  }

  async getMaterialTypeById(id: number) {
    logger.debug({ id }, '[MaterialTypesService] Récupération du type de matériel');

    const materialType = await prisma.materialType.findUnique({
      where: { id },
    });

    if (!materialType) {
      logger.warn({ id }, '[MaterialTypesService] Type de matériel non trouvé');
    }

    return materialType;
  }

  async updateMaterialType(id: number, data: UpdateMaterialTypeDto) {
    logger.info({ id }, '[MaterialTypesService] Mise à jour de type de matériel demandée');

    const existing = await prisma.materialType.findUnique({
      where: { id },
    });

    if (!existing) {
      logger.warn({ id }, "[MaterialTypesService] Mise à jour impossible: type de matériel non trouvé");
      return null;
    }

    const materialType = await prisma.materialType.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        description: data.description !== undefined ? data.description : existing.description,
      },
    });

    logger.info(
      { id: materialType.id },
      '[MaterialTypesService] Type de matériel mis à jour avec succès',
    );

    return materialType;
  }

  async deleteMaterialType(id: number) {
    logger.info({ id }, '[MaterialTypesService] Suppression de type de matériel demandée');

    const existing = await prisma.materialType.findUnique({
      where: { id },
    });

    if (!existing) {
      logger.warn({ id }, '[MaterialTypesService] Suppression impossible: type de matériel non trouvé');
      return false;
    }

    await prisma.materialType.delete({
      where: { id },
    });

    logger.info({ id }, '[MaterialTypesService] Type de matériel supprimé avec succès');

    return true;
  }
}

