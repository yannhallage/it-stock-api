export interface CreateAssignmentDto {
  department: string;
  user: any;
  startDate: Date;
}

export const validateCreateAssignmentDto = (
  body: any,
): { value?: CreateAssignmentDto; errors?: string[] } => {
  const errors: string[] = [];

  if (typeof body.department !== 'string' || body.department.trim().length === 0) {
    errors.push('La direction (department) est requise et ne doit pas être vide.');
  }

  if (body.user == null || typeof body.user !== 'object' || Array.isArray(body.user)) {
    errors.push("L'utilisateur (user) doit être un objet JSON.");
  }

  if (typeof body.startDate !== 'string') {
    errors.push('La date de début (startDate) est requise et doit être une chaîne ISO (YYYY-MM-DD).');
  }

  let parsedDate: Date | null = null;
  if (typeof body.startDate === 'string') {
    parsedDate = new Date(body.startDate);
    if (Number.isNaN(parsedDate.getTime())) {
      errors.push('La date de début doit être une date valide.');
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  const value: CreateAssignmentDto = {
    department: body.department.trim(),
    user: body.user,
    startDate: parsedDate!,
  };

  return { value };
};

