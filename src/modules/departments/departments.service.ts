import { prisma } from '../../prisma/client';
import { logger } from '../../logger';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentFilterDto } from './dto/filter-departments.dto';

export class DepartmentsService {
  async createDepartment(data: CreateDepartmentDto) {
    logger.info({ name: data.name }, '[DepartmentsService] Création de département demandée');

    const department = await prisma.department.create({
      data: {
        name: data.name,
      },
    });

    logger.info(
      { id: department.id, name: department.name },
      '[DepartmentsService] Département créé avec succès',
    );

    return department;
  }

  async listDepartments(filters: DepartmentFilterDto) {
    logger.debug({ filters }, '[DepartmentsService] Listing des départements');

    const where: any = { deletedAt: null };

    if (filters.search) {
      const search = filters.search;
      where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
    }

    const departments = await prisma.department.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    logger.debug(
      { count: departments.length },
      '[DepartmentsService] Listing des départements terminé',
    );

    return departments;
  }

  async getDepartmentById(id: number) {
    logger.debug({ id }, '[DepartmentsService] Récupération du département');

    const department = await prisma.department.findFirst({
      where: { id, deletedAt: null },
    });

    if (!department) {
      logger.warn({ id }, '[DepartmentsService] Département non trouvé');
    }

    return department;
  }

  async updateDepartment(id: number, data: UpdateDepartmentDto) {
    logger.info({ id }, '[DepartmentsService] Mise à jour de département demandée');

    const existing = await prisma.department.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      logger.warn({ id }, '[DepartmentsService] Mise à jour impossible: département non trouvé');
      return null;
    }

    const department = await prisma.department.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
      },
    });

    logger.info({ id: department.id }, '[DepartmentsService] Département mis à jour avec succès');

    return department;
  }

  async deleteDepartment(id: number) {
    logger.info({ id }, '[DepartmentsService] Suppression de département demandée');

    const existing = await prisma.department.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      logger.warn({ id }, '[DepartmentsService] Suppression impossible: département non trouvé');
      return false;
    }

    await prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info({ id }, '[DepartmentsService] Département supprimé avec succès');

    return true;
  }
}
