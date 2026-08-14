import { NextFunction, Request, Response } from 'express';
import { ImpressionService } from './impression.service';
import { AuthRequest } from '../auth/auth.middleware';
import { validateAssetFilterDto } from '../stocks/dto/filter-assets.dto';

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
  printAssets = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateAssetFilterDto(req.query);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const pdfBuffer = await impressionService.printAssets(value);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="assets-report.pdf"');
      return res.status(200).send(pdfBuffer);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/impression/printInventory:
   *   get:
   *     summary: Génère le rapport PDF inventaire / parc informatique
   *     tags: [Impression]
   *     responses:
   *       200:
   *         description: PDF généré avec succès
   *         content:
   *           application/pdf:
   *             schema:
   *               type: string
   *               format: binary
   */
  printInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateAssetFilterDto(req.query);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const pdfBuffer = await impressionService.printInventory(value);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="inventaire-parc.pdf"');
      return res.status(200).send(pdfBuffer);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/impression/printSignaleticSheets:
   *   get:
   *     summary: Génère les fiches signalétiques inventaire physique
   *     tags: [Impression]
   */
  printSignaleticSheets = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateAssetFilterDto(req.query);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const pdfBuffer = await impressionService.printSignaleticSheets(value);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="fiches-signaletiques.pdf"',
      );
      return res.status(200).send(pdfBuffer);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/impression/printAsset/{inventoryNumber}:
   *   get:
   *     summary: Genere la fiche PDF d'un materiel par numero d'inventaire
   *     tags: [Impression]
   *     parameters:
   *       - in: path
   *         name: inventoryNumber
   *         required: true
   *         schema:
   *           type: string
   *         description: Numero d'inventaire du materiel
   *     responses:
   *       200:
   *         description: PDF genere avec succes
   *         content:
   *           application/pdf:
   *             schema:
   *               type: string
   *               format: binary
   *       400:
   *         description: Numero d'inventaire manquant
   *       404:
   *         description: Materiel non trouve
   *       500:
   *         description: Erreur serveur
   */
  printAsset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inventoryNumber =
        this.readFirstText(req.params.inventoryNumber) ||
        this.readFirstText(req.query.inventoryNumber) ||
        this.readFirstText(req.query.numero) ||
        this.readFirstText(req.query.number);

      if (!inventoryNumber) {
        return res.status(400).json({
          message: "Le parametre 'inventoryNumber' ou 'numero' est obligatoire.",
        });
      }

      const pdfBuffer = await impressionService.printAsset(inventoryNumber);
      const filename = this.sanitizeFileName(`materiel-${inventoryNumber}.pdf`);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(pdfBuffer);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/impression/printScreenLoans:
   *   get:
   *     summary: Genere le rapport PDF de tous les emprunts
   *     tags: [Impression]
   *     responses:
   *       200:
   *         description: PDF genere avec succes
   *         content:
   *           application/pdf:
   *             schema:
   *               type: string
   *               format: binary
   *       500:
   *         description: Erreur serveur
   */
  printScreenLoans = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const pdfBuffer = await impressionService.printScreenLoans();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="screen-loans-report.pdf"');
      return res.status(200).send(pdfBuffer);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/impression/printScreenLoan/{loanId}:
   *   get:
   *     summary: Genere la fiche PDF d'un emprunt par identifiant
   *     tags: [Impression]
   *     parameters:
   *       - in: path
   *         name: loanId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Identifiant de l'emprunt
   *     responses:
   *       200:
   *         description: PDF genere avec succes
   *         content:
   *           application/pdf:
   *             schema:
   *               type: string
   *               format: binary
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Emprunt non trouve
   *       500:
   *         description: Erreur serveur
   */
  printScreenLoan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawLoanId =
        this.readFirstText(req.params.loanId) ||
        this.readFirstText(req.query.loanId) ||
        this.readFirstText(req.query.id);
      const loanId = Number.parseInt(rawLoanId, 10);

      if (Number.isNaN(loanId) || loanId <= 0) {
        return res.status(400).json({
          message: "Le parametre 'loanId' doit etre un entier positif.",
        });
      }

      const pdfBuffer = await impressionService.printScreenLoan(loanId);
      const filename = this.sanitizeFileName(`emprunt-${loanId}.pdf`);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(pdfBuffer);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/impression/printAssigment:
   *   get:
   *     summary: Génère la liste PDF de toutes les affectations, ou une fiche si assignmentId est fourni
   *     tags: [Impression]
   *     parameters:
   *       - in: query
   *         name: assignmentId
   *         required: false
   *         schema:
   *           type: integer
   *         description: Si fourni, imprime la fiche d'une affectation. Sinon, imprime la liste de toutes.
   *     responses:
   *       200:
   *         description: PDF généré avec succès
   *         content:
   *           application/pdf:
   *             schema:
   *               type: string
   *               format: binary
   *       400:
   *         description: assignmentId invalide
   *       404:
   *         description: Affectation non trouvée
   *       500:
   *         description: Erreur serveur
   */
  printAssigment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const rawAssignmentId = this.readFirstText(req.query.assignmentId);

      let assignmentId: number | undefined;
      if (rawAssignmentId) {
        const parsed = Number.parseInt(rawAssignmentId, 10);
        if (Number.isNaN(parsed) || parsed <= 0) {
          return res.status(400).json({
            message: "Le parametre 'assignmentId' doit etre un entier positif.",
          });
        }
        assignmentId = parsed;
      }

      const pdfBuffer = await impressionService.printAssigment(assignmentId, authReq.user);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="assignments-report.pdf"');
      return res.status(200).send(pdfBuffer);
    } catch (error) {
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
      return next(error);
    }
  };

  private readFirstText(value: unknown): string {
    if (Array.isArray(value)) return this.readFirstText(value[0]);
    return typeof value === 'string' ? value.trim() : '';
  }

  private sanitizeFileName(value: string): string {
    return value.replace(/[^a-zA-Z0-9._-]/g, '_');
  }
}
