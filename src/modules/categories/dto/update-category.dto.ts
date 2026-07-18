export interface UpdateCategoryDto {
  name?: string;
}

export const validateUpdateCategoryDto = (
  body: any,
): { value?: UpdateCategoryDto; errors?: string[] } => {
  const errors: string[] = [];

  const value: UpdateCategoryDto = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push('Le nom de la catégorie doit être une chaîne non vide lorsqu’il est fourni.');
    } else {
      value.name = body.name.trim();
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { value };
};
