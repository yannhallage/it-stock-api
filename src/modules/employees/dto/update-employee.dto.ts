export interface UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  email?: string | null;
}

export const validateUpdateEmployeeDto = (
  body: any,
): { value?: UpdateEmployeeDto; errors?: string[] } => {
  const errors: string[] = [];
  const value: UpdateEmployeeDto = {};

  if (body.firstName !== undefined) {
    if (typeof body.firstName !== 'string' || body.firstName.trim().length === 0) {
      errors.push('Le prénom doit être une chaîne non vide lorsqu’il est fourni.');
    } else {
      value.firstName = body.firstName.trim();
    }
  }

  if (body.lastName !== undefined) {
    if (typeof body.lastName !== 'string' || body.lastName.trim().length === 0) {
      errors.push('Le nom doit être une chaîne non vide lorsqu’il est fourni.');
    } else {
      value.lastName = body.lastName.trim();
    }
  }

  if (body.email !== undefined) {
    if (body.email === null || body.email === '') {
      value.email = null;
    } else if (typeof body.email !== 'string') {
      errors.push("L'email doit être une chaîne de caractères.");
    } else {
      const email = body.email.trim().toLowerCase();
      if (!email.includes('@')) {
        errors.push("L'email fourni n'est pas valide.");
      } else {
        value.email = email;
      }
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { value };
};
