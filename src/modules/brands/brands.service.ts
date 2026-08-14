import { prisma } from '../../prisma/client';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandFilterDto } from './dto/filter-brands.dto';

export class BrandsService {
  async createBrand(data: CreateBrandDto) {
    const brand = await prisma.brand.create({
      data: {
        name: data.name,
      },
    });

    return brand;
  }

  async listBrands(filters: BrandFilterDto) {
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

    return brands;
  }

  async getBrandById(id: number) {
    const brand = await prisma.brand.findFirst({
      where: { id, deletedAt: null },
    });

    return brand;
  }

  async updateBrand(id: number, data: UpdateBrandDto) {
    const existing = await prisma.brand.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return null;
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
      },
    });

    return brand;
  }

  async deleteBrand(id: number) {
    const existing = await prisma.brand.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return false;
    }

    await prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return true;
  }
}
