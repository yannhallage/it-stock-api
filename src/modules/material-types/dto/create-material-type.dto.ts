export interface CreateMaterialTypeDto {
  name: string;
  description?: string;
}

export const validateCreateMaterialTypeDto = (
  body: any,
): { value?: CreateMaterialTypeDto; errors?: string[] } => {
  const errors: string[] = [];

  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('Le libellé du type de matériel est requis et ne doit pas être vide.');
  }

  if (body.description != null && typeof body.description !== 'string') {
    errors.push('La description doit être une chaîne de caractères.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  const value: CreateMaterialTypeDto = {
    name: body.name.trim(),
    description:
      typeof body.description === 'string' && body.description.trim().length > 0
        ? body.description.trim()
        : undefined,
  };

  return { value };
};

