import { prisma } from '../../prisma/client';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationFilterDto } from './dto/filter-locations.dto';

export class LocationsService {
  async createLocation(data: CreateLocationDto) {
    const location = await prisma.location.create({
      data: {
        name: data.name,
        building: data.building,
        floor: data.floor,
        room: data.room,
      },
    });

    return location;
  }

  async listLocations(filters: LocationFilterDto) {
    const where: any = { deletedAt: null };

    if (filters.search) {
      const search = filters.search;
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { building: { contains: search, mode: 'insensitive' } },
        { floor: { contains: search, mode: 'insensitive' } },
        { room: { contains: search, mode: 'insensitive' } },
      ];
    }

    const locations = await prisma.location.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    return locations;
  }

  async getLocationById(id: number) {
    const location = await prisma.location.findFirst({
      where: { id, deletedAt: null },
    });

    return location;
  }

  async updateLocation(id: number, data: UpdateLocationDto) {
    const existing = await prisma.location.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return null;
    }

    const location = await prisma.location.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        building: data.building !== undefined ? data.building : existing.building,
        floor: data.floor !== undefined ? data.floor : existing.floor,
        room: data.room !== undefined ? data.room : existing.room,
      },
    });

    return location;
  }

  async deleteLocation(id: number) {
    const existing = await prisma.location.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return false;
    }

    await prisma.location.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return true;
  }
}
