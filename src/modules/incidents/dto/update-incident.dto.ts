import { IncidentStatus } from '@prisma/client';

export interface UpdateIncidentDto {
  status: IncidentStatus;
}

export const validateUpdateIncidentDto = (
  body: any,
): { value?: UpdateIncidentDto; errors?: string[] } => {
  const errors: string[] = [];

  if (body.status == null || typeof body.status !== 'string') {
    errors.push('Le statut (status) est requis et doit être une chaîne (OUVERT ou CLOS).');
  }

  let status: IncidentStatus | null = null;
  if (typeof body.status === 'string') {
    const val = body.status.trim().toUpperCase();
    if (val === 'OUVERT' || val === 'CLOS') {
      status = val as IncidentStatus;
    } else {
      errors.push('Le statut doit être OUVERT ou CLOS.');
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
