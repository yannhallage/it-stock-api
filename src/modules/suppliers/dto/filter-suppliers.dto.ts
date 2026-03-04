export interface SupplierFilterDto {
  search?: string;
}

export const validateSupplierFilterDto = (query: any): { value: SupplierFilterDto; errors?: string[] } => {
  const errors: string[] = [];

  let search: string | undefined;

  if (query.search != null) {
    if (typeof query.search !== 'string') {
      errors.push('Le filtre de recherche doit être une chaîne de caractères.');
    } else if (query.search.trim().length > 0) {
      search = query.search.trim();
    }
  }

  if (errors.length > 0) {
    return { value: {}, errors };
  }

  return {
    value: {
      search,
    },
  };
};

