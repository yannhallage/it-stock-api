export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email?: string;
}

export const validateCreateEmployeeDto = (
  body: any,
): { value?: CreateEmployeeDto; errors?: string[] } => {
  const errors: string[] = [];

  if (typeof body.firstName !== 'string' || body.firstName.trim().length === 0) {
    errors.push('Le prénom est requis et ne doit pas être vide.');
  }

  if (typeof body.lastName !== 'string' || body.lastName.trim().length === 0) {
    errors.push('Le nom est requis et ne doit pas être vide.');
  }

  let email: string | undefined;
  if (body.email != null) {
    if (typeof body.email !== 'string') {
      errors.push("L'email doit être une chaîne de caractères.");
    } else if (body.email.trim().length > 0) {
      const normalizedEmail = body.email.trim().toLowerCase();
      if (!normalizedEmail.includes('@')) {
        errors.push("L'email fourni n'est pas valide.");
      } else {
        email = normalizedEmail;
      }
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  const value: CreateEmployeeDto = {
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    email,
  };

  return { value };
};
