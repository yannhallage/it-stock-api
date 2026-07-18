export interface CreateIncidentDto {
  description: string;
  reportedAt: Date;
  departmentId: number;
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

  if (body.departmentId == null) {
    errors.push('Le département (departmentId) est requis.');
  } else {
    const parsed = parseInt(String(body.departmentId), 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      errors.push('Le département (departmentId) doit être un entier strictement positif.');
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  const value: CreateIncidentDto = {
    description: body.description.trim(),
    reportedAt: parsedDate!,
    departmentId: parseInt(String(body.departmentId), 10),
  };

  return { value };
};
