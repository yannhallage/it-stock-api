import { IncidentStatus } from '@prisma/client';

export interface IncidentFilterDto {
  assetId?: number;
  status?: IncidentStatus;
}

export const validateIncidentFilterDto = (
  query: any,
): { value: IncidentFilterDto; errors?: string[] } => {
  const errors: string[] = [];

  let assetId: number | undefined;
  let status: IncidentStatus | undefined;

  if (query.assetId != null) {
    const parsed = parseInt(String(query.assetId), 10);
    if (Number.isNaN(parsed)) {
      errors.push('Le filtre assetId doit être un entier valide.');
    } else {
      assetId = parsed;
    }
  }

  if (query.status != null) {
    const val = String(query.status).toUpperCase();
    if (val === 'OUVERT' || val === 'CLOS') {
      status = val as IncidentStatus;
    } else {
      errors.push('Le filtre status doit être OUVERT ou CLOS.');
    }
  }

  if (errors.length > 0) {
    return { value: {}, errors };
  }

  return {
    value: {
      assetId,
      status,
    },
  };
};
