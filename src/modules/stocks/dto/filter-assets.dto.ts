export interface AssetFilterDto {
  search?: string;
  type?: string;
  status?: string;
}

export const validateAssetFilterDto = (query: any): { value: AssetFilterDto; errors?: string[] } => {
  const errors: string[] = [];

  const search =
    typeof query.search === 'string' && query.search.trim().length > 0 ? query.search.trim() : undefined;
  const type = typeof query.type === 'string' && query.type.trim().length > 0 ? query.type.trim() : undefined;
  const status =
    typeof query.status === 'string' && query.status.trim().length > 0 ? query.status.trim() : undefined;

  if (query.search != null && typeof query.search !== 'string') {
    errors.push('Le filtre de recherche doit être une chaîne de caractères.');
  }

  if (query.type != null && typeof query.type !== 'string') {
    errors.push('Le type doit être une chaîne de caractères.');
  }

  if (query.status != null && typeof query.status !== 'string') {
    errors.push('Le statut doit être une chaîne de caractères.');
  }

  if (errors.length > 0) {
    return { errors, value: {} };
  }

  return {
    value: {
      search,
      type,
      status,
    },
  };
};

