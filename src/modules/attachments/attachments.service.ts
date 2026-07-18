import { prisma } from '../../prisma/client';
import { logger } from '../../logger';
import { Prisma } from '@prisma/client';
import { HttpError } from '../../errors/http-error';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { AttachmentFilterDto } from './dto/filter-attachments.dto';

export class AttachmentsService {
  async createAttachment(data: CreateAttachmentDto) {
    logger.info(
      { assetId: data.assetId, type: data.type, fileName: data.fileName },
      '[AttachmentsService] Création de pièce jointe demandée',
    );

    const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) {
      return null;
    }

    try {
      const attachment = await prisma.attachment.create({
        data: {
          assetId: data.assetId,
          type: data.type,
          fileName: data.fileName,
          filePath: data.filePath,
        },
      });

      logger.info(
        { id: attachment.id, assetId: data.assetId },
        '[AttachmentsService] Pièce jointe créée avec succès',
      );

      return attachment;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          400,
          'Les données fournies pour créer la pièce jointe sont invalides.',
          'ATTACHMENT_VALIDATION_ERROR',
        );
      }
      throw error;
    }
  }

  async listAttachments(filters: AttachmentFilterDto) {
    logger.debug({ filters }, '[AttachmentsService] Listing des pièces jointes');

    const where: Prisma.AttachmentWhereInput = {};

    if (typeof filters.assetId === 'number') {
      where.assetId = filters.assetId;
    }

    const attachments = await prisma.attachment.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
    });

    logger.debug(
      { count: attachments.length },
      '[AttachmentsService] Listing des pièces jointes terminé',
    );

    return attachments;
  }

  async getAttachmentById(id: number) {
    logger.debug({ id }, '[AttachmentsService] Récupération de la pièce jointe');

    const attachment = await prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      logger.warn({ id }, '[AttachmentsService] Pièce jointe non trouvée');
    }

    return attachment;
  }

  async deleteAttachment(id: number) {
    logger.info({ id }, '[AttachmentsService] Suppression de pièce jointe demandée');

    const existing = await prisma.attachment.findUnique({ where: { id } });

    if (!existing) {
      logger.warn({ id }, '[AttachmentsService] Suppression impossible: pièce jointe non trouvée');
      return false;
    }

    await prisma.attachment.delete({ where: { id } });

    logger.info({ id }, '[AttachmentsService] Pièce jointe supprimée avec succès');

    return true;
  }
}
