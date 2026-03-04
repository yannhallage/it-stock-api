export interface UpdateMaterialTypeDto {
  name?: string;
  description?: string;
}

export const validateUpdateMaterialTypeDto = (
  body: any,
): { value?: UpdateMaterialTypeDto; errors?: string[] } => {
  const errors: string[] = [];

  const value: UpdateMaterialTypeDto = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push('Le libellé du type de matériel doit être une chaîne non vide lorsqu’il est fourni.');
    } else {
      value.name = body.name.trim();
    }
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      errors.push('La description doit être une chaîne de caractères.');
    } else if (body.description.trim().length > 0) {
      value.description = body.description.trim();
    } else {
      value.description = undefined;
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { value };
};

