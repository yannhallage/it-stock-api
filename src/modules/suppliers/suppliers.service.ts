import { prisma } from '../../prisma/client';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierFilterDto } from './dto/filter-suppliers.dto';

export class SuppliersService {
  async createSupplier(data: CreateSupplierDto) {
    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        contact: data.contact,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    });

    return supplier;
  }

  async listSuppliers(filters: SupplierFilterDto) {
    const where: any = { deletedAt: null };

    if (filters.search) {
      const search = filters.search;
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    return suppliers;
  }

  async getSupplierById(id: number) {
    const supplier = await prisma.supplier.findFirst({
      where: { id, deletedAt: null },
    });

    return supplier;
  }

  async updateSupplier(id: number, data: UpdateSupplierDto) {
    const existing = await prisma.supplier.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return null;
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        contact: data.contact !== undefined ? data.contact : existing.contact,
        email: data.email !== undefined ? data.email : existing.email,
        phone: data.phone !== undefined ? data.phone : existing.phone,
        address: data.address !== undefined ? data.address : existing.address,
      },
    });

    return supplier;
  }

  async deleteSupplier(id: number) {
    const existing = await prisma.supplier.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return false;
    }

    await prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return true;
  }
}
