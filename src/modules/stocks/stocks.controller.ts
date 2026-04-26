import { Request, Response, NextFunction } from 'express';
import { StocksService } from './stocks.service';
import { validateCreateAssetDto } from './dto/create-asset.dto';
import { validateAssetFilterDto } from './dto/filter-assets.dto';

const stocksService = new StocksService();

export class StocksController {
  /**
   * @swagger
   * tags:
   *   name: Assets
   *   description: Gestion du stock de matériels
   */

  /**
   * @swagger
   * /api/assets:
   *   post:
   *     summary: Création d'un nouveau matériel
   *     tags: [Assets]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - type
   *               - brand
   *               - model
   *               - entryDate
   *               - supplier
   *             properties:
   *               inventoryNumber:
   *                 type: string
   *                 description: Numéro d'inventaire (généré si absent)
   *               type:
   *                 type: string
   *               brand:
   *                 type: string
   *               model:
   *                 type: string
   *               entryDate:
   *                 type: string
   *                 format: date-time
   *               supplier:
   *                 type: string
   *               warrantyStartDate:
   *                 type: string
   *                 format: date-time
   *                 description: Début de garantie (optionnel)
   *               warrantyEndDate:
   *                 type: string
   *                 format: date-time
   *                 description: Fin de garantie (optionnel)
   *               status:
   *                 type: string
   *     responses:
   *       201:
   *         description: Matériel créé
   *       400:
   *         description: Données invalides
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateCreateAssetDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const asset = await stocksService.createAsset(value!);

      return res.status(201).json(asset);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/assets:
   *   get:
   *     summary: Liste les matériels avec filtres
   *     tags: [Assets]
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Recherche texte (inventaire, marque, modèle, fournisseur)
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *         description: Filtre par type
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *         description: Filtre par statut
   *     responses:
   *       200:
   *         description: Liste des matériels
   *       400:
   *         description: Filtres invalides
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateAssetFilterDto(req.query);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const assets = await stocksService.getAssets(value);

      return res.status(200).json(assets);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/assets/{id}:
   *   get:
   *     summary: Récupère le détail d'un matériel
   *     tags: [Assets]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Détail du matériel
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Matériel non trouvé
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const asset = await stocksService.getAssetById(id);

      if (!asset) {
        return res.status(404).json({ message: 'Matériel non trouvé.' });
      }

      return res.status(200).json(asset);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/assets/{id}:
   *   delete:
   *     summary: Supprime un matériel et ses données liées
   *     tags: [Assets]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Matériel supprimé
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Matériel non trouvé
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const deleted = await stocksService.deleteAsset(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Matériel non trouvé.' });
      }

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}

