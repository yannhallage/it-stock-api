import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';

const dashboardService = new DashboardService();

export class DashboardController {
  /**
   * @swagger
   * tags:
   *   name: Dashboard
   *   description: Tableau de bord — indicateurs agrégés
   */

  /**
   * @swagger
   * /api/dashboard:
   *   get:
   *     summary: Données du tableau de bord (par groupe)
   *     tags: [Dashboard]
   *     responses:
   *       200:
   *         description: Données regroupées (simple_data, repartition_par_etat, top_directions_pannes, synthese_par_etat)
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 simple_data:
   *                   type: object
   *                   properties:
   *                     totalMateriels: { type: number }
   *                     enStock: { type: number }
   *                     affectes: { type: number }
   *                     reparationsEnCours: { type: number }
   *                 repartition_par_etat:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       etat: { type: string }
   *                       libelle: { type: string }
   *                       count: { type: number }
   *                 top_directions_pannes:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       direction: { type: string }
   *                       count: { type: number }
   *                 synthese_par_etat:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       etat: { type: string }
   *                       libelle: { type: string }
   *                       count: { type: number }
   */
  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dashboardService.getDashboard();
      return res.status(200).json(data);
    } catch (error) {
      return next(error);
    }
  };
}
