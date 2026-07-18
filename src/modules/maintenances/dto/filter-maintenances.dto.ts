import { MaintenanceStatus } from '@prisma/client';

export interface MaintenanceFilterDto {
  assetId?: number;
  status?: MaintenanceStatus;
  search?: string;
}

const VALID_STATUSES: MaintenanceStatus[] = [
  'PLANIFIEE',
  'EN_COURS',
  'TERMINEE',
  'ANNULEE',
];

export const validateMaintenanceFilterDto = (
  query: any,
): { value: MaintenanceFilterDto; errors?: string[] } => {
  const errors: string[] = [];

  let assetId: number | undefined;
  let status: MaintenanceStatus | undefined;
  let search: string | undefined;

  if (query.assetId != null) {
    const parsed = parseInt(String(query.assetId), 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      errors.push('Le filtre assetId doit être un entier strictement positif.');
    } else {
      assetId = parsed;
    }
  }

  if (query.status != null) {
    const val = String(query.status).trim().toUpperCase();
    if (VALID_STATUSES.includes(val as MaintenanceStatus)) {
      status = val as MaintenanceStatus;
    } else {
      errors.push('Le filtre status doit être PLANIFIEE, EN_COURS, TERMINEE ou ANNULEE.');
    }
  }

  if (query.search != null) {
    if (typeof query.search !== 'string') {
      errors.push('Le filtre de recherche doit être une chaîne de caractères.');
    } else if (query.search.trim().length > 0) {
      search = query.search.trim();
    }
  }

  if (errors.length > 0) {
    return { value: {}, errors };
  }

  return {
    value: {
      assetId,
      status,
      search,
    },
  };
};
