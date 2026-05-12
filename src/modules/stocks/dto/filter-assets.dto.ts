export interface AssetFilterDto {
  search?: string;
  type?: string;
  status?: string;
  department?: string;
  computer?: string;
}

export const validateAssetFilterDto = (query: any): { value: AssetFilterDto; errors?: string[] } => {
  const errors: string[] = [];

  const search =
    typeof query.search === 'string' && query.search.trim().length > 0 ? query.search.trim() : undefined;
  const type = typeof query.type === 'string' && query.type.trim().length > 0 ? query.type.trim() : undefined;
  const status =
    typeof query.status === 'string' && query.status.trim().length > 0 ? query.status.trim() : undefined;
  const department =
    typeof query.department === 'string' && query.department.trim().length > 0
      ? query.department.trim()
      : undefined;
  const computer =
    typeof query.computer === 'string' && query.computer.trim().length > 0 ? query.computer.trim() : undefined;

  if (query.search != null && typeof query.search !== 'string') {
    errors.push('Le filtre de recherche doit être une chaîne de caractères.');
  }

  if (query.type != null && typeof query.type !== 'string') {
    errors.push('Le type doit être une chaîne de caractères.');
  }

  if (query.status != null && typeof query.status !== 'string') {
    errors.push('Le statut doit être une chaîne de caractères.');
  }

  if (query.department != null && typeof query.department !== 'string') {
    errors.push('La direction/service (department) doit être une chaîne de caractères.');
  }

  if (query.computer != null && typeof query.computer !== 'string') {
    errors.push('Le filtre computer doit être une chaîne de caractères.');
  }

  if (errors.length > 0) {
    return { errors, value: {} };
  }

  return {
    value: {
      search,
      type,
      status,
      department,
      computer,
    },
  };
};

