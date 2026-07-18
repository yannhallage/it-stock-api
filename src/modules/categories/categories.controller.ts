import { Request, Response, NextFunction } from 'express';
import { CategoriesService } from './categories.service';
import { validateCreateCategoryDto } from './dto/create-category.dto';
import { validateUpdateCategoryDto } from './dto/update-category.dto';
import { validateCategoryFilterDto } from './dto/filter-categories.dto';

const categoriesService = new CategoriesService();

export class CategoriesController {
  /**
   * @swagger
   * tags:
   *   name: Categories
   *   description: Gestion des catégories
   */

  /**
   * @swagger
   * /api/categories:
   *   post:
   *     summary: Ajoute une catégorie
   *     tags: [Categories]
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
   *         description: Catégorie créée
   *       400:
   *         description: Données invalides
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateCreateCategoryDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const category = await categoriesService.createCategory(value!);

      return res.status(201).json(category);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/categories:
   *   get:
   *     summary: Liste les catégories avec recherche
   *     tags: [Categories]
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Recherche par nom
   *     responses:
   *       200:
   *         description: Liste des catégories
   *       400:
   *         description: Filtres invalides
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateCategoryFilterDto(req.query);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const categories = await categoriesService.listCategories(value);

      return res.status(200).json(categories);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/categories/{id}:
   *   get:
   *     summary: Récupère le détail d'une catégorie
   *     tags: [Categories]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Détail de la catégorie
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Catégorie non trouvée
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const category = await categoriesService.getCategoryById(id);

      if (!category) {
        return res.status(404).json({ message: 'Catégorie non trouvée.' });
      }

      return res.status(200).json(category);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/categories/{id}:
   *   put:
   *     summary: Met à jour une catégorie
   *     tags: [Categories]
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
   *         description: Catégorie mise à jour
   *       400:
   *         description: Données invalides
   *       404:
   *         description: Catégorie non trouvée
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const { value, errors } = validateUpdateCategoryDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const category = await categoriesService.updateCategory(id, value!);

      if (!category) {
        return res.status(404).json({ message: 'Catégorie non trouvée.' });
      }

      return res.status(200).json(category);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/categories/{id}:
   *   delete:
   *     summary: Supprime une catégorie
   *     tags: [Categories]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Catégorie supprimée
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Catégorie non trouvée
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const deleted = await categoriesService.deleteCategory(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Catégorie non trouvée.' });
      }

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}
