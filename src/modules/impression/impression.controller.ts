import { NextFunction, Request, Response } from 'express';
import { ImpressionService } from './impression.service';
import { logger } from '../../logger';
import { AuthRequest } from '../auth/auth.middleware';

const impressionService = new ImpressionService();

export class ImpressionController {
  /**
   * @swagger
   * tags:
   *   name: Impression
   *   description: Impression des rapports PDF
   */

  /**
   * @swagger
   * /api/impression/printAssets:
   *   get:
   *     summary: Génère le rapport PDF des assets
   *     tags: [Impression]
   *     responses:
   *       200:
   *         description: PDF généré avec succès
   *         content:
   *           application/pdf:
   *             schema:
   *               type: string
   *               format: binary
   *       500:
   *         description: Erreur serveur
   */
  printAssets = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const pdfBuffer = await impressionService.printAssets();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="assets-report.pdf"');
      return res.status(200).send(pdfBuffer);
    } catch (error) {
      logger.error({ err: error }, '[ImpressionController] Erreur impression assets');
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/impression/printAssigment:
   *   get:
   *     summary: Génère le rapport PDF des assignations
   *     tags: [Impression]
   *     responses:
   *       200:
   *         description: PDF généré avec succès
   *         content:
   *           application/pdf:
   *             schema:
   *               type: string
   *               format: binary
   *       500:
   *         description: Erreur serveur
   */
  printAssigment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assignmentId = Number.parseInt(String(req.query.assignmentId ?? ''), 10);
      const authReq = req as AuthRequest;

      if (Number.isNaN(assignmentId) || assignmentId <= 0) {
        return res.status(400).json({
          message: "Le parametre 'assignmentId' doit etre un entier positif.",
        });
      }

      const pdfBuffer = await impressionService.printAssigment(assignmentId, authReq.user);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="assignments-report.pdf"');
      return res.status(200).send(pdfBuffer);
    } catch (error) {
      logger.error({ err: error }, '[ImpressionController] Erreur impression assignments');
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/impression/printSuppliers:
   *   get:
   *     summary: Génère le rapport PDF des fournisseurs
   *     tags: [Impression]
   *     responses:
   *       200:
   *         description: PDF généré avec succès
   *         content:
   *           application/pdf:
   *             schema:
   *               type: string
   *               format: binary
   *       500:
   *         description: Erreur serveur
   */
  printSuppliers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const pdfBuffer = await impressionService.printSuppliers();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="suppliers-report.pdf"');
      return res.status(200).send(pdfBuffer);
    } catch (error) {
      logger.error({ err: error }, '[ImpressionController] Erreur impression suppliers');
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/impression/printIncidents:
   *   get:
   *     summary: Génère le rapport PDF des incidents
   *     tags: [Impression]
   *     responses:
   *       200:
   *         description: PDF généré avec succès
   *         content:
   *           application/pdf:
   *             schema:
   *               type: string
   *               format: binary
   *       500:
   *         description: Erreur serveur
   */
  printIncidents = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const pdfBuffer = await impressionService.printIncidents();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="incidents-report.pdf"');
      return res.status(200).send(pdfBuffer);
    } catch (error) {
      logger.error({ err: error }, '[ImpressionController] Erreur impression incidents');
      return next(error);
    }
  };
}
