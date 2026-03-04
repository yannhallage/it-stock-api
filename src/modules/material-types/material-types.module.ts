import { Router } from 'express';
import { MaterialTypesController } from './material-types.controller';

export class MaterialTypesModule {
  public readonly router: Router;
  private readonly controller: MaterialTypesController;

  constructor() {
    this.router = Router();
    this.controller = new MaterialTypesController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', this.controller.create);
    this.router.get('/', this.controller.list);
    this.router.get('/:id', this.controller.getById);
    this.router.put('/:id', this.controller.update);
    this.router.delete('/:id', this.controller.delete);
  }
}

export const materialTypesModule = new MaterialTypesModule();

