export interface CreateMaintenanceDto {
  assetId: number;
  title: string;
  description?: string;
  scheduledDate: Date;
  completedDate?: Date;
  technician?: string;
  cost?: number;
}

export const validateCreateMaintenanceDto = (
  body: any,
): { value?: CreateMaintenanceDto; errors?: string[] } => {
  const errors: string[] = [];

  if (body.assetId == null) {
    errors.push("L'identifiant du matériel (assetId) est requis.");
  } else {
    const parsed = parseInt(String(body.assetId), 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      errors.push("L'identifiant du matériel (assetId) doit être un entier strictement positif.");
    }
  }

  if (typeof body.title !== 'string' || body.title.trim().length === 0) {
    errors.push('Le titre est requis et ne doit pas être vide.');
  }

  if (body.description != null && typeof body.description !== 'string') {
    errors.push('La description doit être une chaîne de caractères.');
  }

  if (typeof body.scheduledDate !== 'string') {
    errors.push(
      'La date planifiée (scheduledDate) est requise et doit être une chaîne ISO (date-time).',
    );
  }

  let scheduledDate: Date | null = null;
  if (typeof body.scheduledDate === 'string') {
    scheduledDate = new Date(body.scheduledDate);
    if (Number.isNaN(scheduledDate.getTime())) {
      errors.push('La date planifiée (scheduledDate) doit être une date valide.');
    }
  }

  let completedDate: Date | undefined;
  if (body.completedDate != null) {
    if (typeof body.completedDate !== 'string') {
      errors.push('La date de fin (completedDate) doit être une chaîne ISO (date-time).');
    } else {
      const parsed = new Date(body.completedDate);
      if (Number.isNaN(parsed.getTime())) {
        errors.push('La date de fin (completedDate) doit être une date valide.');
      } else {
        completedDate = parsed;
      }
    }
  }

  if (body.technician != null && typeof body.technician !== 'string') {
    errors.push('Le technicien (technician) doit être une chaîne de caractères.');
  }

  if (body.cost != null) {
    const parsed = Number(body.cost);
    if (Number.isNaN(parsed) || parsed < 0) {
      errors.push('Le coût (cost) doit être un nombre positif ou nul.');
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    value: {
      assetId: parseInt(String(body.assetId), 10),
      title: body.title.trim(),
      description:
        typeof body.description === 'string' && body.description.trim().length > 0
          ? body.description.trim()
          : undefined,
      scheduledDate: scheduledDate!,
      completedDate,
      technician:
        typeof body.technician === 'string' && body.technician.trim().length > 0
          ? body.technician.trim()
          : undefined,
      cost: body.cost != null ? Number(body.cost) : undefined,
    },
  };
};
