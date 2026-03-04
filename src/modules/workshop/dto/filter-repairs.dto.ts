import { RepairStatus } from '@prisma/client';

export interface RepairFilterDto {
  status?: RepairStatus;
}

export const validateRepairFilterDto = (
  query: any,
): { value: RepairFilterDto; errors?: string[] } => {
  const errors: string[] = [];

  let status: RepairStatus | undefined;

  if (query.status != null) {
    const val = String(query.status).toUpperCase().replace(/-/g, '_');
    if (val === 'EN_COURS' || val === 'TERMINE') {
      status = val as RepairStatus;
    } else {
      errors.push('Le filtre status doit être EN_COURS ou TERMINE.');
    }
  }

  if (errors.length > 0) {
    return { value: {}, errors };
  }

  return {
    value: { status },
  };
};
