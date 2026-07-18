import { prisma } from '../../prisma/client';
import { logger } from '../../logger';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandFilterDto } from './dto/filter-brands.dto';

export class BrandsService {
  async createBrand(data: CreateBrandDto) {
    logger.info({ name: data.name }, '[BrandsService] Création de marque demandée');

    const brand = await prisma.brand.create({
      data: {
        name: data.name,
      },
    });

    logger.info({ id: brand.id, name: brand.name }, '[BrandsService] Marque créée avec succès');

    return brand;
  }

  async listBrands(filters: BrandFilterDto) {
    logger.debug({ filters }, '[BrandsService] Listing des marques');

    const where: any = { deletedAt: null };

    if (filters.search) {
      const search = filters.search;
      where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
    }

    const brands = await prisma.brand.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    logger.debug({ count: brands.length }, '[BrandsService] Listing des marques terminé');

    return brands;
  }

  async getBrandById(id: number) {
    logger.debug({ id }, '[BrandsService] Récupération de la marque');

    const brand = await prisma.brand.findFirst({
      where: { id, deletedAt: null },
    });

    if (!brand) {
      logger.warn({ id }, '[BrandsService] Marque non trouvée');
    }

    return brand;
  }

  async updateBrand(id: number, data: UpdateBrandDto) {
    logger.info({ id }, '[BrandsService] Mise à jour de marque demandée');

    const existing = await prisma.brand.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      logger.warn({ id }, '[BrandsService] Mise à jour impossible: marque non trouvée');
      return null;
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
      },
    });

    logger.info({ id: brand.id }, '[BrandsService] Marque mise à jour avec succès');

    return brand;
  }

  async deleteBrand(id: number) {
    logger.info({ id }, '[BrandsService] Suppression de marque demandée');

    const existing = await prisma.brand.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      logger.warn({ id }, '[BrandsService] Suppression impossible: marque non trouvée');
      return false;
    }

    await prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info({ id }, '[BrandsService] Marque supprimée avec succès');

    return true;
  }
}
