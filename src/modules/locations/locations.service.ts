import { prisma } from '../../prisma/client';
import { logger } from '../../logger';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationFilterDto } from './dto/filter-locations.dto';

export class LocationsService {
  async createLocation(data: CreateLocationDto) {
    logger.info({ name: data.name }, '[LocationsService] Création d\'emplacement demandée');

    const location = await prisma.location.create({
      data: {
        name: data.name,
        building: data.building,
        floor: data.floor,
        room: data.room,
      },
    });

    logger.info(
      { id: location.id, name: location.name },
      '[LocationsService] Emplacement créé avec succès',
    );

    return location;
  }

  async listLocations(filters: LocationFilterDto) {
    logger.debug({ filters }, '[LocationsService] Listing des emplacements');

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

    logger.debug(
      { count: locations.length },
      '[LocationsService] Listing des emplacements terminé',
    );

    return locations;
  }

  async getLocationById(id: number) {
    logger.debug({ id }, '[LocationsService] Récupération de l\'emplacement');

    const location = await prisma.location.findFirst({
      where: { id, deletedAt: null },
    });

    if (!location) {
      logger.warn({ id }, '[LocationsService] Emplacement non trouvé');
    }

    return location;
  }

  async updateLocation(id: number, data: UpdateLocationDto) {
    logger.info({ id }, '[LocationsService] Mise à jour d\'emplacement demandée');

    const existing = await prisma.location.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      logger.warn({ id }, '[LocationsService] Mise à jour impossible: emplacement non trouvé');
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

    logger.info({ id: location.id }, '[LocationsService] Emplacement mis à jour avec succès');

    return location;
  }

  async deleteLocation(id: number) {
    logger.info({ id }, '[LocationsService] Suppression d\'emplacement demandée');

    const existing = await prisma.location.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      logger.warn({ id }, '[LocationsService] Suppression impossible: emplacement non trouvé');
      return false;
    }

    await prisma.location.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info({ id }, '[LocationsService] Emplacement supprimé avec succès');

    return true;
  }
}
