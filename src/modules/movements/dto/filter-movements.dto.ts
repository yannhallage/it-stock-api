export interface MovementFilterDto {
  assetId?: number;
}

export const validateMovementFilterDto = (
  query: any,
): { value: MovementFilterDto; errors?: string[] } => {
  const errors: string[] = [];

  let assetId: number | undefined;

  if (query.assetId != null) {
    const parsed = parseInt(String(query.assetId), 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      errors.push('Le filtre assetId doit être un entier strictement positif.');
    } else {
      assetId = parsed;
    }
  }

  if (errors.length > 0) {
    return { value: {}, errors };
  }

  return {
    value: {
      assetId,
    },
  };
};
