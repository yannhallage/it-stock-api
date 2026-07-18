import { AssetStatus } from '@prisma/client';

export interface AssetFilterDto {
  search?: string;
  status?: AssetStatus;
  departmentId?: number;
  materialTypeId?: number;
  categoryId?: number;
  brandId?: number;
  entryDateFrom?: Date;
  entryDateTo?: Date;
  computer?: string;
}

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

const readText = (value: unknown): string | undefined => {
  if (Array.isArray(value)) return readText(value[0]);
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const readInt = (
  value: unknown,
  fieldLabel: string,
  errors: string[],
): number | undefined => {
  if (value == null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string' && typeof value !== 'number' && !Array.isArray(value)) {
    errors.push(`${fieldLabel} doit etre un entier valide.`);
    return undefined;
  }

  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = parseInt(String(raw), 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    errors.push(`${fieldLabel} doit etre un entier strictement positif.`);
    return undefined;
  }

  return parsed;
};

const readDate = (
  value: unknown,
  fieldLabel: string,
  errors: string[],
  boundary: 'start' | 'end',
): Date | undefined => {
  const raw = readText(value);
  if (!raw) return undefined;

  if (typeof value !== 'string' && !Array.isArray(value)) {
    errors.push(`${fieldLabel} doit etre une date valide.`);
    return undefined;
  }

  const date =
    dateOnlyPattern.test(raw) && boundary === 'start'
      ? new Date(`${raw}T00:00:00.000Z`)
      : dateOnlyPattern.test(raw) && boundary === 'end'
        ? new Date(`${raw}T23:59:59.999Z`)
        : new Date(raw);

  if (Number.isNaN(date.getTime())) {
    errors.push(`${fieldLabel} doit etre une date valide.`);
    return undefined;
  }

  return date;
};

export const validateAssetFilterDto = (query: any): { value: AssetFilterDto; errors?: string[] } => {
  const errors: string[] = [];

  const search = readText(query.search) ?? readText(query.q);
  const computer = readText(query.computer);
  const departmentId = readInt(query.departmentId, 'departmentId', errors);
  const materialTypeId = readInt(query.materialTypeId, 'materialTypeId', errors);
  const categoryId = readInt(query.categoryId, 'categoryId', errors);
  const brandId = readInt(query.brandId, 'brandId', errors);
  const entryDateFrom = readDate(
    query.entryDateFrom ?? query.from ?? query.startDate,
    'entryDateFrom',
    errors,
    'start',
  );
  const entryDateTo = readDate(
    query.entryDateTo ?? query.to ?? query.endDate,
    'entryDateTo',
    errors,
    'end',
  );

  let status: AssetStatus | undefined;
  const rawStatus = readText(query.status);
  if (rawStatus) {
    const normalizedStatus = rawStatus.toUpperCase().replace(/-/g, '_');
    if (Object.values(AssetStatus).includes(normalizedStatus as AssetStatus)) {
      status = normalizedStatus as AssetStatus;
    } else {
      errors.push(`Le statut doit etre l'une des valeurs suivantes: ${Object.values(AssetStatus).join(', ')}.`);
    }
  }

  if (query.search != null && typeof query.search !== 'string' && !Array.isArray(query.search)) {
    errors.push('Le filtre de recherche doit etre une chaine de caracteres.');
  }

  if (query.q != null && typeof query.q !== 'string' && !Array.isArray(query.q)) {
    errors.push('Le filtre q doit etre une chaine de caracteres.');
  }

  if (query.status != null && typeof query.status !== 'string' && !Array.isArray(query.status)) {
    errors.push('Le statut doit etre une chaine de caracteres.');
  }

  if (
    query.departmentId != null &&
    typeof query.departmentId !== 'string' &&
    typeof query.departmentId !== 'number' &&
    !Array.isArray(query.departmentId)
  ) {
    errors.push('Le filtre departmentId doit etre un entier.');
  }

  if (
    query.materialTypeId != null &&
    typeof query.materialTypeId !== 'string' &&
    typeof query.materialTypeId !== 'number' &&
    !Array.isArray(query.materialTypeId)
  ) {
    errors.push('Le filtre materialTypeId doit etre un entier.');
  }

  if (
    query.categoryId != null &&
    typeof query.categoryId !== 'string' &&
    typeof query.categoryId !== 'number' &&
    !Array.isArray(query.categoryId)
  ) {
    errors.push('Le filtre categoryId doit etre un entier.');
  }

  if (
    query.brandId != null &&
    typeof query.brandId !== 'string' &&
    typeof query.brandId !== 'number' &&
    !Array.isArray(query.brandId)
  ) {
    errors.push('Le filtre brandId doit etre un entier.');
  }

  if (query.computer != null && typeof query.computer !== 'string' && !Array.isArray(query.computer)) {
    errors.push('Le filtre computer doit etre une chaine de caracteres.');
  }

  if (entryDateFrom && entryDateTo && entryDateFrom.getTime() > entryDateTo.getTime()) {
    errors.push('La date de debut ne peut pas etre posterieure a la date de fin.');
  }

  if (errors.length > 0) {
    return { errors, value: {} };
  }

  return {
    value: {
      search,
      status,
      departmentId,
      materialTypeId,
      categoryId,
      brandId,
      computer,
      entryDateFrom,
      entryDateTo,
    },
  };
};
