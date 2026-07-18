import { Request, Response, NextFunction } from 'express';
import { LocationsService } from './locations.service';
import { validateCreateLocationDto } from './dto/create-location.dto';
import { validateUpdateLocationDto } from './dto/update-location.dto';
import { validateLocationFilterDto } from './dto/filter-locations.dto';

const locationsService = new LocationsService();

export class LocationsController {
  /**
   * @swagger
   * tags:
   *   name: Locations
   *   description: Gestion des emplacements
   */

  /**
   * @swagger
   * /api/locations:
   *   post:
   *     summary: Ajoute un emplacement
   *     tags: [Locations]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *               building:
   *                 type: string
   *               floor:
   *                 type: string
   *               room:
   *                 type: string
   *     responses:
   *       201:
   *         description: Emplacement créé
   *       400:
   *         description: Données invalides
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateCreateLocationDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const location = await locationsService.createLocation(value!);

      return res.status(201).json(location);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/locations:
   *   get:
   *     summary: Liste les emplacements avec recherche
   *     tags: [Locations]
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Recherche par nom, bâtiment, étage ou salle
   *     responses:
   *       200:
   *         description: Liste des emplacements
   *       400:
   *         description: Filtres invalides
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateLocationFilterDto(req.query);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const locations = await locationsService.listLocations(value);

      return res.status(200).json(locations);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/locations/{id}:
   *   get:
   *     summary: Récupère le détail d'un emplacement
   *     tags: [Locations]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Détail de l'emplacement
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Emplacement non trouvé
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const location = await locationsService.getLocationById(id);

      if (!location) {
        return res.status(404).json({ message: 'Emplacement non trouvé.' });
      }

      return res.status(200).json(location);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/locations/{id}:
   *   put:
   *     summary: Met à jour un emplacement
   *     tags: [Locations]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               building:
   *                 type: string
   *               floor:
   *                 type: string
   *               room:
   *                 type: string
   *     responses:
   *       200:
   *         description: Emplacement mis à jour
   *       400:
   *         description: Données invalides
   *       404:
   *         description: Emplacement non trouvé
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const { value, errors } = validateUpdateLocationDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const location = await locationsService.updateLocation(id, value!);

      if (!location) {
        return res.status(404).json({ message: 'Emplacement non trouvé.' });
      }

      return res.status(200).json(location);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/locations/{id}:
   *   delete:
   *     summary: Supprime un emplacement
   *     tags: [Locations]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Emplacement supprimé
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Emplacement non trouvé
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const deleted = await locationsService.deleteLocation(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Emplacement non trouvé.' });
      }

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}
