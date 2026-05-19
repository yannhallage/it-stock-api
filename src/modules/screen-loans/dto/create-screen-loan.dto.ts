export interface CreateScreenLoanDto {
  assetId: number;
  borrowerName: string;
  borrowerDepartment?: string;
  loanDate: Date;
  expectedReturnDate: Date;
  note?: string;
}

export const validateCreateScreenLoanDto = (
  body: any,
): { value?: CreateScreenLoanDto; errors?: string[] } => {
  const errors: string[] = [];

  if (body.assetId == null) {
    errors.push("L'identifiant du matériel (assetId) est requis.");
  } else {
    const parsed = parseInt(String(body.assetId), 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      errors.push("L'identifiant du matériel (assetId) doit être un entier strictement positif.");
    }
  }

  if (body.borrowerName == null) {
    errors.push("Le nom de l'emprunteur (borrowerName) est requis.");
  } else if (typeof body.borrowerName !== 'string') {
    errors.push("Le nom de l'emprunteur (borrowerName) doit être une chaîne de caractères.");
  } else if (String(body.borrowerName).trim().length === 0) {
    errors.push("Le nom de l'emprunteur (borrowerName) ne peut pas être vide.");
  }

  if (body.borrowerDepartment != null && typeof body.borrowerDepartment !== 'string') {
    errors.push("La direction de l'emprunteur (borrowerDepartment) doit être une chaîne de caractères.");
  }

  if (body.note != null && typeof body.note !== 'string') {
    errors.push('La note doit être une chaîne de caractères.');
  }

  if (typeof body.loanDate !== 'string') {
    errors.push('La date de prêt (loanDate) est requise et doit être une chaîne ISO (date-time).');
  }

  if (typeof body.expectedReturnDate !== 'string') {
    errors.push(
      'La date prévue de retour (expectedReturnDate) est requise et doit être une chaîne ISO (date-time).',
    );
  }

  let loanDate: Date | null = null;
  if (typeof body.loanDate === 'string') {
    loanDate = new Date(body.loanDate);
    if (Number.isNaN(loanDate.getTime())) {
      errors.push('La date de prêt (loanDate) doit être une date valide.');
    }
  }

  let expectedReturnDate: Date | null = null;
  if (typeof body.expectedReturnDate === 'string') {
    expectedReturnDate = new Date(body.expectedReturnDate);
    if (Number.isNaN(expectedReturnDate.getTime())) {
      errors.push('La date prévue de retour (expectedReturnDate) doit être une date valide.');
    }
  }

  if (loanDate && expectedReturnDate && expectedReturnDate.getTime() < loanDate.getTime()) {
    errors.push('La date prévue de retour ne peut pas être antérieure à la date de prêt.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    value: {
      assetId: parseInt(String(body.assetId), 10),
      borrowerName: String(body.borrowerName).trim(),
      borrowerDepartment:
        typeof body.borrowerDepartment === 'string' && body.borrowerDepartment.trim().length > 0
          ? body.borrowerDepartment.trim()
          : undefined,
      loanDate: loanDate!,
      expectedReturnDate: expectedReturnDate!,
      note:
        typeof body.note === 'string' && body.note.trim().length > 0
          ? body.note.trim()
          : undefined,
    },
  };
};

