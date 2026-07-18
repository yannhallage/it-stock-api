import { MaintenanceStatus } from '@prisma/client';

export interface UpdateMaintenanceStatusDto {
  status: MaintenanceStatus;
}

const VALID_STATUSES: MaintenanceStatus[] = [
  'PLANIFIEE',
  'EN_COURS',
  'TERMINEE',
  'ANNULEE',
];

export const validateUpdateMaintenanceStatusDto = (
  body: any,
): { value?: UpdateMaintenanceStatusDto; errors?: string[] } => {
  const errors: string[] = [];

  if (body.status == null || typeof body.status !== 'string') {
    errors.push(
      'Le statut (status) est requis et doit être une chaîne (PLANIFIEE, EN_COURS, TERMINEE ou ANNULEE).',
    );
  }

  let status: MaintenanceStatus | null = null;
  if (typeof body.status === 'string') {
    const val = body.status.trim().toUpperCase();
    if (VALID_STATUSES.includes(val as MaintenanceStatus)) {
      status = val as MaintenanceStatus;
    } else {
      errors.push('Le statut doit être PLANIFIEE, EN_COURS, TERMINEE ou ANNULEE.');
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    value: {
      status: status!,
    },
  };
};
