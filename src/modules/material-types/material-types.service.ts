import { prisma } from '../../prisma/client';
import { CreateMaterialTypeDto } from './dto/create-material-type.dto';
import { UpdateMaterialTypeDto } from './dto/update-material-type.dto';
import { MaterialTypeFilterDto } from './dto/filter-material-types.dto';

export class MaterialTypesService {
  async createMaterialType(data: CreateMaterialTypeDto) {
    const materialType = await prisma.materialType.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    return materialType;
  }

  async listMaterialTypes(filters: MaterialTypeFilterDto) {
    const where: any = { deletedAt: null };

    if (filters.search) {
      const search = filters.search;
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const materialTypes = await prisma.materialType.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    return materialTypes;
  }

  async getMaterialTypeById(id: number) {
    const materialType = await prisma.materialType.findFirst({
      where: { id, deletedAt: null },
    });

    return materialType;
  }

  async updateMaterialType(id: number, data: UpdateMaterialTypeDto) {
    const existing = await prisma.materialType.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return null;
    }

    const materialType = await prisma.materialType.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        description: data.description !== undefined ? data.description : existing.description,
      },
    });

    return materialType;
  }

  async deleteMaterialType(id: number) {
    const existing = await prisma.materialType.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return false;
    }

    await prisma.materialType.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return true;
  }
}
