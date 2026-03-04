import { Request, Response, NextFunction } from 'express';
import { SuppliersService } from './suppliers.service';
import { validateCreateSupplierDto } from './dto/create-supplier.dto';
import { validateUpdateSupplierDto } from './dto/update-supplier.dto';
import { validateSupplierFilterDto } from './dto/filter-suppliers.dto';

const suppliersService = new SuppliersService();

export class SuppliersController {
  /**
   * @swagger
   * tags:
   *   name: Suppliers
   *   description: Gestion des fournisseurs
   */

  /**
   * @swagger
   * /api/suppliers:
   *   post:
   *     summary: Ajoute un fournisseur
   *     tags: [Suppliers]
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
   *               contact:
   *                 type: string
   *               address:
   *                 type: string
   *     responses:
   *       201:
   *         description: Fournisseur créé
   *       400:
   *         description: Données invalides
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateCreateSupplierDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const supplier = await suppliersService.createSupplier(value!);

      return res.status(201).json(supplier);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/suppliers:
   *   get:
   *     summary: Liste les fournisseurs avec recherche
   *     tags: [Suppliers]
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Recherche par nom, contact ou adresse
   *     responses:
   *       200:
   *         description: Liste des fournisseurs
   *       400:
   *         description: Filtres invalides
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateSupplierFilterDto(req.query);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const suppliers = await suppliersService.listSuppliers(value);

      return res.status(200).json(suppliers);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/suppliers/{id}:
   *   get:
   *     summary: Récupère le détail d'un fournisseur
   *     tags: [Suppliers]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Détail du fournisseur
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Fournisseur non trouvé
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const supplier = await suppliersService.getSupplierById(id);

      if (!supplier) {
        return res.status(404).json({ message: 'Fournisseur non trouvé.' });
      }

      return res.status(200).json(supplier);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/suppliers/{id}:
   *   put:
   *     summary: Met à jour un fournisseur
   *     tags: [Suppliers]
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
   *               contact:
   *                 type: string
   *               address:
   *                 type: string
   *     responses:
   *       200:
   *         description: Fournisseur mis à jour
   *       400:
   *         description: Données invalides
   *       404:
   *         description: Fournisseur non trouvé
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const { value, errors } = validateUpdateSupplierDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const supplier = await suppliersService.updateSupplier(id, value!);

      if (!supplier) {
        return res.status(404).json({ message: 'Fournisseur non trouvé.' });
      }

      return res.status(200).json(supplier);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/suppliers/{id}:
   *   delete:
   *     summary: Supprime un fournisseur
   *     tags: [Suppliers]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Fournisseur supprimé
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Fournisseur non trouvé
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const deleted = await suppliersService.deleteSupplier(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Fournisseur non trouvé.' });
      }

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}

