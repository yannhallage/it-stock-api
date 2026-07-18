import { Request, Response, NextFunction } from 'express';
import { MovementsService } from './movements.service';
import { validateCreateMovementDto } from './dto/create-movement.dto';
import { validateMovementFilterDto } from './dto/filter-movements.dto';

const movementsService = new MovementsService();

export class MovementsController {
  /**
   * @swagger
   * tags:
   *   name: Movements
   *   description: Gestion des mouvements de localisation des matériels
   */

  /**
   * @swagger
   * /api/movements:
   *   post:
   *     summary: Enregistre un mouvement de matériel
   *     tags: [Movements]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - assetId
   *               - movementType
   *               - movedAt
   *             properties:
   *               assetId: { type: integer }
   *               fromLocationId: { type: integer }
   *               toLocationId: { type: integer }
   *               movementType:
   *                 type: string
   *                 enum: [ENTREE, SORTIE, TRANSFERT]
   *               movedAt: { type: string, format: date-time }
   *               note: { type: string }
   *     responses:
   *       201:
   *         description: Mouvement créé
   *       400:
   *         description: Données invalides
   *       404:
   *         description: Matériel non trouvé
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateCreateMovementDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const movement = await movementsService.createMovement(value!);

      if (!movement) {
        return res.status(404).json({ message: 'Matériel non trouvé.' });
      }

      return res.status(201).json(movement);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/movements:
   *   get:
   *     summary: Liste les mouvements de matériel
   *     tags: [Movements]
   *     parameters:
   *       - in: query
   *         name: assetId
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Liste des mouvements
   *       400:
   *         description: Filtres invalides
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateMovementFilterDto(req.query);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const movements = await movementsService.listMovements(value);

      return res.status(200).json(movements);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/movements/{id}:
   *   get:
   *     summary: Récupère un mouvement par son identifiant
   *     tags: [Movements]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Mouvement trouvé
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Mouvement non trouvé
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const movement = await movementsService.getMovementById(id);

      if (!movement) {
        return res.status(404).json({ message: 'Mouvement non trouvé.' });
      }

      return res.status(200).json(movement);
    } catch (error) {
      return next(error);
    }
  };
}
