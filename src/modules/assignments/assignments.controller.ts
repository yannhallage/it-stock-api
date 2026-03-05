import { Request, Response, NextFunction } from 'express';
import { AssignmentsService } from './assignments.service';
import { validateCreateAssignmentDto } from './dto/create-assignment.dto';
import { validateAssignmentFilterDto } from './dto/filter-assignments.dto';

const assignmentsService = new AssignmentsService();

export class AssignmentsController {
  /**
   * @swagger
   * tags:
   *   name: Assignments
   *   description: Gestion des affectations de matériels
   */

  /**
   * @swagger
   * /api/assignments:
   *   get:
   *     summary: Liste les affectations
   *     tags: [Assignments]
   *     parameters:
   *       - in: query
   *         name: assetId
   *         schema:
   *           type: integer
   *         description: Filtrer par identifiant de matériel
   *       - in: query
   *         name: activeOnly
   *         schema:
   *           type: boolean
   *         description: Si vrai, ne renvoie que les affectations actives (sans date de fin)
   *     responses:
   *       200:
   *         description: Liste des affectations
   *       400:
   *         description: Filtres invalides
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateAssignmentFilterDto(req.query);

      if (errors) {
        return res.status(400).json({
          message: 'Les filtres fournis pour lister les affectations sont invalides.',
          errors,
        });
      }

      const assignments = await assignmentsService.listAssignments(value);

      return res.status(200).json(assignments);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/assignments/all:
   *   get:
   *     summary: Liste toutes les affectations (sans filtre)
   *     tags: [Assignments]
   *     responses:
   *       200:
   *         description: Liste de toutes les affectations
   */
  listAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assignments = await assignmentsService.listAssignments({});
      return res.status(200).json(assignments);
    } catch (error) {
      return next(error);
    }
  };

  /**
   *   post:
   *     summary: Créer une nouvelle affectation pour un matériel
   *     tags: [Assignments]
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
   *               - department
   *               - user
   *               - startDate
   *             properties:
   *               department:
   *                 type: string
   *               user:
   *                 type: object
   *               startDate:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       201:
   *         description: Affectation créée (inclut les HistoryEvent créés pour l'action)
   *       400:
   *         description: Données invalides ou matériel non assignable
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

      const { value, errors } = validateCreateAssignmentDto(req.body);

      if (errors) {
        return res.status(400).json({
          message: "Les données fournies pour créer l'affectation sont invalides.",
          errors,
        });
      }

      const result = await assignmentsService.createAssignment(assetId, value!);

      if (!result) {
        return res.status(404).json({ message: 'Matériel non trouvé.' });
      }

      const { assignment, historyEvents } = result;
      return res.status(201).json({ assignment, historyEvents });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/assignments/{id}/end:
   *   post:
   *     summary: Clôturer une affectation
   *     tags: [Assignments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Identifiant de l'affectation
   *     responses:
   *       200:
   *         description: Affectation clôturée (inclut les HistoryEvent créés pour l'action)
   *       400:
   *         description: Identifiant invalide ou affectation déjà clôturée
   *       404:
   *         description: Affectation non trouvée
   */
  end = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res
          .status(400)
          .json({ message: "L'identifiant de l'affectation doit être un entier valide." });
      }

      const result = await assignmentsService.endAssignment(id);

      if (!result) {
        return res.status(404).json({ message: 'Affectation non trouvée.' });
      }

      const { assignment, historyEvents } = result;
      return res.status(200).json({ assignment, historyEvents });
    } catch (error) {
      return next(error);
    }
  };
}

