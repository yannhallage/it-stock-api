export interface UpdateBrandDto {
  name?: string;
}

export const validateUpdateBrandDto = (
  body: any,
): { value?: UpdateBrandDto; errors?: string[] } => {
  const errors: string[] = [];

  const value: UpdateBrandDto = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push('Le nom de la marque doit être une chaîne non vide lorsqu’il est fourni.');
    } else {
      value.name = body.name.trim();
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { value };
};
