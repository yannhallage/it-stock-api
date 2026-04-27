export interface UpdateAssetDto {
  inventoryNumber?: string;
  serial_number?: string | null;
  type?: string;
  brand?: string;
  model?: string;
  entryDate?: Date;
  supplier?: string;
  warrantyStartDate?: Date | null;
  warrantyEndDate?: Date | null;
  warrantyMonths?: number;
  status?: string;
}

export const validateUpdateAssetDto = (
  body: any,
): { value?: UpdateAssetDto; errors?: string[] } => {
  const errors: string[] = [];
  const value: UpdateAssetDto = {};

  const hasInput =
    body.inventoryNumber !== undefined ||
    body.serial_number !== undefined ||
    body.serialNumber !== undefined ||
    body.type !== undefined ||
    body.brand !== undefined ||
    body.model !== undefined ||
    body.entryDate !== undefined ||
    body.supplier !== undefined ||
    body.warrantyStartDate !== undefined ||
    body.warrantyEndDate !== undefined ||
    body.warrantyMonths !== undefined ||
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

  const serialInput = body.serial_number !== undefined ? body.serial_number : body.serialNumber;
  if (serialInput !== undefined) {
    if (serialInput === null) {
      value.serial_number = null;
    } else if (typeof serialInput !== 'string') {
      errors.push('Le numéro de série doit être une chaîne ou null pour effacer.');
    } else if (serialInput.trim().length === 0) {
      value.serial_number = null;
    } else {
      value.serial_number = serialInput.trim();
    }
  }

  if (body.type !== undefined) {
    if (typeof body.type !== 'string' || body.type.trim().length === 0) {
      errors.push('Le type doit être une chaîne non vide lorsqu’il est fourni.');
    } else {
      value.type = body.type.trim();
    }
  }

  if (body.brand !== undefined) {
    if (typeof body.brand !== 'string' || body.brand.trim().length === 0) {
      errors.push('La marque doit être une chaîne non vide lorsqu’elle est fournie.');
    } else {
      value.brand = body.brand.trim();
    }
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

  if (body.supplier !== undefined) {
    if (typeof body.supplier !== 'string' || body.supplier.trim().length === 0) {
      errors.push('Le fournisseur doit être une chaîne non vide lorsqu’il est fourni.');
    } else {
      value.supplier = body.supplier.trim();
    }
  }

  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || body.status.trim().length === 0) {
      errors.push('Le statut doit être une chaîne non vide lorsqu’il est fourni.');
    } else {
      value.status = body.status.trim();
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

  let parsedWarrantyMonths: number | undefined;
  if (body.warrantyMonths !== undefined) {
    if (!Number.isInteger(body.warrantyMonths) || body.warrantyMonths < 0) {
      errors.push('La durée de garantie (warrantyMonths) doit être un entier positif ou nul.');
    } else {
      parsedWarrantyMonths = body.warrantyMonths;
      value.warrantyMonths = body.warrantyMonths;
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
