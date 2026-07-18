import { prisma } from '../../prisma/client';
import { logger } from '../../logger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryFilterDto } from './dto/filter-categories.dto';

export class CategoriesService {
  async createCategory(data: CreateCategoryDto) {
    logger.info({ name: data.name }, '[CategoriesService] Création de catégorie demandée');

    const category = await prisma.category.create({
      data: {
        name: data.name,
      },
    });

    logger.info(
      { id: category.id, name: category.name },
      '[CategoriesService] Catégorie créée avec succès',
    );

    return category;
  }

  async listCategories(filters: CategoryFilterDto) {
    logger.debug({ filters }, '[CategoriesService] Listing des catégories');

    const where: any = { deletedAt: null };

    if (filters.search) {
      const search = filters.search;
      where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    logger.debug(
      { count: categories.length },
      '[CategoriesService] Listing des catégories terminé',
    );

    return categories;
  }

  async getCategoryById(id: number) {
    logger.debug({ id }, '[CategoriesService] Récupération de la catégorie');

    const category = await prisma.category.findFirst({
      where: { id, deletedAt: null },
    });

    if (!category) {
      logger.warn({ id }, '[CategoriesService] Catégorie non trouvée');
    }

    return category;
  }

  async updateCategory(id: number, data: UpdateCategoryDto) {
    logger.info({ id }, '[CategoriesService] Mise à jour de catégorie demandée');

    const existing = await prisma.category.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      logger.warn({ id }, '[CategoriesService] Mise à jour impossible: catégorie non trouvée');
      return null;
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
      },
    });

    logger.info({ id: category.id }, '[CategoriesService] Catégorie mise à jour avec succès');

    return category;
  }

  async deleteCategory(id: number) {
    logger.info({ id }, '[CategoriesService] Suppression de catégorie demandée');

    const existing = await prisma.category.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      logger.warn({ id }, '[CategoriesService] Suppression impossible: catégorie non trouvée');
      return false;
    }

    await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info({ id }, '[CategoriesService] Catégorie supprimée avec succès');

    return true;
  }
}
