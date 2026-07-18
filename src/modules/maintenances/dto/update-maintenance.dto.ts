export interface UpdateMaintenanceDto {
  title?: string;
  description?: string;
  scheduledDate?: Date;
  completedDate?: Date;
  technician?: string;
  cost?: number;
}

export const validateUpdateMaintenanceDto = (
  body: any,
): { value?: UpdateMaintenanceDto; errors?: string[] } => {
  const errors: string[] = [];
  const value: UpdateMaintenanceDto = {};

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0) {
      errors.push('Le titre doit être une chaîne non vide lorsqu’il est fourni.');
    } else {
      value.title = body.title.trim();
    }
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      errors.push('La description doit être une chaîne de caractères.');
    } else if (body.description.trim().length > 0) {
      value.description = body.description.trim();
    } else {
      value.description = undefined;
    }
  }

  if (body.scheduledDate !== undefined) {
    if (typeof body.scheduledDate !== 'string') {
      errors.push('La date planifiée (scheduledDate) doit être une chaîne ISO (date-time).');
    } else {
      const parsed = new Date(body.scheduledDate);
      if (Number.isNaN(parsed.getTime())) {
        errors.push('La date planifiée (scheduledDate) doit être une date valide.');
      } else {
        value.scheduledDate = parsed;
      }
    }
  }

  if (body.completedDate !== undefined) {
    if (body.completedDate === null) {
      value.completedDate = undefined;
    } else if (typeof body.completedDate !== 'string') {
      errors.push('La date de fin (completedDate) doit être une chaîne ISO (date-time).');
    } else {
      const parsed = new Date(body.completedDate);
      if (Number.isNaN(parsed.getTime())) {
        errors.push('La date de fin (completedDate) doit être une date valide.');
      } else {
        value.completedDate = parsed;
      }
    }
  }

  if (body.technician !== undefined) {
    if (typeof body.technician !== 'string') {
      errors.push('Le technicien (technician) doit être une chaîne de caractères.');
    } else if (body.technician.trim().length > 0) {
      value.technician = body.technician.trim();
    } else {
      value.technician = undefined;
    }
  }

  if (body.cost !== undefined) {
    if (body.cost === null) {
      value.cost = undefined;
    } else {
      const parsed = Number(body.cost);
      if (Number.isNaN(parsed) || parsed < 0) {
        errors.push('Le coût (cost) doit être un nombre positif ou nul.');
      } else {
        value.cost = parsed;
      }
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { value };
};
