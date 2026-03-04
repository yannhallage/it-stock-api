export interface CreateSupplierDto {
  name: string;
  contact?: string;
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
    address:
      typeof body.address === 'string' && body.address.trim().length > 0
        ? body.address.trim()
        : undefined,
  };

  return { value };
};

