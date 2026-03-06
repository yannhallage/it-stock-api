import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma/client';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { env } from '../../config/env';
import { logger } from '../../logger';

export class AuthService {
  async register(data: RegisterDto) {
    logger.info({ email: data.email }, '[AuthService] Tentative inscription utilisateur');
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      logger.warn({ email: data.email }, '[AuthService] Inscription échouée: utilisateur déjà existant');
      throw new Error('Un utilisateur avec cet email existe déjà.');
    }

    logger.debug({ email: data.email }, '[AuthService] Hachage du mot de passe');
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info({ id: user.id, email: user.email }, '[AuthService] Utilisateur créé avec succès');
    return user;
  }

  async login(data: LoginDto) {
    logger.info(`[AuthService] Tentative connexion pour l'email`);
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      logger.warn('[AuthService] Connexion échouée: utilisateur non trouvé');
      throw new Error('Identifiants invalides.');
    }

    const isValid = await bcrypt.compare(data.password, user.password);

    if (!isValid) {
      logger.warn('[AuthService] Connexion échouée: mot de passe incorrect');
      throw new Error('Identifiants invalides.');
    }

    logger.info('[AuthService] Connexion réussie');

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
      },
      env.jwtSecret,
      {
        expiresIn: '1h',
      },
    );

    logger.debug('[AuthService] JWT généré (expire dans 1h)');
    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: 3600,
    };
  }

  async getProfile(userId: string) {
    logger.debug('[AuthService] Récupération profil utilisateur');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      logger.warn("[AuthService] Utilisateur non trouvé");
      throw new Error("L'utilisateur n'existe pas.");
    }

    logger.info({ userId: user.id, email: user.email }, '[AuthService] Profil utilisateur récupéré');
    return user;
  }
}
