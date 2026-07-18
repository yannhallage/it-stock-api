import { AssetStatus } from '@prisma/client';

export interface CreateAssetDto {
  inventoryNumber?: string;
  serialNumber?: string | null;
  categoryId: number;
  materialTypeId: number;
  brandId: number;
  supplierId?: number;
  locationId?: number;
  model: string;
  entryDate: Date;
  purchasePrice?: number;
  warrantyStartDate?: Date;
  warrantyEndDate?: Date;
  status?: AssetStatus;
}

const parseOptionalInt = (
  value: unknown,
  fieldLabel: string,
  errors: string[],
): number | undefined => {
  if (value == null || value === '') {
    return undefined;
  }

  const parsed = parseInt(String(value), 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    errors.push(`${fieldLabel} doit être un entier strictement positif.`);
    return undefined;
  }

  return parsed;
};

const parseRequiredInt = (
  value: unknown,
  fieldLabel: string,
  errors: string[],
): number | undefined => {
  if (value == null || value === '') {
    errors.push(`${fieldLabel} est requis.`);
    return undefined;
  }

  return parseOptionalInt(value, fieldLabel, errors);
};

export const validateCreateAssetDto = (body: any): { value?: CreateAssetDto; errors?: string[] } => {
  const errors: string[] = [];

  if (body.inventoryNumber != null && typeof body.inventoryNumber !== 'string') {
    errors.push("Le numéro d'inventaire doit être une chaîne de caractères s'il est fourni.");
  }

  const serialInput = body.serialNumber !== undefined ? body.serialNumber : body.serial_number;
  let parsedSerial: string | null | undefined;
  if (serialInput !== undefined) {
    if (serialInput === null) {
      parsedSerial = null;
    } else if (typeof serialInput !== 'string') {
      errors.push('Le numéro de série doit être une chaîne ou null.');
    } else if (serialInput.trim().length === 0) {
      parsedSerial = null;
    } else {
      parsedSerial = serialInput.trim();
    }
  }

  const categoryId = parseRequiredInt(body.categoryId, 'La catégorie (categoryId)', errors);
  const materialTypeId = parseRequiredInt(body.materialTypeId, 'Le type de matériel (materialTypeId)', errors);
  const brandId = parseRequiredInt(body.brandId, 'La marque (brandId)', errors);
  const supplierId = parseOptionalInt(body.supplierId, 'Le fournisseur (supplierId)', errors);
  const locationId = parseOptionalInt(body.locationId, 'La localisation (locationId)', errors);

  if (typeof body.model !== 'string' || body.model.trim().length === 0) {
    errors.push('Le modèle est requis et ne doit pas être vide.');
  }

  if (typeof body.entryDate !== 'string') {
    errors.push("La date d'entrée est requise et doit être une chaîne ISO (YYYY-MM-DD).");
  }

  let parsedPurchasePrice: number | undefined;
  if (body.purchasePrice != null && body.purchasePrice !== '') {
    const num = Number(body.purchasePrice);
    if (Number.isNaN(num) || num < 0) {
      errors.push('Le prix d\'achat doit être un nombre positif ou nul.');
    } else {
      parsedPurchasePrice = num;
    }
  }

  let parsedStatus: AssetStatus | undefined;
  if (body.status != null && body.status !== '') {
    if (typeof body.status !== 'string') {
      errors.push("Le statut doit être une chaîne de caractères s'il est fourni.");
    } else {
      const normalizedStatus = body.status.trim().toUpperCase().replace(/-/g, '_');
      if (Object.values(AssetStatus).includes(normalizedStatus as AssetStatus)) {
        parsedStatus = normalizedStatus as AssetStatus;
      } else {
        errors.push(`Le statut doit être l'une des valeurs suivantes: ${Object.values(AssetStatus).join(', ')}.`);
      }
    }
  }

  let parsedWarrantyStart: Date | undefined;
  if (body.warrantyStartDate != null && body.warrantyStartDate !== '') {
    if (typeof body.warrantyStartDate !== 'string') {
      errors.push("La date de début de garantie doit être une chaîne ISO (YYYY-MM-DD) si elle est fournie.");
    } else {
      const d = new Date(body.warrantyStartDate);
      if (Number.isNaN(d.getTime())) {
        errors.push('La date de début de garantie doit être une date valide.');
      } else {
        parsedWarrantyStart = d;
      }
    }
  }

  let parsedWarrantyEnd: Date | undefined;
  if (body.warrantyEndDate != null && body.warrantyEndDate !== '') {
    if (typeof body.warrantyEndDate !== 'string') {
      errors.push("La date de fin de garantie doit être une chaîne ISO (YYYY-MM-DD) si elle est fournie.");
    } else {
      const d = new Date(body.warrantyEndDate);
      if (Number.isNaN(d.getTime())) {
        errors.push('La date de fin de garantie doit être une date valide.');
      } else {
        parsedWarrantyEnd = d;
      }
    }
  }

  let parsedDate: Date | null = null;
  if (typeof body.entryDate === 'string') {
    parsedDate = new Date(body.entryDate);
    if (Number.isNaN(parsedDate.getTime())) {
      errors.push("La date d'entrée doit être une date valide.");
    }
  }

  if (
    parsedWarrantyStart &&
    parsedWarrantyEnd &&
    parsedWarrantyEnd.getTime() < parsedWarrantyStart.getTime()
  ) {
    errors.push('La date de fin de garantie ne peut pas être antérieure à la date de début.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  const value: CreateAssetDto = {
    inventoryNumber:
      typeof body.inventoryNumber === 'string' && body.inventoryNumber.trim().length > 0
        ? body.inventoryNumber.trim()
        : undefined,
    serialNumber: parsedSerial,
    categoryId: categoryId!,
    materialTypeId: materialTypeId!,
    brandId: brandId!,
    supplierId,
    locationId,
    model: body.model.trim(),
    entryDate: parsedDate!,
    purchasePrice: parsedPurchasePrice,
    warrantyStartDate: parsedWarrantyStart,
    warrantyEndDate: parsedWarrantyEnd,
    status: parsedStatus,
  };

  return { value };
};
