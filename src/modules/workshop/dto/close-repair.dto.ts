import { AssetStatus } from '@prisma/client';

export interface CloseRepairDto {
  outcome: AssetStatus; // EN_SERVICE ou HORS_SERVICE
}

export const validateCloseRepairDto = (
  body: any,
): { value?: CloseRepairDto; errors?: string[] } => {
  const errors: string[] = [];

  const allowed: AssetStatus[] = ['EN_SERVICE', 'HORS_SERVICE'];

  if (body.outcome == null || typeof body.outcome !== 'string') {
    errors.push("Le résultat (outcome) est requis et doit être EN_SERVICE ou HORS_SERVICE.");
  } else {
    const val = body.outcome.trim().toUpperCase().replace(/-/g, '_');
    if (!allowed.includes(val as AssetStatus)) {
      errors.push("Le résultat doit être EN_SERVICE ou HORS_SERVICE.");
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  const val = body.outcome.trim().toUpperCase().replace(/-/g, '_');
  return {
    value: {
      outcome: val as AssetStatus,
    },
  };
};
