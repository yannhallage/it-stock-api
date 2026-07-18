import { AttachmentType } from '@prisma/client';

export interface CreateAttachmentDto {
  assetId: number;
  type: AttachmentType;
  fileName: string;
  filePath: string;
}

const VALID_TYPES: AttachmentType[] = ['PHOTO', 'FACTURE', 'GARANTIE', 'MANUEL', 'AUTRE'];

export const validateCreateAttachmentDto = (
  body: any,
): { value?: CreateAttachmentDto; errors?: string[] } => {
  const errors: string[] = [];

  if (body.assetId == null) {
    errors.push("L'identifiant du matériel (assetId) est requis.");
  } else {
    const parsed = parseInt(String(body.assetId), 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      errors.push("L'identifiant du matériel (assetId) doit être un entier strictement positif.");
    }
  }

  if (body.type == null || typeof body.type !== 'string') {
    errors.push('Le type (type) est requis et doit être une chaîne de caractères.');
  } else {
    const val = body.type.trim().toUpperCase();
    if (!VALID_TYPES.includes(val as AttachmentType)) {
      errors.push('Le type doit être PHOTO, FACTURE, GARANTIE, MANUEL ou AUTRE.');
    }
  }

  if (typeof body.fileName !== 'string' || body.fileName.trim().length === 0) {
    errors.push('Le nom de fichier (fileName) est requis et ne doit pas être vide.');
  }

  if (typeof body.filePath !== 'string' || body.filePath.trim().length === 0) {
    errors.push('Le chemin du fichier (filePath) est requis et ne doit pas être vide.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    value: {
      assetId: parseInt(String(body.assetId), 10),
      type: body.type.trim().toUpperCase() as AttachmentType,
      fileName: body.fileName.trim(),
      filePath: body.filePath.trim(),
    },
  };
};
