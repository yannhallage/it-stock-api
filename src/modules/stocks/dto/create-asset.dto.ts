export interface CreateAssetDto {
  inventoryNumber?: string;
  type: string;
  brand: string;
  model: string;
  entryDate: Date;
  supplier: string;
  warrantyStartDate?: Date;
  warrantyEndDate?: Date;
  status?: string;
}

export const validateCreateAssetDto = (body: any): { value?: CreateAssetDto; errors?: string[] } => {
  const errors: string[] = [];

  if (body.inventoryNumber != null && typeof body.inventoryNumber !== 'string') {
    errors.push("Le numéro d'inventaire doit être une chaîne de caractères s'il est fourni.");
  }

  if (typeof body.type !== 'string' || body.type.trim().length === 0) {
    errors.push('Le type est requis et ne doit pas être vide.');
  }

  if (typeof body.brand !== 'string' || body.brand.trim().length === 0) {
    errors.push('La marque est requise et ne doit pas être vide.');
  }

  if (typeof body.model !== 'string' || body.model.trim().length === 0) {
    errors.push('Le modèle est requis et ne doit pas être vide.');
  }

  if (typeof body.entryDate !== 'string') {
    errors.push("La date d'entrée est requise et doit être une chaîne ISO (YYYY-MM-DD).");
  }

  if (typeof body.supplier !== 'string' || body.supplier.trim().length === 0) {
    errors.push('Le fournisseur est requis et ne doit pas être vide.');
  }

  if (body.status != null && typeof body.status !== 'string') {
    errors.push("Le statut doit être une chaîne de caractères s'il est fourni.");
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
    type: body.type.trim(),
    brand: body.brand.trim(),
    model: body.model.trim(),
    entryDate: parsedDate!,
    supplier: body.supplier.trim(),
    warrantyStartDate: parsedWarrantyStart,
    warrantyEndDate: parsedWarrantyEnd,
    status:
      typeof body.status === 'string' && body.status.trim().length > 0 ? body.status.trim() : undefined,
  };

  return { value };
};

