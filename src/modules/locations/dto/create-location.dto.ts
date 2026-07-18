export interface CreateLocationDto {
  name: string;
  building?: string;
  floor?: string;
  room?: string;
}

export const validateCreateLocationDto = (
  body: any,
): { value?: CreateLocationDto; errors?: string[] } => {
  const errors: string[] = [];

  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push("Le nom de l'emplacement est requis et ne doit pas être vide.");
  }

  if (body.building != null && typeof body.building !== 'string') {
    errors.push('Le bâtiment doit être une chaîne de caractères.');
  }

  if (body.floor != null && typeof body.floor !== 'string') {
    errors.push("L'étage doit être une chaîne de caractères.");
  }

  if (body.room != null && typeof body.room !== 'string') {
    errors.push('La salle doit être une chaîne de caractères.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  const value: CreateLocationDto = {
    name: body.name.trim(),
    building:
      typeof body.building === 'string' && body.building.trim().length > 0
        ? body.building.trim()
        : undefined,
    floor:
      typeof body.floor === 'string' && body.floor.trim().length > 0
        ? body.floor.trim()
        : undefined,
    room:
      typeof body.room === 'string' && body.room.trim().length > 0
        ? body.room.trim()
        : undefined,
  };

  return { value };
};
