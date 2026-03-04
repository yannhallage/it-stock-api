export interface UpdateSupplierDto {
  name?: string;
  contact?: string;
  address?: string;
}

export const validateUpdateSupplierDto = (body: any): { value?: UpdateSupplierDto; errors?: string[] } => {
  const errors: string[] = [];

  const value: UpdateSupplierDto = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push('Le nom du fournisseur doit être une chaîne non vide lorsqu’il est fourni.');
    } else {
      value.name = body.name.trim();
    }
  }

  if (body.contact !== undefined) {
    if (typeof body.contact !== 'string') {
      errors.push('Le contact doit être une chaîne de caractères.');
    } else if (body.contact.trim().length > 0) {
      value.contact = body.contact.trim();
    } else {
      value.contact = undefined;
    }
  }

  if (body.address !== undefined) {
    if (typeof body.address !== 'string') {
      errors.push("L'adresse doit être une chaîne de caractères.");
    } else if (body.address.trim().length > 0) {
      value.address = body.address.trim();
    } else {
      value.address = undefined;
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { value };
};

