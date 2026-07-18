import { AssetStatus } from '@prisma/client';

export const INVENTORY_COLUMN_KEYS = [
  'inventoryNumber',
  'type',
  'brandModel',
  'firstName',
  'lastName',
  'direction',
  'status',
  'entryDate',
  'warranty',
  'supplier',
  'serialNumber',
  'location',
] as const;

export type InventoryColumnKey = (typeof INVENTORY_COLUMN_KEYS)[number];

export interface AssetFilterDto {
  search?: string;
  status?: AssetStatus;
  departmentId?: number;
  userId?: string;
  materialTypeId?: number;
  materialTypeIds?: number[];
  categoryId?: number;
  brandId?: number;
  entryDateFrom?: Date;
  entryDateTo?: Date;
  computer?: string;
  warrantyExpired?: boolean;
  minAgeYears?: number;
  columns?: InventoryColumnKey[];
  physicalInventoryPending?: boolean;
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

const readIntList = (
  value: unknown,
  fieldLabel: string,
  errors: string[],
): number[] | undefined => {
  if (value == null || value === '') return undefined;

  const rawValues = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [value];

  const ids: number[] = [];
  for (const raw of rawValues) {
    const parsed = parseInt(String(raw).trim(), 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      errors.push(`${fieldLabel} doit contenir des entiers strictement positifs.`);
      return undefined;
    }
    if (!ids.includes(parsed)) ids.push(parsed);
  }

  return ids.length > 0 ? ids : undefined;
};

const readBool = (value: unknown): boolean | undefined => {
  const raw = readText(value)?.toLowerCase();
  if (!raw) return undefined;
  if (['true', '1', 'yes', 'oui'].includes(raw)) return true;
  if (['false', '0', 'no', 'non'].includes(raw)) return false;
  return undefined;
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
  const userId = readText(query.userId);
  const departmentId = readInt(query.departmentId, 'departmentId', errors);
  const materialTypeId = readInt(query.materialTypeId, 'materialTypeId', errors);
  const materialTypeIds = readIntList(
    query.materialTypeIds ?? query['materialTypeIds[]'],
    'materialTypeIds',
    errors,
  );
  const categoryId = readInt(query.categoryId, 'categoryId', errors);
  const brandId = readInt(query.brandId, 'brandId', errors);
  const minAgeYears = readInt(query.minAgeYears, 'minAgeYears', errors);
  const warrantyExpired = readBool(query.warrantyExpired);
  const physicalInventoryPending = readBool(query.physicalInventoryPending);
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

  let columns: InventoryColumnKey[] | undefined;
  const rawColumns = query.columns ?? query['columns[]'];
  if (rawColumns != null && rawColumns !== '') {
    const parts = Array.isArray(rawColumns)
      ? rawColumns.map(String)
      : String(rawColumns).split(',');
    const parsed: InventoryColumnKey[] = [];
    for (const part of parts) {
      const key = part.trim() as InventoryColumnKey;
      if (!(INVENTORY_COLUMN_KEYS as readonly string[]).includes(key)) {
        errors.push(`Colonne invalide: ${part}. Valeurs: ${INVENTORY_COLUMN_KEYS.join(', ')}`);
        break;
      }
      if (!parsed.includes(key)) parsed.push(key);
    }
    if (parsed.length > 0) columns = parsed;
  }

  if (query.search != null && typeof query.search !== 'string' && !Array.isArray(query.search)) {
    errors.push('Le filtre de recherche doit etre une chaine de caracteres.');
  }

  if (entryDateFrom && entryDateTo && entryDateFrom.getTime() > entryDateTo.getTime()) {
    errors.push('La date de debut ne peut pas etre posterieure a la date de fin.');
  }

  if (warrantyExpired === undefined && query.warrantyExpired != null && query.warrantyExpired !== '') {
    errors.push('warrantyExpired doit etre true ou false.');
  }

  if (errors.length > 0) {
    return { errors, value: {} };
  }

  return {
    value: {
      search,
      status,
      departmentId,
      userId,
      materialTypeId,
      materialTypeIds,
      categoryId,
      brandId,
      computer,
      entryDateFrom,
      entryDateTo,
      warrantyExpired,
      minAgeYears,
      columns,
      physicalInventoryPending,
    },
  };
};
