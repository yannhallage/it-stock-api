import { Request, Response, NextFunction } from 'express';
import { AttachmentsService } from './attachments.service';
import { validateCreateAttachmentDto } from './dto/create-attachment.dto';
import { validateAttachmentFilterDto } from './dto/filter-attachments.dto';

const attachmentsService = new AttachmentsService();

export class AttachmentsController {
  /**
   * @swagger
   * tags:
   *   name: Attachments
   *   description: Gestion des pièces jointes des matériels
   */

  /**
   * @swagger
   * /api/attachments:
   *   post:
   *     summary: Enregistre une pièce jointe
   *     tags: [Attachments]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - assetId
   *               - type
   *               - fileName
   *               - filePath
   *             properties:
   *               assetId: { type: integer }
   *               type:
   *                 type: string
   *                 enum: [PHOTO, FACTURE, GARANTIE, MANUEL, AUTRE]
   *               fileName: { type: string }
   *               filePath: { type: string }
   *     responses:
   *       201:
   *         description: Pièce jointe créée
   *       400:
   *         description: Données invalides
   *       404:
   *         description: Matériel non trouvé
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateCreateAttachmentDto(req.body);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const attachment = await attachmentsService.createAttachment(value!);

      if (!attachment) {
        return res.status(404).json({ message: 'Matériel non trouvé.' });
      }

      return res.status(201).json(attachment);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/attachments:
   *   get:
   *     summary: Liste les pièces jointes
   *     tags: [Attachments]
   *     parameters:
   *       - in: query
   *         name: assetId
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Liste des pièces jointes
   *       400:
   *         description: Filtres invalides
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, errors } = validateAttachmentFilterDto(req.query);

      if (errors) {
        return res.status(400).json({ errors });
      }

      const attachments = await attachmentsService.listAttachments(value);

      return res.status(200).json(attachments);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/attachments/{id}:
   *   get:
   *     summary: Récupère une pièce jointe par son identifiant
   *     tags: [Attachments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Pièce jointe trouvée
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Pièce jointe non trouvée
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const attachment = await attachmentsService.getAttachmentById(id);

      if (!attachment) {
        return res.status(404).json({ message: 'Pièce jointe non trouvée.' });
      }

      return res.status(200).json(attachment);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * @swagger
   * /api/attachments/{id}:
   *   delete:
   *     summary: Supprime une pièce jointe
   *     tags: [Attachments]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Pièce jointe supprimée
   *       400:
   *         description: Identifiant invalide
   *       404:
   *         description: Pièce jointe non trouvée
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "L'identifiant doit être un entier valide." });
      }

      const deleted = await attachmentsService.deleteAttachment(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Pièce jointe non trouvée.' });
      }

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}
