import { MovementType } from '@prisma/client';

export interface CreateMovementDto {
  assetId: number;
  fromLocationId?: number;
  toLocationId?: number;
  movementType: MovementType;
  movedAt: Date;
  note?: string;
}

const VALID_MOVEMENT_TYPES: MovementType[] = ['ENTREE', 'SORTIE', 'TRANSFERT'];

export const validateCreateMovementDto = (
  body: any,
): { value?: CreateMovementDto; errors?: string[] } => {
  const errors: string[] = [];

  if (body.assetId == null) {
    errors.push("L'identifiant du matériel (assetId) est requis.");
  } else {
    const parsed = parseInt(String(body.assetId), 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      errors.push("L'identifiant du matériel (assetId) doit être un entier strictement positif.");
    }
  }

  if (body.fromLocationId != null) {
    const parsed = parseInt(String(body.fromLocationId), 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      errors.push("L'identifiant de localisation source (fromLocationId) doit être un entier strictement positif.");
    }
  }

  if (body.toLocationId != null) {
    const parsed = parseInt(String(body.toLocationId), 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      errors.push("L'identifiant de localisation destination (toLocationId) doit être un entier strictement positif.");
    }
  }

  if (body.movementType == null || typeof body.movementType !== 'string') {
    errors.push('Le type de mouvement (movementType) est requis et doit être une chaîne de caractères.');
  } else {
    const val = body.movementType.trim().toUpperCase();
    if (!VALID_MOVEMENT_TYPES.includes(val as MovementType)) {
      errors.push('Le type de mouvement doit être ENTREE, SORTIE ou TRANSFERT.');
    }
  }

  if (typeof body.movedAt !== 'string') {
    errors.push('La date de mouvement (movedAt) est requise et doit être une chaîne ISO (date-time).');
  }

  let movedAt: Date | null = null;
  if (typeof body.movedAt === 'string') {
    movedAt = new Date(body.movedAt);
    if (Number.isNaN(movedAt.getTime())) {
      errors.push('La date de mouvement (movedAt) doit être une date valide.');
    }
  }

  if (body.note != null && typeof body.note !== 'string') {
    errors.push('La note doit être une chaîne de caractères.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    value: {
      assetId: parseInt(String(body.assetId), 10),
      fromLocationId:
        body.fromLocationId != null ? parseInt(String(body.fromLocationId), 10) : undefined,
      toLocationId:
        body.toLocationId != null ? parseInt(String(body.toLocationId), 10) : undefined,
      movementType: body.movementType.trim().toUpperCase() as MovementType,
      movedAt: movedAt!,
      note:
        typeof body.note === 'string' && body.note.trim().length > 0
          ? body.note.trim()
          : undefined,
    },
  };
};
