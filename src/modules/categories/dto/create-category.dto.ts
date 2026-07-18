export interface CreateCategoryDto {
  name: string;
}

export const validateCreateCategoryDto = (
  body: any,
): { value?: CreateCategoryDto; errors?: string[] } => {
  const errors: string[] = [];

  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('Le nom de la catégorie est requis et ne doit pas être vide.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  const value: CreateCategoryDto = {
    name: body.name.trim(),
  };

  return { value };
};
