import { prisma } from '../../prisma/client';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentFilterDto } from './dto/filter-departments.dto';

export class DepartmentsService {
  async createDepartment(data: CreateDepartmentDto) {
    const department = await prisma.department.create({
      data: {
        name: data.name,
      },
    });

    return department;
  }

  async listDepartments(filters: DepartmentFilterDto) {
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

    return departments;
  }

  async getDepartmentById(id: number) {
    const department = await prisma.department.findFirst({
      where: { id, deletedAt: null },
    });

    return department;
  }

  async updateDepartment(id: number, data: UpdateDepartmentDto) {
    const existing = await prisma.department.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return null;
    }

    const department = await prisma.department.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
      },
    });

    return department;
  }

  async deleteDepartment(id: number) {
    const existing = await prisma.department.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return false;
    }

    await prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return true;
  }
}
