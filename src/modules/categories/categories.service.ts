import { prisma } from '../../prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryFilterDto } from './dto/filter-categories.dto';

export class CategoriesService {
  async createCategory(data: CreateCategoryDto) {
    const category = await prisma.category.create({
      data: {
        name: data.name,
      },
    });

    return category;
  }

  async listCategories(filters: CategoryFilterDto) {
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

    return categories;
  }

  async getCategoryById(id: number) {
    const category = await prisma.category.findFirst({
      where: { id, deletedAt: null },
    });

    return category;
  }

  async updateCategory(id: number, data: UpdateCategoryDto) {
    const existing = await prisma.category.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return null;
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
      },
    });

    return category;
  }

  async deleteCategory(id: number) {
    const existing = await prisma.category.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return false;
    }

    await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return true;
  }
}
