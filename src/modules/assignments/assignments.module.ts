import { Router } from 'express';
import { AssignmentsController } from './assignments.controller';

export class AssignmentsModule {
  public readonly router: Router;
  private readonly controller: AssignmentsController;

  constructor() {
    this.router = Router();
    this.controller = new AssignmentsController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Récupération des affectations (optionnellement filtrées)
    this.router.get('/assignments', this.controller.list);

    // Création d'une affectation pour un matériel
    this.router.post('/assets/:id/assignments', this.controller.createForAsset);

    // Clôture d'une affectation
    this.router.post('/assignments/:id/end', this.controller.end);
  }
}

export const assignmentsModule = new AssignmentsModule();

