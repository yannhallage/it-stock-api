import { Request, Response, NextFunction } from 'express';
import { IncidentsService } from './incidents.service';
import { validateCreateIncidentDto } from './dto/create-incident.dto';
import { validateIncidentFilterDto } from './dto/filter-incidents.dto';
import { validateUpdateIncidentDto } from './dto/update-incident.dto';

const incidentsService = new IncidentsService();

export class IncidentsController {
  /**
   * @swagger
   * tags:
   *   name: Incidents
   *   description: Gestion des incidents sur les matériels
   */

  /**
   * @swagger
   * /api/incidents:
   *   get:
   *     summary: Liste les incidents
   *     tags: [Incidents]
   *     parameters:
   *       - in: query
   *         name: assetId
   *         schema:
   *           type: integer
   *         description: Filtrer par identifiant de matériel
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [OUVERT, CLOS]
   *         description: Filtrer par statut de l'incident
   *     responses:
   *       200:
   *         description: Liste des incidents
   *       400:
   *         description: Filtres invalides
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateIncidentFilterDto(req.query);

      if (errors) {
        return res.status(400).json({
          message: 'Les filtres fournis pour lister les incidents sont invalides.',
          errors,
        });
      }

      const incidents = await incidentsService.listIncidents(value);

      return res.status(200).json(incidents);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/incidents/{id}:
   *   get:
   *     summary: Récupère un incident par son identifiant
   *     tags: [Incidents]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Incident trouvé
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Incident non trouvé
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res
          .status(400)
          .json({ message: "L'identifiant de l'incident doit être un entier valide." });
      }

      const incident = await incidentsService.getById(id);

      if (!incident) {
        return res.status(404).json({ message: 'Incident non trouvé.' });
      }

      return res.status(200).json(incident);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/assets/{id}/incidents:
   *   post:
   *     summary: Signaler un incident sur un matériel
   *     tags: [Incidents]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Identifiant du matériel
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - description
   *               - reportedAt
   *               - department
   *             properties:
   *               description:
   *                 type: string
   *               reportedAt:
   *                 type: string
   *                 format: date-time
   *               department:
   *                 type: string
   *     responses:
   *       201:
   *         description: Incident créé (inclut les HistoryEvent)
   *       400:
   *         description: Données invalides
   *       404:
   *         description: Matériel non trouvé
   */
  createForAsset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assetId = parseInt(req.params.id, 10);

      if (Number.isNaN(assetId)) {
        return res
          .status(400)
          .json({ message: "L'identifiant du matériel doit être un entier valide." });
      }

      const { value, errors } = validateCreateIncidentDto(req.body);

      if (errors) {
        return res.status(400).json({
          message: "Les données fournies pour créer l'incident sont invalides.",
          errors,
        });
      }

      const result = await incidentsService.createForAsset(assetId, value!);

      if (!result) {
        return res.status(404).json({ message: 'Matériel non trouvé.' });
      }

      const { incident, historyEvents } = result;
      return res.status(201).json({ incident, historyEvents });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/incidents/{id}/status:
   *   patch:
   *     summary: Met à jour le statut d'un incident (ex. clôture)
   *     tags: [Incidents]
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
   *                 enum: [OUVERT, CLOS]
   *     responses:
   *       200:
   *         description: Statut mis à jour
   *       400:
   *         description: Données invalides ou statut inchangé
   *       404:
   *         description: Incident non trouvé
   */
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res
          .status(400)
          .json({ message: "L'identifiant de l'incident doit être un entier valide." });
      }

      const { value, errors } = validateUpdateIncidentDto(req.body);

      if (errors) {
        return res.status(400).json({
          message: "Les données fournies pour mettre à jour l'incident sont invalides.",
          errors,
        });
      }

      const updated = await incidentsService.updateStatus(id, value!);

      if (!updated) {
        return res.status(404).json({ message: 'Incident non trouvé.' });
      }

      return res.status(200).json(updated);
    } catch (error) {
      return next(error);
    }
  };
}
