import { Request, Response, NextFunction } from 'express';
import { BrandsService } from './brands.service';
import { validateCreateBrandDto } from './dto/create-brand.dto';
import { validateUpdateBrandDto } from './dto/update-brand.dto';
import { validateBrandFilterDto } from './dto/filter-brands.dto';

const brandsService = new BrandsService();

export class BrandsController {
  /**
   * @swagger
   * tags:
   *   name: Brands
   *   description: Gestion des marques
   */

  /**
   * @swagger
   * /api/brands:
   *   post:
   *     summary: Ajoute une marque
   *     tags: [Brands]
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
   *     responses:
   *       201:
   *         description: Marque créée
   *       400:
   *         description: Données invalides
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateCreateBrandDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const brand = await brandsService.createBrand(value!);

      return res.status(201).json(brand);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/brands:
   *   get:
   *     summary: Liste les marques avec recherche
   *     tags: [Brands]
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Recherche par nom
   *     responses:
   *       200:
   *         description: Liste des marques
   *       400:
   *         description: Filtres invalides
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateBrandFilterDto(req.query);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const brands = await brandsService.listBrands(value);

      return res.status(200).json(brands);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/brands/{id}:
   *   get:
   *     summary: Récupère le détail d'une marque
   *     tags: [Brands]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Détail de la marque
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Marque non trouvée
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const brand = await brandsService.getBrandById(id);

      if (!brand) {
        return res.status(404).json({ message: 'Marque non trouvée.' });
      }

      return res.status(200).json(brand);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/brands/{id}:
   *   put:
   *     summary: Met à jour une marque
   *     tags: [Brands]
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
   *     responses:
   *       200:
   *         description: Marque mise à jour
   *       400:
   *         description: Données invalides
   *       404:
   *         description: Marque non trouvée
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const { value, errors } = validateUpdateBrandDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const brand = await brandsService.updateBrand(id, value!);

      if (!brand) {
        return res.status(404).json({ message: 'Marque non trouvée.' });
      }

      return res.status(200).json(brand);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/brands/{id}:
   *   delete:
   *     summary: Supprime une marque
   *     tags: [Brands]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Marque supprimée
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Marque non trouvée
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const deleted = await brandsService.deleteBrand(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Marque non trouvée.' });
      }

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}
