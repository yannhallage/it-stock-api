import { prisma } from '../../prisma/client';
import { logger } from '../../logger';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierFilterDto } from './dto/filter-suppliers.dto';

export class SuppliersService {
  async createSupplier(data: CreateSupplierDto) {
    logger.info({ name: data.name }, '[SuppliersService] Création de fournisseur demandée');

    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        contact: data.contact,
        address: data.address,
      },
    });

    logger.info({ id: supplier.id, name: supplier.name }, '[SuppliersService] Fournisseur créé avec succès');

    return supplier;
  }

  async listSuppliers(filters: SupplierFilterDto) {
    logger.debug({ filters }, '[SuppliersService] Listing des fournisseurs');

    const where: any = {};

    if (filters.search) {
      const search = filters.search;
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    logger.debug({ count: suppliers.length }, '[SuppliersService] Listing des fournisseurs terminé');

    return suppliers;
  }

  async getSupplierById(id: number) {
    logger.debug({ id }, '[SuppliersService] Récupération du fournisseur');

    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      logger.warn({ id }, '[SuppliersService] Fournisseur non trouvé');
    }

    return supplier;
  }

  async updateSupplier(id: number, data: UpdateSupplierDto) {
    logger.info({ id }, '[SuppliersService] Mise à jour de fournisseur demandée');

    const existing = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existing) {
      logger.warn({ id }, "[SuppliersService] Mise à jour impossible: fournisseur non trouvé");
      return null;
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        contact: data.contact !== undefined ? data.contact : existing.contact,
        address: data.address !== undefined ? data.address : existing.address,
      },
    });

    logger.info({ id: supplier.id }, '[SuppliersService] Fournisseur mis à jour avec succès');

    return supplier;
  }

  async deleteSupplier(id: number) {
    logger.info({ id }, '[SuppliersService] Suppression de fournisseur demandée');

    const existing = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existing) {
      logger.warn({ id }, '[SuppliersService] Suppression impossible: fournisseur non trouvé');
      return false;
    }

    await prisma.supplier.delete({
      where: { id },
    });

    logger.info({ id }, '[SuppliersService] Fournisseur supprimé avec succès');

    return true;
  }
}

