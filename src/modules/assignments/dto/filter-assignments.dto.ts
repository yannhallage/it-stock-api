export interface AssignmentFilterDto {
  assetId?: number;
  activeOnly?: boolean;
}

export const validateAssignmentFilterDto = (
  query: any,
): { value: AssignmentFilterDto; errors?: string[] } => {
  const errors: string[] = [];

  let assetId: number | undefined;
  let activeOnly: boolean | undefined;

  if (query.assetId != null) {
    const parsed = parseInt(String(query.assetId), 10);
    if (Number.isNaN(parsed)) {
      errors.push('Le filtre assetId doit être un entier valide.');
    } else {
      assetId = parsed;
    }
  }

  if (query.activeOnly != null) {
    const val = String(query.activeOnly).toLowerCase();
    if (val === 'true' || val === '1') {
      activeOnly = true;
    } else if (val === 'false' || val === '0') {
      activeOnly = false;
    } else {
      errors.push('Le filtre activeOnly doit être un booléen (true/false).');
    }
  }

  if (errors.length > 0) {
    return { value: {}, errors };
  }

  return {
    value: {
      assetId,
      activeOnly,
    },
  };
};

