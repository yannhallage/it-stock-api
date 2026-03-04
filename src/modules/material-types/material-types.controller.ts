import { Request, Response, NextFunction } from 'express';
import { MaterialTypesService } from './material-types.service';
import { validateCreateMaterialTypeDto } from './dto/create-material-type.dto';
import { validateUpdateMaterialTypeDto } from './dto/update-material-type.dto';
import { validateMaterialTypeFilterDto } from './dto/filter-material-types.dto';

const materialTypesService = new MaterialTypesService();

export class MaterialTypesController {
  /**
   * @swagger
   * tags:
   *   name: MaterialTypes
   *   description: Gestion des types de matériel
   */

  /**
   * @swagger
   * /api/material-types:
   *   post:
   *     summary: Ajoute un type de matériel
   *     tags: [MaterialTypes]
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
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Type de matériel créé
   *       400:
   *         description: Données invalides
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateCreateMaterialTypeDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const materialType = await materialTypesService.createMaterialType(value!);

      return res.status(201).json(materialType);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/material-types:
   *   get:
   *     summary: Liste les types de matériel avec recherche
   *     tags: [MaterialTypes]
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Recherche par libellé ou description
   *     responses:
   *       200:
   *         description: Liste des types de matériel
   *       400:
   *         description: Filtres invalides
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateMaterialTypeFilterDto(req.query);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const materialTypes = await materialTypesService.listMaterialTypes(value);

      return res.status(200).json(materialTypes);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/material-types/{id}:
   *   get:
   *     summary: Récupère le détail d'un type de matériel
   *     tags: [MaterialTypes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Détail du type de matériel
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Type de matériel non trouvé
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const materialType = await materialTypesService.getMaterialTypeById(id);

      if (!materialType) {
        return res.status(404).json({ message: 'Type de matériel non trouvé.' });
      }

      return res.status(200).json(materialType);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/material-types/{id}:
   *   put:
   *     summary: Met à jour un type de matériel
   *     tags: [MaterialTypes]
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
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: Type de matériel mis à jour
   *       400:
   *         description: Données invalides
   *       404:
   *         description: Type de matériel non trouvé
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const { value, errors } = validateUpdateMaterialTypeDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const materialType = await materialTypesService.updateMaterialType(id, value!);

      if (!materialType) {
        return res.status(404).json({ message: 'Type de matériel non trouvé.' });
      }

      return res.status(200).json(materialType);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/material-types/{id}:
   *   delete:
   *     summary: Supprime un type de matériel
   *     tags: [MaterialTypes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Type de matériel supprimé
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Type de matériel non trouvé
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const deleted = await materialTypesService.deleteMaterialType(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Type de matériel non trouvé.' });
      }

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}

