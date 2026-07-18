export interface CreateSupplierDto {
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const validateCreateSupplierDto = (body: any): { value?: CreateSupplierDto; errors?: string[] } => {
  const errors: string[] = [];

  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('Le nom du fournisseur est requis et ne doit pas être vide.');
  }

  if (body.contact != null && typeof body.contact !== 'string') {
    errors.push('Le contact doit être une chaîne de caractères.');
  }

  if (body.email != null && typeof body.email !== 'string') {
    errors.push("L'email doit être une chaîne de caractères.");
  }

  if (body.phone != null && typeof body.phone !== 'string') {
    errors.push('Le téléphone doit être une chaîne de caractères.');
  }

  if (body.address != null && typeof body.address !== 'string') {
    errors.push("L'adresse doit être une chaîne de caractères.");
  }

  if (errors.length > 0) {
    return { errors };
  }

  const value: CreateSupplierDto = {
    name: body.name.trim(),
    contact:
      typeof body.contact === 'string' && body.contact.trim().length > 0
        ? body.contact.trim()
        : undefined,
    email:
      typeof body.email === 'string' && body.email.trim().length > 0
        ? body.email.trim()
        : undefined,
    phone:
      typeof body.phone === 'string' && body.phone.trim().length > 0
        ? body.phone.trim()
        : undefined,
    address:
      typeof body.address === 'string' && body.address.trim().length > 0
        ? body.address.trim()
        : undefined,
  };

  return { value };
};
