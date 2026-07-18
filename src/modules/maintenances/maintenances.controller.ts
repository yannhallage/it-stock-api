import { Request, Response, NextFunction } from 'express';
import { MaintenancesService } from './maintenances.service';
import { validateCreateMaintenanceDto } from './dto/create-maintenance.dto';
import { validateUpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { validateMaintenanceFilterDto } from './dto/filter-maintenances.dto';
import { validateUpdateMaintenanceStatusDto } from './dto/update-maintenance-status.dto';

const maintenancesService = new MaintenancesService();

export class MaintenancesController {
  /**
   * @swagger
   * tags:
   *   name: Maintenances
   *   description: Gestion des maintenances préventives et curatives
   */

  /**
   * @swagger
   * /api/maintenances:
   *   post:
   *     summary: Crée une maintenance
   *     tags: [Maintenances]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - assetId
   *               - title
   *               - scheduledDate
   *             properties:
   *               assetId: { type: integer }
   *               title: { type: string }
   *               description: { type: string }
   *               scheduledDate: { type: string, format: date-time }
   *               completedDate: { type: string, format: date-time }
   *               technician: { type: string }
   *               cost: { type: number }
   *     responses:
   *       201:
   *         description: Maintenance créée
   *       400:
   *         description: Données invalides
   *       404:
   *         description: Matériel non trouvé
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateCreateMaintenanceDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const maintenance = await maintenancesService.createMaintenance(value!);

      if (!maintenance) {
        return res.status(404).json({ message: 'Matériel non trouvé.' });
      }

      return res.status(201).json(maintenance);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/maintenances:
   *   get:
   *     summary: Liste les maintenances
   *     tags: [Maintenances]
   *     parameters:
   *       - in: query
   *         name: assetId
   *         schema:
   *           type: integer
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [PLANIFIEE, EN_COURS, TERMINEE, ANNULEE]
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Recherche sur le titre
   *     responses:
   *       200:
   *         description: Liste des maintenances
   *       400:
   *         description: Filtres invalides
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateMaintenanceFilterDto(req.query);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const maintenances = await maintenancesService.listMaintenances(value);

      return res.status(200).json(maintenances);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/maintenances/{id}:
   *   get:
   *     summary: Récupère une maintenance par son identifiant
   *     tags: [Maintenances]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Maintenance trouvée
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Maintenance non trouvée
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const maintenance = await maintenancesService.getMaintenanceById(id);

      if (!maintenance) {
        return res.status(404).json({ message: 'Maintenance non trouvée.' });
      }

      return res.status(200).json(maintenance);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/maintenances/{id}:
   *   put:
   *     summary: Met à jour une maintenance
   *     tags: [Maintenances]
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
   *               title: { type: string }
   *               description: { type: string }
   *               scheduledDate: { type: string, format: date-time }
   *               completedDate: { type: string, format: date-time }
   *               technician: { type: string }
   *               cost: { type: number }
   *     responses:
   *       200:
   *         description: Maintenance mise à jour
   *       400:
   *         description: Données invalides
   *       404:
   *         description: Maintenance non trouvée
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const { value, errors } = validateUpdateMaintenanceDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const maintenance = await maintenancesService.updateMaintenance(id, value!);

      if (!maintenance) {
        return res.status(404).json({ message: 'Maintenance non trouvée.' });
      }

      return res.status(200).json(maintenance);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/maintenances/{id}/status:
   *   patch:
   *     summary: Met à jour le statut d'une maintenance
   *     tags: [Maintenances]
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
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [PLANIFIEE, EN_COURS, TERMINEE, ANNULEE]
   *     responses:
   *       200:
   *         description: Statut mis à jour
   *       400:
   *         description: Données invalides
   *       404:
   *         description: Maintenance non trouvée
   */
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const { value, errors } = validateUpdateMaintenanceStatusDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const maintenance = await maintenancesService.updateMaintenanceStatus(id, value!);

      if (!maintenance) {
        return res.status(404).json({ message: 'Maintenance non trouvée.' });
      }

      return res.status(200).json(maintenance);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/maintenances/{id}:
   *   delete:
   *     summary: Supprime une maintenance
   *     tags: [Maintenances]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Maintenance supprimée
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Maintenance non trouvée
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const deleted = await maintenancesService.deleteMaintenance(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Maintenance non trouvée.' });
      }

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}
