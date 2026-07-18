export interface CreateDepartmentDto {
  name: string;
}

export const validateCreateDepartmentDto = (
  body: any,
): { value?: CreateDepartmentDto; errors?: string[] } => {
  const errors: string[] = [];

  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('Le nom du département est requis et ne doit pas être vide.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  const value: CreateDepartmentDto = {
    name: body.name.trim(),
  };

  return { value };
};
