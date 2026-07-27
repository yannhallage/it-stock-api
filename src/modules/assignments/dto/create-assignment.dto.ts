export interface CreateAssignmentDto {
  employeeId: string;
  departmentId: number;
  startDate: Date;
  note?: string;
}

export const validateCreateAssignmentDto = (
  body: any,
): { value?: CreateAssignmentDto; errors?: string[] } => {
  const errors: string[] = [];

  if (typeof body.employeeId !== 'string' || body.employeeId.trim().length === 0) {
    errors.push("L'identifiant employé (employeeId) est requis et ne doit pas être vide.");
  }

  if (body.departmentId == null) {
    errors.push('Le département (departmentId) est requis.');
  } else {
    const parsed = parseInt(String(body.departmentId), 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      errors.push('Le département (departmentId) doit être un entier strictement positif.');
    }
  }

  if (typeof body.startDate !== 'string') {
    errors.push('La date de début (startDate) est requise et doit être une chaîne ISO (YYYY-MM-DD).');
  }

  if (body.note != null && typeof body.note !== 'string') {
    errors.push('La note doit être une chaîne de caractères.');
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
    employeeId: body.employeeId.trim(),
    departmentId: parseInt(String(body.departmentId), 10),
    startDate: parsedDate!,
    note:
      typeof body.note === 'string' && body.note.trim().length > 0
        ? body.note.trim()
        : undefined,
  };

  return { value };
};
