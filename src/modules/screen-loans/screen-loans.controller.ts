import { Request, Response, NextFunction } from 'express';
import { ScreenLoansService } from './screen-loans.service';
import { validateCreateScreenLoanDto } from './dto/create-screen-loan.dto';
import { validateScreenLoanFilterDto } from './dto/filter-screen-loans.dto';

const screenLoansService = new ScreenLoansService();

export class ScreenLoansController {
  /**
   * @swagger
   * tags:
   *   name: ScreenLoans
   *   description: Gestion des emprunts d'écrans
   */

  /**
   * @swagger
   * /api/screen-loans:
   *   post:
   *     summary: Enregistre un emprunt d'écran
   *     tags: [ScreenLoans]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - assetId
   *               - borrowerName
   *               - loanDate
   *               - expectedReturnDate
   *             properties:
   *               assetId: { type: integer }
   *               borrowerName: { type: string }
   *               loanDate: { type: string, format: date-time }
   *               expectedReturnDate: { type: string, format: date-time }
   *     responses:
   *       201:
   *         description: Emprunt créé
   *       400:
   *         description: Données invalides ou emprunt déjà actif
   *       404:
   *         description: Matériel non trouvé
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateCreateScreenLoanDto(req.body);
      if (errors) {
        return res.status(400).json({
          message: "Les données fournies pour créer l'emprunt d'écran sont invalides.",
          errors,
        });
      }

      const loan = await screenLoansService.createLoan(value!);
      if (!loan) {
        return res.status(404).json({ message: 'Matériel non trouvé.' });
      }

      return res.status(201).json(loan);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/screen-loans:
   *   get:
   *     summary: Liste les emprunts d'écrans
   *     tags: [ScreenLoans]
   *     parameters:
   *       - in: query
   *         name: borrowerName
   *         schema:
   *           type: string
   *         description: Filtrer par nom de l'emprunteur
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [RETURNED, NOT_RETURNED]
   *         description: Filtrer par statut de retour
   *     responses:
   *       200:
   *         description: Liste des emprunts
   *       400:
   *         description: Filtres invalides
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateScreenLoanFilterDto(req.query);
      if (errors) {
        return res.status(400).json({
          message: 'Les filtres fournis pour lister les emprunts sont invalides.',
          errors,
        });
      }

      const loans = await screenLoansService.listLoans(value);
      return res.status(200).json(loans);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/screen-loans/{id}/return:
   *   patch:
   *     summary: Marque un emprunt d'écran comme retourné
   *     tags: [ScreenLoans]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Emprunt mis à jour (retourné)
   *       400:
   *         description: Identifiant invalide ou déjà retourné
   *       404:
   *         description: Emprunt non trouvé
   */
  markReturned = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const updated = await screenLoansService.returnLoan(id);
      if (!updated) {
        return res.status(404).json({ message: 'Emprunt non trouvé.' });
      }

      return res.status(200).json(updated);
    } catch (error) {
      return next(error);
    }
  };
}

