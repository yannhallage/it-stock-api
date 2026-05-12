export type ScreenLoanStatusFilter = 'RETURNED' | 'NOT_RETURNED';

export interface ScreenLoanFilterDto {
  borrowerName?: string;
  status?: ScreenLoanStatusFilter;
}

export const validateScreenLoanFilterDto = (
  query: any,
): { value: ScreenLoanFilterDto; errors?: string[] } => {
  const errors: string[] = [];

  const borrowerName =
    typeof query.borrowerName === 'string' && query.borrowerName.trim().length > 0
      ? query.borrowerName.trim()
      : undefined;

  let status: ScreenLoanStatusFilter | undefined;
  if (query.status != null) {
    if (typeof query.status !== 'string') {
      errors.push('Le filtre status doit être une chaîne de caractères.');
    } else {
      const val = query.status.trim().toUpperCase().replace(/-/g, '_');
      if (val === 'RETURNED' || val === 'NOT_RETURNED') {
        status = val as ScreenLoanStatusFilter;
      } else {
        errors.push('Le filtre status doit être RETURNED ou NOT_RETURNED.');
      }
    }
  }

  if (query.borrowerName != null && typeof query.borrowerName !== 'string') {
    errors.push('Le filtre borrowerName doit être une chaîne de caractères.');
  }

  if (errors.length > 0) {
    return { value: {}, errors };
  }

  return {
    value: {
      borrowerName,
      status,
    },
  };
};

