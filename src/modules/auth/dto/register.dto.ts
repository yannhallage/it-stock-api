export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export const validateRegisterDto = (body: any): { value?: RegisterDto; errors?: string[] } => {
  const errors: string[] = [];

  if (typeof body.name !== 'string' || body.name.trim().length < 2) {
    errors.push('Le nom est requis et doit contenir au moins 2 caractères.');
  }

  if (typeof body.email !== 'string' || !body.email.includes('@')) {
    errors.push("L'email est requis et doit être valide.");
  }

  if (typeof body.password !== 'string' || body.password.length < 6) {
    errors.push('Le mot de passe est requis et doit contenir au moins 6 caractères.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  const value: RegisterDto = {
    name: body.name.trim(),
    email: body.email.toLowerCase().trim(),
    password: body.password,
  };

  return { value };
};

