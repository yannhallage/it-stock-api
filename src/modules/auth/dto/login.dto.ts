export interface LoginDto {
  email: string;
  password: string;
}

export const validateLoginDto = (body: any): { value?: LoginDto; errors?: string[] } => {
  const errors: string[] = [];
  const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : '';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: ['Le corps de la requête doit être un objet JSON.'] };
  }

  if (!emailPattern.test(email)) {
    errors.push("L'email est requis et doit être valide.");
  }

  if (typeof body.password !== 'string' || body.password.length < 6) {
    errors.push('Le mot de passe est requis et doit contenir au moins 6 caractères.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  const value: LoginDto = {
    email,
    password: body.password,
  };

  return { value };
};

