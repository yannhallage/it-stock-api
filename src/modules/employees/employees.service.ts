import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { HttpError } from '../../errors/http-error';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeFilterDto } from './dto/filter-employees.dto';

export class EmployeesService {
  async createEmployee(data: CreateEmployeeDto) {
    try {
      const employee = await prisma.employee.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        },
      });

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

    return employees;
  }

  async getEmployeeById(id: string) {
    const employee = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    return employee;
  }

  async updateEmployee(id: string, data: UpdateEmployeeDto) {
    const existing = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
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
    const existing = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return false;
    }

    await prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return true;
  }
}
