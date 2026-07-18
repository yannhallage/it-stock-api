export interface CreateBrandDto {
  name: string;
}

export const validateCreateBrandDto = (
  body: any,
): { value?: CreateBrandDto; errors?: string[] } => {
  const errors: string[] = [];

  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('Le nom de la marque est requis et ne doit pas être vide.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  const value: CreateBrandDto = {
    name: body.name.trim(),
  };

  return { value };
};
