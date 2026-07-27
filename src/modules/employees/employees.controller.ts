import { Request, Response, NextFunction } from 'express';
import { EmployeesService } from './employees.service';
import { validateCreateEmployeeDto } from './dto/create-employee.dto';
import { validateUpdateEmployeeDto } from './dto/update-employee.dto';
import { validateEmployeeFilterDto } from './dto/filter-employees.dto';

const employeesService = new EmployeesService();

export class EmployeesController {
  /**
   * @swagger
   * tags:
   *   name: Employees
   *   description: Référentiel des employés (bénéficiaires d'affectation)
   */

  /**
   * @swagger
   * /api/employees:
   *   post:
   *     summary: Ajoute un employé
   *     tags: [Employees]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - firstName
   *               - lastName
   *             properties:
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               email:
   *                 type: string
   *     responses:
   *       201:
   *         description: Employé créé
   *       400:
   *         description: Données invalides
   *       409:
   *         description: Email déjà utilisé
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateCreateEmployeeDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const employee = await employeesService.createEmployee(value!);

      return res.status(201).json(employee);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/employees:
   *   get:
   *     summary: Liste les employés avec recherche
   *     tags: [Employees]
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Recherche par prénom, nom ou email
   *     responses:
   *       200:
   *         description: Liste des employés
   *       400:
   *         description: Filtres invalides
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateEmployeeFilterDto(req.query);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const employees = await employeesService.listEmployees(value);

      return res.status(200).json(employees);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/employees/{id}:
   *   get:
   *     summary: Récupère le détail d'un employé
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Détail de l'employé
   *       404:
   *         description: Employé non trouvé
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;

      if (!id || id.trim().length === 0) {
        return res.status(400).json({ message: "L'identifiant est requis." });
      }

      const employee = await employeesService.getEmployeeById(id);

      if (!employee) {
        return res.status(404).json({ message: 'Employé non trouvé.' });
      }

      return res.status(200).json(employee);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/employees/{id}:
   *   put:
   *     summary: Met à jour un employé
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               email:
   *                 type: string
   *                 nullable: true
   *     responses:
   *       200:
   *         description: Employé mis à jour
   *       400:
   *         description: Données invalides
   *       404:
   *         description: Employé non trouvé
   *       409:
   *         description: Email déjà utilisé
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;

      if (!id || id.trim().length === 0) {
        return res.status(400).json({ message: "L'identifiant est requis." });
      }

      const { value, errors } = validateUpdateEmployeeDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const employee = await employeesService.updateEmployee(id, value!);

      if (!employee) {
        return res.status(404).json({ message: 'Employé non trouvé.' });
      }

      return res.status(200).json(employee);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/employees/{id}:
   *   delete:
   *     summary: Supprime un employé (soft-delete)
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Employé supprimé
   *       404:
   *         description: Employé non trouvé
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;

      if (!id || id.trim().length === 0) {
        return res.status(400).json({ message: "L'identifiant est requis." });
      }

      const deleted = await employeesService.deleteEmployee(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Employé non trouvé.' });
      }

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}
