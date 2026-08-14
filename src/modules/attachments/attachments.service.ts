import { prisma } from '../../prisma/client';
import { Prisma } from '@prisma/client';
import { HttpError } from '../../errors/http-error';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { AttachmentFilterDto } from './dto/filter-attachments.dto';

export class AttachmentsService {
  async createAttachment(data: CreateAttachmentDto) {
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
    const where: Prisma.AttachmentWhereInput = {};

    if (typeof filters.assetId === 'number') {
      where.assetId = filters.assetId;
    }

    const attachments = await prisma.attachment.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
    });

    return attachments;
  }

  async getAttachmentById(id: number) {
    const attachment = await prisma.attachment.findUnique({
      where: { id },
    });

    return attachment;
  }

  async deleteAttachment(id: number) {
    const existing = await prisma.attachment.findUnique({ where: { id } });

    if (!existing) {
      return false;
    }

    await prisma.attachment.delete({ where: { id } });

    return true;
  }
}
