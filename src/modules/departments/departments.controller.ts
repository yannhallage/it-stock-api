import { Request, Response, NextFunction } from 'express';
import { DepartmentsService } from './departments.service';
import { validateCreateDepartmentDto } from './dto/create-department.dto';
import { validateUpdateDepartmentDto } from './dto/update-department.dto';
import { validateDepartmentFilterDto } from './dto/filter-departments.dto';

const departmentsService = new DepartmentsService();

export class DepartmentsController {
  /**
   * @swagger
   * tags:
   *   name: Departments
   *   description: Gestion des départements
   */

  /**
   * @swagger
   * /api/departments:
   *   post:
   *     summary: Ajoute un département
   *     tags: [Departments]
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
   *         description: Département créé
   *       400:
   *         description: Données invalides
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateCreateDepartmentDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const department = await departmentsService.createDepartment(value!);

      return res.status(201).json(department);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/departments:
   *   get:
   *     summary: Liste les départements avec recherche
   *     tags: [Departments]
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Recherche par nom
   *     responses:
   *       200:
   *         description: Liste des départements
   *       400:
   *         description: Filtres invalides
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateDepartmentFilterDto(req.query);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const departments = await departmentsService.listDepartments(value);

      return res.status(200).json(departments);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/departments/{id}:
   *   get:
   *     summary: Récupère le détail d'un département
   *     tags: [Departments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Détail du département
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Département non trouvé
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const department = await departmentsService.getDepartmentById(id);

      if (!department) {
        return res.status(404).json({ message: 'Département non trouvé.' });
      }

      return res.status(200).json(department);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/departments/{id}:
   *   put:
   *     summary: Met à jour un département
   *     tags: [Departments]
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
   *         description: Département mis à jour
   *       400:
   *         description: Données invalides
   *       404:
   *         description: Département non trouvé
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const { value, errors } = validateUpdateDepartmentDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const department = await departmentsService.updateDepartment(id, value!);

      if (!department) {
        return res.status(404).json({ message: 'Département non trouvé.' });
      }

      return res.status(200).json(department);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/departments/{id}:
   *   delete:
   *     summary: Supprime un département
   *     tags: [Departments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Département supprimé
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Département non trouvé
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const deleted = await departmentsService.deleteDepartment(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Département non trouvé.' });
      }

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}
