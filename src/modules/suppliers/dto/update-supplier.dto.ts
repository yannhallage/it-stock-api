export interface UpdateSupplierDto {
  name?: string;
  contact?: string;
  email?: string;
  phone?: string;
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

  if (body.email !== undefined) {
    if (typeof body.email !== 'string') {
      errors.push("L'email doit être une chaîne de caractères.");
    } else if (body.email.trim().length > 0) {
      value.email = body.email.trim();
    } else {
      value.email = undefined;
    }
  }

  if (body.phone !== undefined) {
    if (typeof body.phone !== 'string') {
      errors.push('Le téléphone doit être une chaîne de caractères.');
    } else if (body.phone.trim().length > 0) {
      value.phone = body.phone.trim();
    } else {
      value.phone = undefined;
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
