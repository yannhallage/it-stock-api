import { AssetStatus } from '@prisma/client';

export interface UpdateAssetDto {
  inventoryNumber?: string;
  serialNumber?: string | null;
  categoryId?: number;
  materialTypeId?: number;
  brandId?: number;
  supplierId?: number | null;
  locationId?: number | null;
  model?: string;
  entryDate?: Date;
  purchasePrice?: number | null;
  warrantyStartDate?: Date | null;
  warrantyEndDate?: Date | null;
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

const parseNullableInt = (
  value: unknown,
  fieldLabel: string,
  errors: string[],
): number | null | undefined => {
  if (value === null || value === '') {
    return null;
  }

  if (value === undefined) {
    return undefined;
  }

  return parseOptionalInt(value, fieldLabel, errors) ?? null;
};

export const validateUpdateAssetDto = (
  body: any,
): { value?: UpdateAssetDto; errors?: string[] } => {
  const errors: string[] = [];
  const value: UpdateAssetDto = {};

  const hasInput =
    body.inventoryNumber !== undefined ||
    body.serialNumber !== undefined ||
    body.serial_number !== undefined ||
    body.categoryId !== undefined ||
    body.materialTypeId !== undefined ||
    body.brandId !== undefined ||
    body.supplierId !== undefined ||
    body.locationId !== undefined ||
    body.model !== undefined ||
    body.entryDate !== undefined ||
    body.purchasePrice !== undefined ||
    body.warrantyStartDate !== undefined ||
    body.warrantyEndDate !== undefined ||
    body.status !== undefined;

  if (!hasInput) {
    errors.push('Au moins un champ à mettre à jour doit être fourni.');
  }

  if (body.inventoryNumber !== undefined) {
    if (typeof body.inventoryNumber !== 'string' || body.inventoryNumber.trim().length === 0) {
      errors.push("Le numéro d'inventaire doit être une chaîne non vide lorsqu'il est fourni.");
    } else {
      value.inventoryNumber = body.inventoryNumber.trim();
    }
  }

  const serialInput = body.serialNumber !== undefined ? body.serialNumber : body.serial_number;
  if (serialInput !== undefined) {
    if (serialInput === null) {
      value.serialNumber = null;
    } else if (typeof serialInput !== 'string') {
      errors.push('Le numéro de série doit être une chaîne ou null pour effacer.');
    } else if (serialInput.trim().length === 0) {
      value.serialNumber = null;
    } else {
      value.serialNumber = serialInput.trim();
    }
  }

  if (body.categoryId !== undefined) {
    const parsed = parseOptionalInt(body.categoryId, 'La catégorie (categoryId)', errors);
    if (parsed !== undefined) {
      value.categoryId = parsed;
    }
  }

  if (body.materialTypeId !== undefined) {
    const parsed = parseOptionalInt(body.materialTypeId, 'Le type de matériel (materialTypeId)', errors);
    if (parsed !== undefined) {
      value.materialTypeId = parsed;
    }
  }

  if (body.brandId !== undefined) {
    const parsed = parseOptionalInt(body.brandId, 'La marque (brandId)', errors);
    if (parsed !== undefined) {
      value.brandId = parsed;
    }
  }

  if (body.supplierId !== undefined) {
    value.supplierId = parseNullableInt(body.supplierId, 'Le fournisseur (supplierId)', errors);
  }

  if (body.locationId !== undefined) {
    value.locationId = parseNullableInt(body.locationId, 'La localisation (locationId)', errors);
  }

  if (body.model !== undefined) {
    if (typeof body.model !== 'string' || body.model.trim().length === 0) {
      errors.push('Le modèle doit être une chaîne non vide lorsqu’il est fourni.');
    } else {
      value.model = body.model.trim();
    }
  }

  if (body.entryDate !== undefined) {
    if (typeof body.entryDate !== 'string') {
      errors.push("La date d'entrée doit être une chaîne ISO (YYYY-MM-DD) lorsqu'elle est fournie.");
    } else {
      const d = new Date(body.entryDate);
      if (Number.isNaN(d.getTime())) {
        errors.push("La date d'entrée doit être une date valide.");
      } else {
        value.entryDate = d;
      }
    }
  }

  if (body.purchasePrice !== undefined) {
    if (body.purchasePrice === null || body.purchasePrice === '') {
      value.purchasePrice = null;
    } else {
      const num = Number(body.purchasePrice);
      if (Number.isNaN(num) || num < 0) {
        errors.push('Le prix d\'achat doit être un nombre positif ou nul.');
      } else {
        value.purchasePrice = num;
      }
    }
  }

  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || body.status.trim().length === 0) {
      errors.push('Le statut doit être une chaîne non vide lorsqu’il est fourni.');
    } else {
      const normalizedStatus = body.status.trim().toUpperCase().replace(/-/g, '_');
      if (Object.values(AssetStatus).includes(normalizedStatus as AssetStatus)) {
        value.status = normalizedStatus as AssetStatus;
      } else {
        errors.push(`Le statut doit être l'une des valeurs suivantes: ${Object.values(AssetStatus).join(', ')}.`);
      }
    }
  }

  let parsedWarrantyStart: Date | null | undefined;
  if (body.warrantyStartDate !== undefined) {
    if (body.warrantyStartDate === null || body.warrantyStartDate === '') {
      parsedWarrantyStart = null;
      value.warrantyStartDate = null;
    } else if (typeof body.warrantyStartDate !== 'string') {
      errors.push("La date de début de garantie doit être une chaîne ISO ou vide/null pour effacer.");
    } else {
      const d = new Date(body.warrantyStartDate);
      if (Number.isNaN(d.getTime())) {
        errors.push('La date de début de garantie doit être une date valide.');
      } else {
        parsedWarrantyStart = d;
        value.warrantyStartDate = d;
      }
    }
  }

  let parsedWarrantyEnd: Date | null | undefined;
  if (body.warrantyEndDate !== undefined) {
    if (body.warrantyEndDate === null || body.warrantyEndDate === '') {
      parsedWarrantyEnd = null;
      value.warrantyEndDate = null;
    } else if (typeof body.warrantyEndDate !== 'string') {
      errors.push("La date de fin de garantie doit être une chaîne ISO ou vide/null pour effacer.");
    } else {
      const d = new Date(body.warrantyEndDate);
      if (Number.isNaN(d.getTime())) {
        errors.push('La date de fin de garantie doit être une date valide.');
      } else {
        parsedWarrantyEnd = d;
        value.warrantyEndDate = d;
      }
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  if (parsedWarrantyStart !== undefined && parsedWarrantyEnd !== undefined) {
    if (parsedWarrantyStart && parsedWarrantyEnd && parsedWarrantyEnd.getTime() < parsedWarrantyStart.getTime()) {
      errors.push('La date de fin de garantie ne peut pas être antérieure à la date de début.');
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { value };
};
