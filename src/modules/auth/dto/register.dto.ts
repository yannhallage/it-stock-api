export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export const validateRegisterDto = (body: any): { value?: RegisterDto; errors?: string[] } => {
  const errors: string[] = [];
  const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : '';
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: ['Le corps de la requête doit être un objet JSON.'] };
  }

  if (name.length < 2) {
    errors.push('Le nom est requis et doit contenir au moins 2 caractères.');
  }

  if (!emailPattern.test(email)) {
    errors.push("L'email est requis et doit être valide.");
  }

  if (typeof body.password !== 'string' || body.password.length < 6) {
    errors.push('Le mot de passe est requis et doit contenir au moins 6 caractères.');
  }

  if (
    body.confirmPassword !== undefined &&
    (typeof body.confirmPassword !== 'string' || body.confirmPassword !== body.password)
  ) {
    errors.push('La confirmation du mot de passe ne correspond pas.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  const value: RegisterDto = {
    name,
    email,
    password: body.password,
    confirmPassword: body.confirmPassword,
  };

  return { value };
};

