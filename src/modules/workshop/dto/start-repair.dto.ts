export interface StartRepairDto {
  incidentId: number;
  workshopEntryDate: Date;
  technicianName?: string;
  action?: string;
  cost?: number;
}

export const validateStartRepairDto = (
  body: any,
): { value?: StartRepairDto; errors?: string[] } => {
  const errors: string[] = [];

  if (body.incidentId == null) {
    errors.push("L'identifiant de l'incident (incidentId) est requis.");
  } else {
    const parsed = parseInt(String(body.incidentId), 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      errors.push("L'identifiant de l'incident doit être un entier strictement positif.");
    }
  }

  if (typeof body.workshopEntryDate !== 'string') {
    errors.push(
      "La date d'entrée atelier (workshopEntryDate) est requise et doit être une chaîne ISO (date-time).",
    );
  }

  let parsedDate: Date | null = null;
  if (typeof body.workshopEntryDate === 'string') {
    parsedDate = new Date(body.workshopEntryDate);
    if (Number.isNaN(parsedDate.getTime())) {
      errors.push("La date d'entrée atelier doit être une date valide.");
    }
  }

  if (body.action != null && typeof body.action !== 'string') {
    errors.push("L'action doit être une chaîne de caractères.");
  }

  if (body.technicianName != null && typeof body.technicianName !== 'string') {
    errors.push('Le nom du réparateur doit être une chaîne de caractères.');
  }

  if (body.cost != null) {
    const num = Number(body.cost);
    if (Number.isNaN(num) || num < 0) {
      errors.push('Le coût doit être un nombre positif ou nul.');
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  const incidentId = parseInt(String(body.incidentId), 10);
  const value: StartRepairDto = {
    incidentId,
    workshopEntryDate: parsedDate!,
    technicianName:
      body.technicianName != null && String(body.technicianName).trim().length > 0
        ? String(body.technicianName).trim()
        : undefined,
    action: body.action != null ? String(body.action).trim() : undefined,
    cost: body.cost != null ? Number(body.cost) : undefined,
  };

  return { value };
};
