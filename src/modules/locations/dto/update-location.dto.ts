export interface UpdateLocationDto {
  name?: string;
  building?: string;
  floor?: string;
  room?: string;
}

export const validateUpdateLocationDto = (
  body: any,
): { value?: UpdateLocationDto; errors?: string[] } => {
  const errors: string[] = [];

  const value: UpdateLocationDto = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push("Le nom de l'emplacement doit être une chaîne non vide lorsqu’il est fourni.");
    } else {
      value.name = body.name.trim();
    }
  }

  if (body.building !== undefined) {
    if (typeof body.building !== 'string') {
      errors.push('Le bâtiment doit être une chaîne de caractères.');
    } else if (body.building.trim().length > 0) {
      value.building = body.building.trim();
    } else {
      value.building = undefined;
    }
  }

  if (body.floor !== undefined) {
    if (typeof body.floor !== 'string') {
      errors.push("L'étage doit être une chaîne de caractères.");
    } else if (body.floor.trim().length > 0) {
      value.floor = body.floor.trim();
    } else {
      value.floor = undefined;
    }
  }

  if (body.room !== undefined) {
    if (typeof body.room !== 'string') {
      errors.push('La salle doit être une chaîne de caractères.');
    } else if (body.room.trim().length > 0) {
      value.room = body.room.trim();
    } else {
      value.room = undefined;
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { value };
};
