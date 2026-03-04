export interface CreateIncidentDto {
  description: string;
  reportedAt: Date;
  department: string;
}

export const validateCreateIncidentDto = (
  body: any,
): { value?: CreateIncidentDto; errors?: string[] } => {
  const errors: string[] = [];

  if (typeof body.description !== 'string' || body.description.trim().length === 0) {
    errors.push('La description est requise et ne doit pas être vide.');
  }

  if (typeof body.reportedAt !== 'string') {
    errors.push(
      'La date de signalement (reportedAt) est requise et doit être une chaîne ISO (YYYY-MM-DD ou date-time).',
    );
  }

  let parsedDate: Date | null = null;
  if (typeof body.reportedAt === 'string') {
    parsedDate = new Date(body.reportedAt);
    if (Number.isNaN(parsedDate.getTime())) {
      errors.push('La date de signalement doit être une date valide.');
    }
  }

  if (typeof body.department !== 'string' || body.department.trim().length === 0) {
    errors.push('Le département est requis et ne doit pas être vide.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  const value: CreateIncidentDto = {
    description: body.description.trim(),
    reportedAt: parsedDate!,
    department: body.department.trim(),
  };

  return { value };
};
