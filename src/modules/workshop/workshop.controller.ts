import { Request, Response, NextFunction } from 'express';
import { WorkshopService } from './workshop.service';
import { logger } from '../../logger';
import { validateStartRepairDto } from './dto/start-repair.dto';
import { validateCloseRepairDto } from './dto/close-repair.dto';
import { validateRepairFilterDto } from './dto/filter-repairs.dto';

const workshopService = new WorkshopService();

export class WorkshopController {
  /**
   * @swagger
   * tags:
   *   name: Atelier (Workshop)
   *   description: Gestion des réparations atelier
   */

  /**
   * @swagger
   * /api/atelier/repairs:
   *   get:
   *     summary: Liste les réparations (avec incident + matériel)
   *     tags: [Atelier (Workshop)]
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [EN_COURS, TERMINE]
   *         description: Filtrer par statut de la réparation
   *     responses:
   *       200:
   *         description: Liste des réparations
   *       400:
   *         description: Filtres invalides
   */
  listRepairs = async (req: Request, res: Response, next: NextFunction) => {
    logger.debug('[WorkshopController] GET /atelier/repairs - liste des réparations');
    try {
      const { value, errors } = validateRepairFilterDto(req.query);

      if (errors) {
        logger.warn({ errors }, '[WorkshopController] Filtres réparations invalides');
        return res.status(400).json({
          message: 'Les filtres fournis pour lister les réparations sont invalides.',
          errors,
        });
      }

      const repairs = await workshopService.listRepairs(value);
      logger.debug({ count: repairs.length }, '[WorkshopController] Liste réparations renvoyée');
      return res.status(200).json(repairs);
    } catch (error) {
      logger.error({ err: error }, '[WorkshopController] Erreur liste réparations');
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/atelier/repairs/{id}:
   *   get:
   *     summary: Récupère une réparation par son identifiant (avec incident + matériel)
   *     tags: [Atelier (Workshop)]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Réparation trouvée
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Réparation non trouvée
   */
  getRepairById = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);
    logger.debug({ id }, '[WorkshopController] GET /atelier/repairs/:id');
    try {
      if (Number.isNaN(id)) {
        return res
          .status(400)
          .json({ message: "L'identifiant de la réparation doit être un entier valide." });
      }

      const repair = await workshopService.getRepairById(id);

      if (!repair) {
        logger.warn({ id }, '[WorkshopController] Réparation non trouvée');
        return res.status(404).json({ message: 'Réparation non trouvée.' });
      }

      return res.status(200).json(repair);
    } catch (error) {
      logger.error({ err: error, id }, '[WorkshopController] Erreur get réparation par id');
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/atelier/repairs/start:
   *   post:
   *     summary: Démarrer une réparation (incident ouvert → réparation EN_COURS, matériel EN_REPARATION)
   *     tags: [Atelier (Workshop)]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - incidentId
   *               - workshopEntryDate
   *             properties:
   *               incidentId:
   *                 type: integer
   *               workshopEntryDate:
   *                 type: string
   *                 format: date-time
   *               action:
   *                 type: string
   *               cost:
   *                 type: number
   *     responses:
   *       201:
   *         description: Réparation démarrée
   *       400:
   *         description: Données invalides ou incident non ouvert / réparation déjà en cours
   *       404:
   *         description: Incident non trouvé
   */
  startRepair = async (req: Request, res: Response, next: NextFunction) => {
    logger.debug('[WorkshopController] POST /atelier/repairs/start');
    try {
      const { value, errors } = validateStartRepairDto(req.body);

      if (errors) {
        logger.warn({ errors }, '[WorkshopController] Données start réparation invalides');
        return res.status(400).json({
          message: "Les données fournies pour démarrer la réparation sont invalides.",
          errors,
        });
      }

      const result = await workshopService.startRepair(value!);

      if (!result) {
        return res.status(404).json({ message: 'Incident non trouvé.' });
      }

      logger.info(
        { repairId: result.id },
        '[WorkshopController] Réparation démarrée, réponse 201',
      );
      return res.status(201).json(result);
    } catch (error) {
      logger.error({ err: error }, '[WorkshopController] Erreur démarrage réparation');
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/atelier/repairs/{id}/close:
   *   patch:
   *     summary: Clôturer une réparation (En service → EN_SERVICE, Hors service → HORS_SERVICE)
   *     tags: [Atelier (Workshop)]
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
   *               - outcome
   *             properties:
   *               outcome:
   *                 type: string
   *                 enum: [EN_SERVICE, HORS_SERVICE]
   *     responses:
   *       200:
   *         description: Réparation clôturée
   *       400:
   *         description: Données invalides ou réparation déjà clôturée
   *       404:
   *         description: Réparation non trouvée
   */
  closeRepair = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);
    logger.debug({ id }, '[WorkshopController] PATCH /atelier/repairs/:id/close');
    try {
      if (Number.isNaN(id)) {
        return res
          .status(400)
          .json({ message: "L'identifiant de la réparation doit être un entier valide." });
      }

      const { value, errors } = validateCloseRepairDto(req.body);

      if (errors) {
        logger.warn({ errors }, '[WorkshopController] Données close réparation invalides');
        return res.status(400).json({
          message: "Les données fournies pour clôturer la réparation sont invalides.",
          errors,
        });
      }

      const updated = await workshopService.closeRepair(id, value!);

      if (!updated) {
        logger.warn({ id }, '[WorkshopController] Réparation non trouvée pour clôture');
        return res.status(404).json({ message: 'Réparation non trouvée.' });
      }

      logger.info({ repairId: id }, '[WorkshopController] Réparation clôturée, réponse 200');
      return res.status(200).json(updated);
    } catch (error) {
      logger.error({ err: error, id }, '[WorkshopController] Erreur clôture réparation');
      return next(error);
    }
  };
}
