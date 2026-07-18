import { Router } from 'express';
import { AttachmentsController } from './attachments.controller';

export class AttachmentsModule {
  public readonly router: Router;
  private readonly controller: AttachmentsController;

  constructor() {
    this.router = Router();
    this.controller = new AttachmentsController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', this.controller.create);
    this.router.get('/', this.controller.list);
    this.router.get('/:id', this.controller.getById);
    this.router.delete('/:id', this.controller.delete);
  }
}

export const attachmentsModule = new AttachmentsModule();
