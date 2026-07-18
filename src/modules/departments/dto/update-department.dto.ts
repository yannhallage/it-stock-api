export interface UpdateDepartmentDto {
  name?: string;
}

export const validateUpdateDepartmentDto = (
  body: any,
): { value?: UpdateDepartmentDto; errors?: string[] } => {
  const errors: string[] = [];

  const value: UpdateDepartmentDto = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push('Le nom du département doit être une chaîne non vide lorsqu’il est fourni.');
    } else {
      value.name = body.name.trim();
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { value };
};
