import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { logger } from '../../logger';
import { HttpError } from '../../errors/http-error';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeFilterDto } from './dto/filter-employees.dto';

export class EmployeesService {
  async createEmployee(data: CreateEmployeeDto) {
    logger.info(
      { firstName: data.firstName, lastName: data.lastName, email: data.email },
      '[EmployeesService] Création d employé demandée',
    );

    try {
      const employee = await prisma.employee.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        },
      });

      logger.info(
        { id: employee.id },
        '[EmployeesService] Employé créé avec succès',
      );

      return employee;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new HttpError(
          409,
          'Un employé avec cet email existe déjà.',
          'EMPLOYEE_EMAIL_ALREADY_USED',
        );
      }
      throw error;
    }
  }

  async listEmployees(filters: EmployeeFilterDto) {
    logger.debug({ filters }, '[EmployeesService] Listing des employés');

    const where: Prisma.EmployeeWhereInput = { deletedAt: null };

    if (filters.search) {
      const search = filters.search;
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    logger.debug(
      { count: employees.length },
      '[EmployeesService] Listing des employés terminé',
    );

    return employees;
  }

  async getEmployeeById(id: string) {
    logger.debug({ id }, '[EmployeesService] Récupération de l employé');

    const employee = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    if (!employee) {
      logger.warn({ id }, '[EmployeesService] Employé non trouvé');
    }

    return employee;
  }

  async updateEmployee(id: string, data: UpdateEmployeeDto) {
    logger.info({ id }, '[EmployeesService] Mise à jour d employé demandée');

    const existing = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      logger.warn({ id }, '[EmployeesService] Mise à jour impossible: employé non trouvé');
      return null;
    }

    try {
      const employee = await prisma.employee.update({
        where: { id },
        data: {
          firstName: data.firstName ?? existing.firstName,
          lastName: data.lastName ?? existing.lastName,
          email: data.email !== undefined ? data.email : existing.email,
        },
      });

      logger.info({ id: employee.id }, '[EmployeesService] Employé mis à jour avec succès');

      return employee;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new HttpError(
          409,
          'Un employé avec cet email existe déjà.',
          'EMPLOYEE_EMAIL_ALREADY_USED',
        );
      }
      throw error;
    }
  }

  async deleteEmployee(id: string) {
    logger.info({ id }, '[EmployeesService] Suppression d employé demandée');

    const existing = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      logger.warn({ id }, '[EmployeesService] Suppression impossible: employé non trouvé');
      return false;
    }

    await prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info({ id }, '[EmployeesService] Employé supprimé avec succès');

    return true;
  }
}
